import { useState, CSSProperties } from 'react';
import { DataTable } from './data-table';
import { DataResponse } from '../services/data-service';

const PAGE_SIZE = 100;

// SVG Icons
const IconColumns = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M1 2.5A.5.5 0 0 1 1.5 2h13a.5.5 0 0 1 0 1h-13A.5.5 0 0 1 1 2.5zm0 4A.5.5 0 0 1 1.5 6h13a.5.5 0 0 1 0 1h-13A.5.5 0 0 1 1 6.5zm0 4a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13a.5.5 0 0 1-.5-.5z" />
  </svg>
);

const IconFilter = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5v-2z" />
  </svg>
);

const IconChevronLeft = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" />
  </svg>
);

const IconChevronRight = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
  </svg>
);

const IconClose = () => (
  <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854z" />
  </svg>
);

interface IDataViewerProps {
  data: any[];
  columns: string[];
  totalRows?: number;
  loading: boolean;
  error?: string;
  filePath: string;
  onExecuteQuery?: (query: string) => Promise<DataResponse>;
  onFetchPage?: (offset: number, limit: number) => Promise<DataResponse>;
}

const DataViewerPanel: React.FC<IDataViewerProps> = ({
  data: initialData,
  columns: initialColumns,
  totalRows: initialTotalRows = 0,
  loading,
  error,
  filePath,
  onExecuteQuery,
  onFetchPage
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const [offset, setOffset] = useState(0);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [whereClause, setWhereClause] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [filterError, setFilterError] = useState<string | null>(null);
  const [isFetchingPage, setIsFetchingPage] = useState(false);
  const [data, setData] = useState(initialData);
  const [columns, setColumns] = useState(initialColumns);
  const [totalRows, setTotalRows] = useState(initialTotalRows);

  const toggleColumn = (col: string) => {
    setHiddenColumns(prev => {
      const next = new Set(prev);
      if (next.has(col)) next.delete(col);
      else next.add(col);
      return next;
    });
  };

  const toggleAllColumns = (allCols: string[]) => {
    setHiddenColumns(
      hiddenColumns.size === 0 ? new Set(allCols) : new Set()
    );
  };

  const handleExecuteFilter = async () => {
    if (!whereClause.trim() || isExecuting || !onExecuteQuery) return;
    setIsExecuting(true);
    setFilterError(null);
    try {
      const result = await onExecuteQuery(
        `SELECT * FROM df WHERE ${whereClause.trim()}`
      );
      setData(result.data);
      setColumns(result.columns);
      setTotalRows(result.total_rows ?? result.data.length);
      setOffset(0);
      setShowFilterDialog(false);
    } catch (err) {
      setFilterError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsExecuting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      handleExecuteFilter();
    }
    if (e.key === 'Escape') setShowFilterDialog(false);
  };

  const navigatePage = async (newOffset: number) => {
    if (!onFetchPage || isFetchingPage) return;
    setIsFetchingPage(true);
    try {
      const result = await onFetchPage(newOffset, PAGE_SIZE);
      setData(result.data);
      setColumns(result.columns);
      setTotalRows(result.total_rows ?? result.data.length);
      setOffset(newOffset);
    } finally {
      setIsFetchingPage(false);
    }
  };

  const visibleColumns = columns.filter(c => !hiddenColumns.has(c));
  const hasPrevious = offset > 0;
  const hasNext = offset + PAGE_SIZE < totalRows;
  const end = Math.min(offset + data.length, totalRows);

  if (loading) {
    return (
      <div style={{ ...s.root, alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--jp-ui-font-color2, #888)', fontSize: '13px' }}>
          Loading {filePath}…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ ...s.root, alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--jp-error-color1, #c62828)', fontSize: '13px' }}>
          Error: {error}
        </div>
      </div>
    );
  }

  const showPagination = !!onFetchPage && totalRows > 0;
  const startRow = totalRows === 0 ? 0 : offset + 1;

  return (
    <div style={{
      ...s.root,
      ...(sidebarOpen ? s.layoutWithSidebar : {})
    }}>
      {/* Sidebar */}
      {sidebarOpen && (
        <aside style={s.sidebar}>
          <div style={s.sidebarHeader}>
            <span style={s.sidebarTitle}>Variables</span>
            <span style={s.sidebarCount}>
              {visibleColumns.length}/{columns.length}
            </span>
            <button
              style={s.sidebarToggleAll}
              onClick={() => toggleAllColumns(columns)}
              title={hiddenColumns.size === 0 ? 'Deselect all' : 'Select all'}
            >
              {hiddenColumns.size === 0 ? 'Select all' : 'Deselect all'}
            </button>
            <button
              style={s.sidebarClose}
              onClick={() => setSidebarOpen(false)}
              title="Close panel"
            >
              <IconClose />
            </button>
          </div>
          <div style={s.variableList}>
            {columns.map(col => {
              const visible = !hiddenColumns.has(col);
              return (
                <label
                  key={col}
                  style={{
                    ...s.variable,
                    opacity: visible ? 1 : 0.5
                  }}
                >
                  <input
                    type="checkbox"
                    checked={visible}
                    onChange={() => toggleColumn(col)}
                    style={s.checkbox}
                  />
                  <span style={s.variableName}>{col}</span>
                </label>
              );
            })}
          </div>
        </aside>
      )}

      {/* Main area */}
      <main style={s.main}>
        {/* Toolbar */}
        <div style={s.toolbar}>
          <div style={s.toolbarGroup}>
            <button
              className={sidebarOpen ? 'active' : ''}
              style={{
                ...s.toolbarBtn,
                ...(sidebarOpen ? s.toolbarBtnActive : {})
              }}
              title={sidebarOpen ? 'Hide variables panel' : 'Show variables panel'}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <IconColumns />
              <span>Variables</span>
            </button>
            <button
              style={{
                ...s.toolbarBtn,
                ...(whereClause ? s.toolbarBtnFilterActive : {})
              }}
              title={whereClause ? `Active filter: ${whereClause}` : 'Filter rows'}
              onClick={() => setShowFilterDialog(true)}
            >
              <IconFilter />
              <span>Filter{whereClause ? ' ●' : ''}</span>
            </button>
            {whereClause && (
              <button
                style={s.iconBtn}
                title="Clear filter"
                onClick={() => {
                  setWhereClause('');
                  setOffset(0);
                  setData(initialData);
                  setColumns(initialColumns);
                  setTotalRows(initialTotalRows);
                }}
              >
                <IconClose />
              </button>
            )}
          </div>

          <div style={s.toolbarGroupRight}>
            <span style={s.rowInfo}>
              {isFetchingPage
                ? 'Loading…'
                : totalRows === 0
                ? 'No rows'
                : `${startRow}–${end} of ${totalRows.toLocaleString()}`}
            </span>
            {showPagination && (
              <div style={s.paginationButtons}>
                <button
                  style={s.iconBtn}
                  disabled={!hasPrevious || isFetchingPage}
                  title="Previous page"
                  onClick={() => navigatePage(Math.max(0, offset - PAGE_SIZE))}
                >
                  <IconChevronLeft />
                </button>
                <button
                  style={s.iconBtn}
                  disabled={!hasNext || isFetchingPage}
                  title="Next page"
                  onClick={() => navigatePage(offset + PAGE_SIZE)}
                >
                  <IconChevronRight />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Table area */}
        <div style={s.tableArea}>
          {isFetchingPage ? (
            <div style={s.loadingOverlay}>Loading…</div>
          ) : (
            <DataTable data={data} columns={visibleColumns} />
          )}
        </div>
      </main>

      {/* Filter dialog */}
      {showFilterDialog && (
        <>
          <div onClick={() => setShowFilterDialog(false)} style={s.backdrop} />
          <div style={s.dialog}>
            <div style={s.dialogHeader}>
              <span style={s.dialogTitle}>Filter Rows</span>
              <button
                onClick={() => setShowFilterDialog(false)}
                style={s.dialogClose}
                title="Close"
              >
                <IconClose />
              </button>
            </div>
            <div style={s.dialogBody}>
              <textarea
                value={whereClause}
                onChange={e => setWhereClause(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={3}
                spellCheck={false}
                autoFocus
                placeholder="age > 30 AND name = 'Smith'"
                style={s.filterTextarea}
              />
              <div style={s.filterHintRow}>
                <span style={s.filterHint}>
                  Supports =, !=, &lt;, &gt;, AND, OR, NOT, and LIKE with % wildcards (e.g. Name LIKE '%Smith%'). Column names are case-insensitive; names with spaces use backticks: `my col`.
                </span>
                <button
                  type="button"
                  style={s.clearBtn}
                  onClick={() => setWhereClause('')}
                >
                  Clear
                </button>
              </div>
            </div>
            <div style={s.dialogFooter}>
              <button
                onClick={() => setShowFilterDialog(false)}
                style={s.dialogButtonCancel}
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteFilter}
                disabled={isExecuting || !whereClause.trim()}
                style={{
                  ...s.dialogButtonApply,
                  opacity: isExecuting || !whereClause.trim() ? 0.55 : 1,
                  cursor: isExecuting || !whereClause.trim() ? 'not-allowed' : 'pointer'
                }}
              >
                {isExecuting ? 'Running…' : 'Apply'}
              </button>
            </div>
            {filterError && <div style={s.filterError}>{filterError}</div>}
          </div>
        </>
      )}
    </div>
  );
};

export { DataViewerPanel };

const s: Record<string, CSSProperties> = {
  root: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    fontFamily: 'var(--jp-ui-font-family, system-ui, sans-serif)',
    backgroundColor: 'var(--jp-layout-color1, #fff)',
    position: 'relative',
    overflow: 'hidden'
  },
  layoutWithSidebar: {
    flexDirection: 'row'
  },
  sidebar: {
    width: '240px',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid var(--jp-border-color1, #e0e0e0)',
    backgroundColor: 'var(--jp-layout-color1, #fff)',
    overflow: 'hidden'
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 10px',
    flexShrink: 0,
    backgroundColor: 'var(--jp-layout-color2, #f5f5f5)',
    borderBottom: '1px solid var(--jp-border-color1, #e0e0e0)'
  },
  sidebarTitle: {
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: 'var(--jp-ui-font-color1, #111)'
  },
  sidebarCount: {
    fontSize: '11px',
    color: 'var(--jp-ui-font-color2, #666)',
    flex: 1
  },
  sidebarToggleAll: {
    fontSize: '10px',
    padding: '3px 6px',
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--jp-ui-font-color2, #555)',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    fontWeight: 500
  },
  sidebarClose: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '2px',
    opacity: 0.6,
    color: 'var(--jp-ui-font-color1, #111)',
    flexShrink: 0,
    width: '20px',
    height: '20px'
  },
  variableList: {
    flex: 1,
    overflowY: 'auto',
    padding: '4px 0'
  },
  variable: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '5px 10px',
    cursor: 'pointer',
    transition: 'background 0.1s'
  },
  checkbox: {
    flexShrink: 0,
    accentColor: 'var(--jp-brand-color1, #1976d2)',
    cursor: 'pointer'
  },
  variableName: {
    fontSize: '12px',
    fontFamily: 'var(--jp-code-font-family, monospace)',
    color: 'var(--jp-ui-font-color1, #111)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    padding: '6px 12px',
    flexShrink: 0,
    backgroundColor: 'var(--jp-layout-color2, #f5f5f5)',
    borderBottom: '1px solid var(--jp-border-color1, #e0e0e0)',
    fontSize: '12px'
  },
  toolbarGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px'
  },
  toolbarGroupRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginLeft: 'auto'
  },
  toolbarBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '4px 10px',
    fontSize: '12px',
    fontWeight: 500,
    backgroundColor: 'transparent',
    color: 'var(--jp-ui-font-color1, #111)',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    transition: 'background 0.1s'
  },
  toolbarBtnActive: {
    backgroundColor: 'var(--jp-layout-color3, #e0e0e0)'
  },
  toolbarBtnFilterActive: {
    color: 'var(--jp-brand-color1, #1976d2)',
    fontWeight: 600
  },
  iconBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    padding: '0',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--jp-ui-font-color1, #111)',
    opacity: 1,
    transition: 'opacity 0.1s'
  },
  rowInfo: {
    fontSize: '12px',
    color: 'var(--jp-ui-font-color2, #555)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap'
  },
  paginationButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '0',
    border: '1px solid var(--jp-border-color1, #e0e0e0)',
    borderRadius: '3px',
    backgroundColor: 'var(--jp-layout-color0, #fafafa)',
    overflow: 'hidden'
  },
  tableArea: {
    flex: 1,
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column'
  },
  loadingOverlay: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    color: 'var(--jp-ui-font-color2, #888)'
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.28)',
    zIndex: 100
  },
  dialog: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'min(520px, 90%)',
    backgroundColor: 'var(--jp-layout-color1, #fff)',
    border: '1px solid var(--jp-border-color1, #e0e0e0)',
    borderRadius: '6px',
    boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
    zIndex: 101,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  dialogHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    backgroundColor: 'var(--jp-layout-color2, #f5f5f5)',
    borderBottom: '1px solid var(--jp-border-color1, #e0e0e0)'
  },
  dialogTitle: {
    fontWeight: 600,
    fontSize: '13px',
    color: 'var(--jp-ui-font-color1, #111)'
  },
  dialogClose: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0',
    opacity: 0.6,
    color: 'var(--jp-ui-font-color1, #111)'
  },
  dialogBody: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  filterTextarea: {
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: 'var(--jp-code-font-family, "Source Code Pro", monospace)',
    fontSize: '13px',
    lineHeight: '1.5',
    padding: '10px',
    border: '1px solid var(--jp-border-color1, #e0e0e0)',
    borderRadius: '4px',
    backgroundColor: 'var(--jp-layout-color0, #fafafa)',
    color: 'var(--jp-content-font-color1, #111)',
    resize: 'vertical',
    outline: 'none'
  },
  filterHintRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px'
  },
  filterHint: {
    fontSize: '11px',
    color: 'var(--jp-ui-font-color3, #999)',
    fontFamily: 'var(--jp-code-font-family, monospace)',
    flex: 1,
    lineHeight: '1.4'
  },
  clearBtn: {
    fontSize: '11px',
    padding: '4px 10px',
    border: '1px solid var(--jp-border-color1, #e0e0e0)',
    borderRadius: '3px',
    backgroundColor: 'var(--jp-layout-color1, #fff)',
    color: 'var(--jp-ui-font-color2, #555)',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0
  },
  dialogFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: 'var(--jp-layout-color2, #f5f5f5)',
    borderTop: '1px solid var(--jp-border-color1, #e0e0e0)'
  },
  dialogButtonCancel: {
    padding: '6px 16px',
    fontSize: '13px',
    fontWeight: 500,
    backgroundColor: 'var(--jp-layout-color1, #fff)',
    color: 'var(--jp-ui-font-color1, #111)',
    border: '1px solid var(--jp-border-color1, #e0e0e0)',
    borderRadius: '3px',
    cursor: 'pointer'
  },
  dialogButtonApply: {
    padding: '6px 16px',
    fontSize: '13px',
    fontWeight: 500,
    backgroundColor: 'var(--jp-brand-color1, #1976d2)',
    color: '#fff',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer'
  },
  filterError: {
    padding: '8px 12px',
    fontSize: '12px',
    borderRadius: '4px',
    backgroundColor: 'var(--jp-error-color3, #ffebee)',
    color: 'var(--jp-error-color1, #c62828)',
    border: '1px solid var(--jp-error-color2, #ffcdd2)',
    margin: '0 16px 16px 16px',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word'
  }
};
