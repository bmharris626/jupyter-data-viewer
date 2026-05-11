# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Layout

```
.
├── jupyterlab_data_viewer/       # Python package (flat layout)
│   ├── __init__.py               # Extension entry points
│   ├── _version.py               # Version (auto-updated from package.json by hatch)
│   ├── data_viewer.py            # read_data_file, read_data_file_paged, execute_sql_query
│   ├── handlers.py               # Tornado handlers: FileHandler, QueryHandler
│   └── labextension/             # Built JS bundle (output of jlpm build:labextension)
│       ├── package.json
│       └── static/
├── src/                          # TypeScript sources
│   ├── index.ts                  # Plugin entry point
│   ├── commands.ts               # DataViewerFactory (context-menu open)
│   ├── services/data-service.ts  # ApiClient + DataService (HTTP layer)
│   └── components/
│       ├── data-table.tsx        # React table with sort and pagination
│       ├── query-editor.tsx      # SQL textarea, Ctrl+Enter to execute
│       └── data-viewer-panel.tsx # Top-level panel composing table + editor
├── lib/                          # Compiled JS output (src/ → lib/, via tsc)
├── install.json                  # JupyterLab extension registration (required for pip install)
├── jupyter-config/
│   └── jupyter_server_config.d/
│       └── jupyterlab_data_viewer.json  # Server auto-enable config
├── tests/
│   ├── jest.config.js
│   ├── unit/                     # TS unit tests (test-*.ts)
│   └── mocks/                    # Sample CSV/TSV/JSON/Parquet fixtures
├── package.json
├── pyproject.toml                # hatchling build backend + hatch-jupyter-builder
└── tsconfig.json
```

## Commands

All commands run from the repository root.

```bash
# Development install (installs Python package + links labextension)
pip install -e .

# Build TypeScript (src/ → lib/) and labextension bundle
jlpm build           # one-shot (lib + labextension)
jlpm build:prod      # clean + rebuild for release
jlpm dev             # watch mode (lib only)

# Run frontend tests
jlpm test            # jest (all tests/unit/*.ts)

# Python tests
pytest               # requires pytest dev dependency

# Build distributable wheel
python3 -m build     # outputs to dist/
```

## Architecture

**Client-server:** The JupyterLab frontend communicates with a Python Tornado backend embedded in the Jupyter server.

**Data flow:**
1. User opens a CSV/TSV/JSON/Parquet file → `DataViewerFactory` creates a widget
2. `DataService` calls `ApiClient` → `GET /data-viewer/file?path=...&offset=0&limit=2000`
3. Python `read_data_file_paged()` uses DuckDB for efficient paged reads (CSV/TSV/Parquet) or pandas (JSON)
4. For SQL queries: `POST /data-viewer/query` → DuckDB executes against the full DataFrame registered as `df`
5. `DataViewerPanel` renders `DataTable` (original data) and optionally `QueryEditor` + second `DataTable` (query results)

**Key constraints:**
- Server-side pagination at 2000 rows/page; `DataTable` renders whatever the server returns
- SQL table alias is always `df` (e.g. `SELECT * FROM df WHERE col > 10`)
- Parquet files use `modelName: 'base64'` factory to avoid UTF-8 decode errors in the ContentsManager

## Build system

Uses `hatchling` + `hatch-jupyter-builder` (same as the official JupyterLab extension template).
- `hatch-nodejs-version` reads version from `package.json` so version is single-sourced there
- `hatch-jupyter-builder` runs `jlpm build:prod` during `pip install` if the labextension bundle is not already present (`skip-if-exists` check)
- `shared-data` in `pyproject.toml` installs labextension to `share/jupyter/labextensions/jupyterlab-data-viewer/` and server config to `etc/jupyter/jupyter_server_config.d/` — these are the paths JupyterLab and Jupyter Server scan at startup

## JupyterHub deployment

```bash
pip install jupyterlab-data-viewer
# No jupyter lab build needed — this is a prebuilt (federated) extension
```

The wheel is self-contained: all static JS and the server auto-enable config are bundled. No Node.js needed on the hub.
