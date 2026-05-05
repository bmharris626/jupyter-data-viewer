# JupyterLab Data Viewer

A JupyterLab 4 extension for viewing and querying tabular data files directly in the file browser.

## Features

- **Multi-format support**: CSV, TSV, JSON, Parquet
- **SQL query engine**: Execute DuckDB SQL against any loaded file (table alias is `df`)
- **Sortable table**: Click column headers to sort; nulls sort last
- **Context menu integration**: Right-click a supported file in the file browser and select "Open with Data Viewer"

## Requirements

- JupyterLab >= 4.0
- Python >= 3.9

## Installation

```bash
pip install jupyterlab-data-viewer
```

## Development

```bash
# Install the Python package in editable mode and link the frontend
pip install -e .
jupyter labextension develop . --overwrite

# Build TypeScript → lib/
jlpm build

# Watch mode (rebuilds on save)
jlpm dev
```

## Running Tests

```bash
# Frontend (Jest)
jlpm test

# Python backend (pytest)
pytest tests/python/
```

## Architecture

The extension uses a standard JupyterLab client-server split:

**Frontend** (`lib/`, TypeScript/React compiled from `src/`)
- `index.js` — plugin entry point; registers the command and context menu item
- `commands.js` — `openFileViewer`: resolves the selected file path and calls the data service
- `components/data-table.js` — sortable table, capped at 1 000 displayed rows
- `components/query-editor.js` — SQL textarea; Ctrl+Enter to execute
- `components/data-viewer-panel.js` — top-level panel composing the table and editor
- `services/data-service.js` — `ApiClient` (fetch wrapper) and `DataService`

**Backend** (`src/jupyterlab_data_viewer/`, Python)
- `handlers.py` — two `jupyter_server` tornado `APIHandler`s:
  - `GET /data-viewer/file?path=<path>` — read a file and return its data
  - `POST /data-viewer/query` — execute a DuckDB SQL query against a file
- `data_viewer.py` — `read_data_file` (pandas dispatch by extension), `execute_sql_query` (DuckDB), `process_paginated_data`

**Dependencies**
| Layer | Libraries |
|---|---|
| Frontend | `@jupyterlab/application`, `@jupyterlab/apputils`, `@jupyterlab/filebrowser`, `react`, `react-dom` |
| Backend | `jupyterlab`, `jupyter_server`, `pandas`, `pyarrow`, `duckdb` |

## SQL Usage

Queries run against the entire loaded file. The DataFrame is always registered as `df`:

```sql
SELECT * FROM df WHERE age > 30 ORDER BY name LIMIT 100
```
