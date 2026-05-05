"""Core data processing functionality."""

import os
from typing import Any, Dict

import duckdb
import pandas as pd


def read_data_file(file_path: str) -> pd.DataFrame:
    """Read data from file based on extension."""
    _, ext = os.path.splitext(file_path)
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


def execute_sql_query(data: pd.DataFrame, query: str) -> pd.DataFrame:
    """Execute SQL query using DuckDB."""
    try:
        with duckdb.connect(database=':memory:') as con:
            con.register('df', data)
            return con.execute(query).fetchdf()
    except Exception as e:
        raise ValueError(f"SQL execution failed: {str(e)}")


def process_paginated_data(data: pd.DataFrame, page: int, page_size: int) -> Dict[str, Any]:
    """Slice data for a single page."""
    start_idx = (page - 1) * page_size
    paginated_data = data.iloc[start_idx:start_idx + page_size].to_dict('records')
    return {
        'data': paginated_data,
        'total_rows': len(data),
        'columns': list(data.columns),
    }
