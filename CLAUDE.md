# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Layout

All extension code lives at the repository root.

```
.
├── src/index.ts              # TypeScript entry point (thin — just activates the plugin)
├── lib/                      # Compiled JS output (source of truth for current TS logic)
│   ├── index.js
│   ├── commands.js           # Context-menu command: openFileViewer
│   ├── services/data-service.js   # ApiClient + DataService (HTTP layer)
│   ├── components/
│   │   ├── data-table.js     # React table with client-side sort, 1000-row display cap
│   │   ├── query-editor.js   # SQL textarea, Ctrl+Enter to execute
│   │   └── data-viewer-panel.js  # Top-level panel composing table + editor
│   └── models/data-model.js  # (empty — interfaces not yet defined)
├── build/lib/                # Built Python package
│   ├── data_viewer.py        # read_data_file, execute_sql_query, process_paginated_data
│   └── lab/api/data_api.py   # FastAPI router: GET /api/data/file, POST /api/data/query
├── tests/
│   ├── jest.config.js
│   ├── unit/                 # TS unit tests (test-*.ts)
│   └── mocks/                # Sample CSV/TSV/JSON/Parquet fixtures
├── package.json
├── pyproject.toml
└── tsconfig.json
```

## Commands

All commands run from the repository root.

```bash
# Development install
pip install -e .
jupyter labextension develop . --overwrite

# Build TypeScript (src/ → lib/)
jlpm build          # one-shot
jlpm dev            # watch mode

# Run frontend tests
jlpm test           # jest (all tests/unit/*.ts)

# Python tests
pytest              # requires pytest dev dependency
```

## Architecture

**Client-server:** The JupyterLab frontend communicates with a Python FastAPI backend embedded in the Jupyter server.

**Data flow:**
1. User right-clicks a CSV/TSV/JSON/Parquet file → `commands.js:openFileViewer` fires
2. `DataService` calls `ApiClient` → `GET /api/data/file?path=...`
3. Python `read_data_file()` dispatches by extension (pandas for CSV/TSV/JSON, PyArrow for Parquet)
4. For SQL queries: `POST /api/data/query` → DuckDB executes against the DataFrame registered as `df`
5. `DataViewerPanel` renders `DataTable` (original data) and optionally `QueryEditor` + second `DataTable` (query results)

**Key constraints:**
- `DataTable` caps display at 1000 rows client-side; larger files need server-side pagination (not yet implemented — `process_paginated_data` exists in Python but is unused)
- SQL table alias is always `df` (e.g. `SELECT * FROM df WHERE col > 10`)
- TypeScript sources for components exist only as compiled `lib/*.js` — the `src/` directory only contains `index.ts`. New TS source files should be added to `src/` and compiled to `lib/`

**Python package layout:** `pyproject.toml` sets `where = ["src"]`, so the installable Python package should live at `src/jupyterlab_data_viewer/`. The current Python logic is in `build/lib/` (build artifact). When adding Python source, place it in `src/jupyterlab_data_viewer/`.
