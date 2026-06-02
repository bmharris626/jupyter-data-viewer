# JupyterLab Data Viewer Extension

[![PyPI](https://img.shields.io/pypi/v/jupyterlab-data-viewer.svg)](https://pypi.org/project/jupyterlab-data-viewer/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A JupyterLab 4 extension for viewing and querying tabular data files (CSV, TSV, JSON, Parquet) with a built-in DuckDB SQL engine.

## Description

Load any supported data file directly from the JupyterLab file browser and explore it with SQL queries, sorted columns, and pagination. The backend uses DuckDB for efficient paged reads and SQL execution, while the React-based frontend provides a sortable data table and query editor panel.

## Quick Start

```bash
pip install jupyterlab-data-viewer
```

Open JupyterLab, right-click any CSV, TSV, JSON, or Parquet file, and select **"Open with Data Viewer"**.

## Installation & Setup

### From PyPI (recommended)

```bash
pip install jupyterlab-data-viewer
```

No JupyterLab rebuild is needed — this is a prebuilt (federated) extension.

### From source (development)

```bash
pip install -e .
jupyter labextension develop . --overwrite
jlpm build       # compile TypeScript once
```

### JupyterHub deployment

```bash
pip install jupyterlab-data-viewer
```

The wheel is self-contained: all static JS and the server auto-enable config are bundled.

## Usage

### File Browser

Right-click a supported file (CSV, TSV, JSON, Parquet) → **Open with Data Viewer**.

### SQL Queries

The viewer panel includes a SQL query editor. Table alias is always `df`:

```sql
SELECT * FROM df WHERE revenue > 1000 ORDER BY revenue DESC
```

Press `Ctrl+Enter` to execute. Results appear in a second data table below the query.

### Column Sorting

Click any column header to sort ascending; click again for descending. Null values sort last.

## Configuration Reference

No configurable settings are exposed at runtime. Server config is auto-enabled via `jupyter-config/jupyter_server_config.d/jupyterlab_data_viewer.json`.

## Project Structure

```
jupyterlab_data_viewer/            # Python package (flat layout)
├── __init__.py                    # Extension entry points
├── _version.py                    # Version (auto from package.json)
├── data_viewer.py                 # read_data_file, execute_sql_query
├── handlers.py                    # Tornado handlers: FileHandler, QueryHandler
└── labextension/                  # Built JS bundle
src/                               # TypeScript sources
├── index.ts                       # Plugin entry point
├── commands.ts                    # DataViewerFactory
├── services/data-service.ts       # ApiClient + DataService
└── components/
    ├── data-table.tsx             # React table with sort/pagination
    ├── query-editor.tsx           # SQL textarea, Ctrl+Enter
    └── data-viewer-panel.tsx      # Top-level panel
lib/                               # Compiled JS (src/ → lib/)
tests/                             # Jest unit tests + mocks
├── unit/                          # TS test files
├── mocks/                         # Sample CSV/TSV/JSON/Parquet
├── jest.config.js
jupyter-config/
└── jupyter_server_config.d/
    └── jupyterlab_data_viewer.json  # Server auto-enable
package.json
pyproject.toml
tsconfig.json
install.json
LICENSE
```

## Contributing

- Frontend tests (Jest): `jlpm test`
- Python tests (pytest): `pytest tests/python/` or `pytest`
- Build TypeScript: `jlpm build`
- Watch mode: `jlpm dev`
- Build distributable wheel: `python3 -m build`

## Changelog

No changelog is maintained. See the git history for release notes.

## License

MIT. See [LICENSE](LICENSE).
