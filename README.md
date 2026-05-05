# JupyterLab Data Viewer Extension

A JupyterLab 4 extension for viewing and querying tabular data files (CSV, TSV, JSON, Parquet) with a built-in DuckDB SQL engine.

## Features

- **Multi-format support**: CSV, TSV, JSON, Parquet
- **SQL query engine**: Run DuckDB SQL against any loaded file; table alias is `df`
- **Sortable table**: Click column headers; nulls sort last
- **Context menu**: Right-click a supported file → "Open with Data Viewer"
- **Column sorting**: Ascending/descending toggle per column

## Requirements

- JupyterLab >= 4.0
- Python >= 3.9

## Installation

```bash
pip install jupyterlab-data-viewer
```

## Development Setup

All commands run from the repository root:

```bash
pip install -e .
jupyter labextension develop . --overwrite

jlpm build       # compile TypeScript once
jlpm dev         # watch mode
```

## Running Tests

```bash
# Frontend unit + integration tests (Jest)
jlpm test

# Python backend tests (pytest)
pytest tests/python/
```

## Architecture

Client-server extension following the standard JupyterLab pattern:

- **Frontend** (TypeScript/React, compiled to `lib/`): plugin entry point, context menu registration, sortable data table, SQL query editor, fetch-based API client
- **Backend** (Python, `src/jupyterlab_data_viewer/`): two `jupyter_server` tornado handlers serving `GET /data-viewer/file` and `POST /data-viewer/query`; pandas for file I/O; DuckDB for SQL execution

See the sections below for architecture detail.

## License

BSD-3-Clause
