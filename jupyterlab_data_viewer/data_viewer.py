"""Core data processing functionality."""

import os
from typing import List, Tuple, Optional
from dataclasses import dataclass
from time import time

import duckdb
import pandas as pd
import pyarrow.parquet as pq


@dataclass
class FileMetadata:
  """Cached metadata for a file."""
  file_path: str
  total_rows: int
  columns: List[str]
  file_mtime: float
  cached_at: float


class MetadataCache:
  """In-memory cache for file metadata to avoid repeated full-file scans."""

  def __init__(self, max_size: int = 20):
    self.cache: dict[str, FileMetadata] = {}
    self.max_size = max_size

  def get(self, file_path: str) -> Optional[FileMetadata]:
    """Get cached metadata if valid (file hasn't changed)."""
    if file_path not in self.cache:
      return None
    meta = self.cache[file_path]
    try:
      current_mtime = os.path.getmtime(file_path)
      if meta.file_mtime == current_mtime:
        return meta
    except OSError:
      pass
    del self.cache[file_path]
    return None

  def set(self, file_path: str, total_rows: int, columns: List[str]) -> None:
    """Cache metadata for a file."""
    try:
      file_mtime = os.path.getmtime(file_path)
    except OSError:
      return
    if len(self.cache) >= self.max_size:
      oldest = min(self.cache.values(), key=lambda m: m.cached_at)
      del self.cache[oldest.file_path]
    self.cache[file_path] = FileMetadata(
        file_path=file_path,
        total_rows=total_rows,
        columns=columns,
        file_mtime=file_mtime,
        cached_at=time(),
    )


_metadata_cache = MetadataCache()


def read_data_file(file_path: str) -> pd.DataFrame:
    """Read full file into DataFrame. Used by SQL query path (needs full data for DuckDB registration)."""
    _, ext = os.path.splitext(file_path.lower())
    if ext == '.csv':
        return pd.read_csv(file_path)
    elif ext == '.tsv':
        return pd.read_csv(file_path, sep='\t')
    elif ext == '.parquet':
        return pd.read_parquet(file_path)
    elif ext == '.json':
        return pd.read_json(file_path)
    else:
        raise ValueError(f"Unsupported file type: {ext}")


def read_data_file_paged(
    file_path: str, offset: int = 0, limit: int = 2000
) -> Tuple[pd.DataFrame, int, List[str]]:
    """Read one page of data from a file using DuckDB for efficient LIMIT/OFFSET.

    Uses metadata caching to avoid repeated full-file scans. Only reads the
    specific rows needed (LIMIT/OFFSET).
    Returns (page_dataframe, total_row_count, column_names).
    """
    _, ext = os.path.splitext(file_path.lower())

    # Check cache first
    cached = _metadata_cache.get(file_path)
    if cached:
        total = cached.total_rows
        columns = cached.columns
    else:
        # Cache miss — read metadata (format-specific optimization)
        if ext in ('.csv', '.tsv'):
            total, columns = _read_csv_metadata(file_path, ext)
        elif ext == '.parquet':
            total, columns = _read_parquet_metadata(file_path)
        elif ext == '.json':
            total, columns = _read_json_metadata(file_path)
        else:
            raise ValueError(f"Unsupported file type: {ext}")
        _metadata_cache.set(file_path, total, columns)

    # Read the page using DuckDB (efficient LIMIT/OFFSET)
    with duckdb.connect(database=':memory:') as con:
        if ext in ('.csv', '.tsv'):
            delim = '\t' if ext == '.tsv' else ','
            page_df = con.execute(
                "SELECT * FROM read_csv_auto(?, delim=?) LIMIT ? OFFSET ?",
                [file_path, delim, limit, offset],
            ).fetchdf()
        elif ext == '.parquet':
            page_df = con.execute(
                "SELECT * FROM read_parquet(?) LIMIT ? OFFSET ?",
                [file_path, limit, offset],
            ).fetchdf()
        elif ext == '.json':
            # JSON already in memory cache; fetch page from cached df
            full_df = _get_cached_json(file_path)
            page_df = full_df.iloc[offset : offset + limit].copy()

    return page_df, total, columns


def _read_csv_metadata(file_path: str, ext: str) -> Tuple[int, List[str]]:
  """Read CSV/TSV metadata without full scan (schema only, count via DuckDB)."""
  delim = '\t' if ext == '.tsv' else ','
  with duckdb.connect(database=':memory:') as con:
    # Get column names from LIMIT 0 query (no data scan)
    desc = con.execute(
        "SELECT * FROM read_csv_auto(?, delim=?) LIMIT 0", [file_path, delim]
    )
    columns = [d[0] for d in desc.description]
    # Count rows (unavoidable for CSV, but cached now)
    total = con.execute(
        "SELECT COUNT(*) FROM read_csv_auto(?, delim=?)", [file_path, delim]
    ).fetchone()[0]
  return total, columns


def _read_parquet_metadata(file_path: str) -> Tuple[int, List[str]]:
  """Read Parquet metadata efficiently from file header."""
  parquet_file = pq.ParquetFile(file_path)
  total = parquet_file.metadata.num_rows
  columns = parquet_file.schema.names
  return total, columns


_json_cache: dict[str, pd.DataFrame] = {}


def _read_json_metadata(file_path: str) -> Tuple[int, List[str]]:
  """Read JSON metadata. Caches full DataFrame since JSON requires full load."""
  if file_path not in _json_cache:
    try:
      mtime = os.path.getmtime(file_path)
    except OSError:
      mtime = 0
    _json_cache[file_path] = (pd.read_json(file_path), mtime)

  df, cached_mtime = _json_cache[file_path]
  try:
    current_mtime = os.path.getmtime(file_path)
    if current_mtime != cached_mtime:
      df = pd.read_json(file_path)
      _json_cache[file_path] = (df, current_mtime)
  except OSError:
    pass

  return len(df), list(df.columns)


def _get_cached_json(file_path: str) -> pd.DataFrame:
  """Retrieve cached JSON DataFrame."""
  if file_path in _json_cache:
    return _json_cache[file_path][0]
  # Fallback (shouldn't reach here if _read_json_metadata was called)
  df = pd.read_json(file_path)
  return df


def execute_sql_query(data: pd.DataFrame, query: str) -> pd.DataFrame:
    """Execute SQL query using DuckDB against a DataFrame registered as 'df'."""
    try:
        with duckdb.connect(database=':memory:') as con:
            con.register('df', data)
            return con.execute(query).fetchdf()
    except Exception as e:
        raise ValueError(f"SQL execution failed: {str(e)}")
