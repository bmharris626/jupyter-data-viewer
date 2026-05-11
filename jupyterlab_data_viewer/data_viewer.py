"""Core data processing functionality."""

import os
from typing import List, Tuple

import duckdb
import pandas as pd


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

    For CSV/TSV/Parquet, DuckDB reads only the rows it needs from disk.
    Returns (page_dataframe, total_row_count, column_names).
    """
    _, ext = os.path.splitext(file_path.lower())

    with duckdb.connect(database=':memory:') as con:
        if ext in ('.csv', '.tsv'):
            delim = '\t' if ext == '.tsv' else ','
            total: int = con.execute(
                "SELECT COUNT(*) FROM read_csv_auto(?, delim=?)", [file_path, delim]
            ).fetchone()[0]
            desc = con.execute(
                "SELECT * FROM read_csv_auto(?, delim=?) LIMIT 0", [file_path, delim]
            )
            columns = [d[0] for d in desc.description]
            page_df = con.execute(
                "SELECT * FROM read_csv_auto(?, delim=?) LIMIT ? OFFSET ?",
                [file_path, delim, limit, offset],
            ).fetchdf()

        elif ext == '.parquet':
            total = con.execute(
                "SELECT COUNT(*) FROM read_parquet(?)", [file_path]
            ).fetchone()[0]
            desc = con.execute(
                "SELECT * FROM read_parquet(?) LIMIT 0", [file_path]
            )
            columns = [d[0] for d in desc.description]
            page_df = con.execute(
                "SELECT * FROM read_parquet(?) LIMIT ? OFFSET ?",
                [file_path, limit, offset],
            ).fetchdf()

        elif ext == '.json':
            full_df = pd.read_json(file_path)
            total = len(full_df)
            columns = list(full_df.columns)
            page_df = full_df.iloc[offset: offset + limit].copy()

        else:
            raise ValueError(f"Unsupported file type: {ext}")

    return page_df, total, columns


def execute_sql_query(data: pd.DataFrame, query: str) -> pd.DataFrame:
    """Execute SQL query using DuckDB against a DataFrame registered as 'df'."""
    try:
        with duckdb.connect(database=':memory:') as con:
            con.register('df', data)
            return con.execute(query).fetchdf()
    except Exception as e:
        raise ValueError(f"SQL execution failed: {str(e)}")
