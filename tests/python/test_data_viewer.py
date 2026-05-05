"""Tests for src/jupyterlab_data_viewer/data_viewer.py"""

import os
import pytest
import pandas as pd

# Resolve the mocks directory relative to this file
MOCKS_DIR = os.path.join(os.path.dirname(__file__), '..', 'mocks')


def mock_path(filename):
    return os.path.join(MOCKS_DIR, filename)


# ---------------------------------------------------------------------------
# read_data_file
# ---------------------------------------------------------------------------

from jupyterlab_data_viewer.data_viewer import read_data_file, execute_sql_query


class TestReadDataFile:
    def test_reads_csv(self):
        df = read_data_file(mock_path('test_data.csv'))
        assert isinstance(df, pd.DataFrame)
        assert list(df.columns) == ['name', 'age', 'city']
        assert len(df) == 4

    def test_reads_tsv(self):
        df = read_data_file(mock_path('test_data.tsv'))
        assert isinstance(df, pd.DataFrame)
        assert len(df) > 0

    def test_reads_json(self):
        df = read_data_file(mock_path('test_data.json'))
        assert isinstance(df, pd.DataFrame)
        assert 'name' in df.columns

    def test_reads_parquet(self):
        df = read_data_file(mock_path('test_data.parquet'))
        assert isinstance(df, pd.DataFrame)
        assert len(df) > 0

    def test_raises_on_unsupported_extension(self, tmp_path):
        bad_file = tmp_path / 'data.txt'
        bad_file.write_text('hello')
        with pytest.raises(ValueError, match='Unsupported file type'):
            read_data_file(str(bad_file))

    def test_raises_on_missing_file(self):
        with pytest.raises(Exception):
            read_data_file('/nonexistent/path/file.csv')


# ---------------------------------------------------------------------------
# execute_sql_query
# ---------------------------------------------------------------------------

class TestExecuteSqlQuery:
    @pytest.fixture
    def sample_df(self):
        return pd.DataFrame({
            'name': ['Alice', 'Bob', 'Charlie'],
            'age': [30, 25, 35],
            'city': ['New York', 'Los Angeles', 'Chicago'],
        })

    def test_select_all(self, sample_df):
        result = execute_sql_query(sample_df, 'SELECT * FROM df')
        assert len(result) == 3
        assert set(result.columns) == {'name', 'age', 'city'}

    def test_where_filter(self, sample_df):
        result = execute_sql_query(sample_df, 'SELECT * FROM df WHERE age > 28')
        assert len(result) == 2
        assert set(result['name'].tolist()) == {'Alice', 'Charlie'}

    def test_select_columns(self, sample_df):
        result = execute_sql_query(sample_df, 'SELECT name, age FROM df')
        assert list(result.columns) == ['name', 'age']
        assert 'city' not in result.columns

    def test_aggregation(self, sample_df):
        result = execute_sql_query(sample_df, 'SELECT AVG(age) AS avg_age FROM df')
        assert abs(result['avg_age'].iloc[0] - 30.0) < 0.01

    def test_order_by(self, sample_df):
        result = execute_sql_query(sample_df, 'SELECT name FROM df ORDER BY age ASC')
        assert result['name'].tolist() == ['Bob', 'Alice', 'Charlie']

    def test_invalid_sql_raises_value_error(self, sample_df):
        with pytest.raises(ValueError, match='SQL execution failed'):
            execute_sql_query(sample_df, 'THIS IS NOT SQL')

    def test_reference_to_nonexistent_column_raises_value_error(self, sample_df):
        with pytest.raises(ValueError, match='SQL execution failed'):
            execute_sql_query(sample_df, 'SELECT nonexistent FROM df')

    def test_connection_is_released_after_query(self, sample_df):
        # Run two queries in sequence to confirm the connection from the
        # first query does not interfere with the second (context manager closed it).
        r1 = execute_sql_query(sample_df, 'SELECT * FROM df WHERE age < 30')
        r2 = execute_sql_query(sample_df, 'SELECT * FROM df WHERE age >= 30')
        assert len(r1) + len(r2) == 3
