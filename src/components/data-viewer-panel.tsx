import { useState, CSSProperties } from 'react';
import { DataTable } from './data-table';
import { DataResponse } from '../services/data-service';

const PAGE_SIZES = [500, 1000, 2000, 5000];
const DEFAULT_PAGE_SIZE = 2000;
const FILTER_TAB_ID = 'filter';

interface Tab {
  id: string;
  label: string;
  data: any[];
  columns: string[];
  totalRows?: number;
  offset?: number;
  pageSize?: number;
  isPaginated?: boolean;
}

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
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: 'original',
      label: 'Original Data',
      data: initialData,
      columns: initialColumns,
      totalRows: initialTotalRows,
      offset: 0,
      pageSize: DEFAULT_PAGE_SIZE,
      isPaginated: !!onFetchPage
    }
  ]);
  const [activeTabId, setActiveTabId] = useState('original');
  const [showModal, setShowModal] = useState(false);
  const [whereClause, setWhereClause] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [isFetchingPage, setIsFetchingPage] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());

  const openModal = () => {
    setQueryError(null);
    setShowModal(true);
  };
  const closeModal = () => setShowModal(false);

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

  const handleExecute = async () => {
    if (!whereClause.trim() || isExecuting || !onExecuteQuery) return;
    setIsExecuting(true);
    setQueryError(null);
    try {
      const result = await onExecuteQuery(
        `SELECT * FROM df WHERE ${whereClause.trim()}`
      );
      const filterTab: Tab = {
        id: FILTER_TAB_ID,
        label: 'Filter',
        data: result.data,
        columns: result.columns
      };
      setTabs(prev =>
        prev.some(t => t.id === FILTER_TAB_ID)
          ? prev.map(t => (t.id === FILTER_TAB_ID ? filterTab : t))
          : [...prev, filterTab]
      );
      setActiveTabId(FILTER_TAB_ID);
      closeModal();
    } catch (err) {
      setQueryError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsExecuting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      handleExecute();
    }
    if (e.key === 'Escape') closeModal();
  };

  const closeTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    setTabs(prev => {
      const next = prev.filter(t => t.id !== tabId);
      if (activeTabId === tabId) setActiveTabId(next[next.length - 1].id);
      return next;
    });
  };

  const navigatePage = async (tab: Tab, newOffset: number) => {
    if (!onFetchPage || isFetchingPage) return;
    setIsFetchingPage(true);
    try {
      const result = await onFetchPage(
        newOffset,
        tab.pageSize ?? DEFAULT_PAGE_SIZE
      );
      setTabs(prev =>
        prev.map(t =>
          t.id === tab.id
            ? {
                ...t,
                data: result.data,
                columns: result.columns,
                offset: newOffset,
                totalRows: result.total_rows
              }
            : t
        )
      );
    } finally {
      setIsFetchingPage(false);
    }
  };

  const changePageSize = async (tab: Tab, newSize: number) => {
    if (!onFetchPage || isFetchingPage) return;
    setIsFetchingPage(true);
    try {
      const result = await onFetchPage(0, newSize);
      setTabs(prev =>
        prev.map(t =>
          t.id === tab.id
            ? {
                ...t,
                data: result.data,
                columns: result.columns,
                offset: 0,
                pageSize: newSize,
                totalRows: result.total_rows
              }
            : t
        )
      );
    } finally {
      setIsFetchingPage(false);
    }
  };

  const activeTab = tabs.find(t => t.id === activeTabId) ?? tabs[0];
  const allColumns = activeTab?.columns ?? [];
  const visibleColumns = allColumns.filter(c => !hiddenColumns.has(c));

  if (loading) {
    return (
      <div style={{ ...s.root, alignItems: 'center', justifyContent: 'center' }}>
        Loading {filePath}...
      </div>
    );
  }
  if (error) {
    return (
      <div
        style={{
          ...s.root,
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--jp-error-color1, #c62828)'
        }}
      >
        Error: {error}
      </div>
    );
  }

  const showPagination =
    activeTab?.isPaginated && (activeTab.totalRows ?? 0) > 0;
  const offset = activeTab?.offset ?? 0;
  const pageSize = activeTab?.pageSize ?? DEFAULT_PAGE_SIZE;
  const totalRows = activeTab?.totalRows ?? 0;
  const startRow = totalRows === 0 ? 0 : offset + 1;
  const endRow = Math.min(offset + pageSize, totalRows);
  const hasPrev = offset > 0;
  const hasNext = offset + pageSize < totalRows;

  return (
    <div style={s.root}>
      {/* Header */}
      <div style={s.header}>
        <span style={s.headerTitle}>{filePath}</span>
        <div style={s.headerButtons}>
          {onExecuteQuery && (
            <button onClick={openModal} style={s.filterButton} title="Filter rows">
              Filter
            </button>
          )}
          <button
            onClick={() => setSidebarOpen(o => !o)}
            style={{
              ...s.columnsButton,
              ...(sidebarOpen ? s.columnsButtonActive : {})
            }}
            title="Toggle column visibility"
          >
            Columns
            {hiddenColumns.size > 0 && (
              <span style={s.hiddenBadge}>{hiddenColumns.size}</span>
            )}
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div style={s.tabBar}>
        {tabs.map(tab => (
          <div
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            style={{
              ...s.tab,
              ...(tab.id === activeTabId ? s.tabActive : s.tabInactive)
            }}
          >
            <span>{tab.label}</span>
            {tab.id !== 'original' && (
              <span
                onClick={e => closeTab(e, tab.id)}
                style={s.tabClose}
                title="Close"
              >
                ×
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Main area: sidebar + data */}
      <div style={s.mainArea}>
        {/* Sidebar */}
        {sidebarOpen && (
          <aside style={s.sidebar}>
            <div style={s.sidebarHeader}>
              <span style={s.sidebarTitle}>Columns</span>
              <span style={s.sidebarCount}>
                {visibleColumns.length}/{allColumns.length}
              </span>
              <button
                style={s.sidebarToggleAll}
                onClick={() => toggleAllColumns(allColumns)}
                title={hiddenColumns.size === 0 ? 'Deselect all' : 'Select all'}
              >
                {hiddenColumns.size === 0 ? 'Deselect all' : 'Select all'}
              </button>
              <button
                style={s.sidebarClose}
                onClick={() => setSidebarOpen(false)}
                title="Close"
              >
                ×
              </button>
            </div>
            <div style={s.variableList}>
              {allColumns.map(col => {
                const visible = !hiddenColumns.has(col);
                return (
                  <label
                    key={col}
                    style={{
                      ...s.variable,
                      opacity: visible ? 1 : 0.45
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

        {/* Data area */}
        <div style={s.dataArea}>
          {isFetchingPage ? (
            <div style={s.fetchingOverlay}>Loading…</div>
          ) : (
            activeTab && (
              <DataTable data={activeTab.data} columns={visibleColumns} />
            )
          )}
        </div>
      </div>

      {/* Pagination bar */}
      {showPagination && (
        <div style={s.paginationBar}>
          <div style={s.navGroup}>
            <button
              onClick={() => navigatePage(activeTab, offset - pageSize)}
              disabled={!hasPrev || isFetchingPage}
              style={{
                ...s.navButton,
                opacity: !hasPrev || isFetchingPage ? 0.3 : 1,
                cursor: !hasPrev || isFetchingPage ? 'not-allowed' : 'pointer'
              }}
              title="Previous page"
            >
              ‹
            </button>
            <div style={s.navDivider} />
            <button
              onClick={() => navigatePage(activeTab, offset + pageSize)}
              disabled={!hasNext || isFetchingPage}
              style={{
                ...s.navButton,
                opacity: !hasNext || isFetchingPage ? 0.3 : 1,
                cursor: !hasNext || isFetchingPage ? 'not-allowed' : 'pointer'
              }}
              title="Next page"
            >
              ›
            </button>
          </div>
          <span style={s.pageInfo}>
            {totalRows === 0
              ? 'No rows'
              : `Rows ${startRow.toLocaleString()}–${endRow.toLocaleString()} of ${totalRows.toLocaleString()}`}
          </span>
          <select
            value={pageSize}
            onChange={e => changePageSize(activeTab, Number(e.target.value))}
            disabled={isFetchingPage}
            style={s.pageSizeSelect}
            title="Rows per page"
          >
            {PAGE_SIZES.map(size => (
              <option key={size} value={size}>
                {size.toLocaleString()} / page
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Filter modal */}
      {showModal && (
        <>
          <div onClick={closeModal} style={s.backdrop} />
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <span style={s.modalTitle}>Filter</span>
              <button onClick={closeModal} style={s.modalClose} title="Close">
                ×
              </button>
            </div>
            <div style={s.modalBody}>
              <textarea
                value={whereClause}
                onChange={e => setWhereClause(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={3}
                spellCheck={false}
                autoFocus
                placeholder="age > 30 AND status = 'active'"
                style={s.queryTextarea}
              />
              <div style={s.modalFooter}>
                <span style={s.queryHint}>
                  WHERE clause — =, !=, &lt;, &gt;, AND, OR, NOT, LIKE · Ctrl+Enter to run
                </span>
                <button
                  onClick={handleExecute}
                  disabled={isExecuting || !whereClause.trim()}
                  style={{
                    ...s.executeButton,
                    opacity: isExecuting || !whereClause.trim() ? 0.55 : 1,
                    cursor:
                      isExecuting || !whereClause.trim() ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isExecuting ? 'Running…' : 'Apply'}
                </button>
              </div>
              {queryError && <div style={s.queryError}>{queryError}</div>}
            </div>
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
    flexDirection: 'column',
    fontFamily: 'var(--jp-ui-font-family, system-ui, sans-serif)',
    backgroundColor: 'var(--jp-layout-color1, #fff)',
    position: 'relative',
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '7px 12px',
    gap: '8px',
    flexShrink: 0,
    backgroundColor: 'var(--jp-layout-color2, #f5f5f5)',
    borderBottom: '1px solid var(--jp-border-color1, #e0e0e0)'
  },
  headerTitle: {
    fontSize: '12px',
    fontWeight: 600,
    opacity: 0.8,
    color: 'var(--jp-ui-font-color1, #111)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flex: 1
  },
  headerButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexShrink: 0
  },
  filterButton: {
    padding: '4px 12px',
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.03em',
    whiteSpace: 'nowrap',
    backgroundColor: 'var(--jp-brand-color1, #1976d2)',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  columnsButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '4px 10px',
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.03em',
    whiteSpace: 'nowrap',
    backgroundColor: 'var(--jp-layout-color1, #fff)',
    color: 'var(--jp-ui-font-color1, #111)',
    border: '1px solid var(--jp-border-color1, #e0e0e0)',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  columnsButtonActive: {
    backgroundColor: 'var(--jp-layout-color3, #e0e0e0)',
    borderColor: 'var(--jp-border-color0, #bbb)'
  },
  hiddenBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '16px',
    height: '16px',
    padding: '0 4px',
    fontSize: '10px',
    fontWeight: 700,
    borderRadius: '8px',
    backgroundColor: 'var(--jp-warn-color1, #f57c00)',
    color: '#fff'
  },
  tabBar: {
    display: 'flex',
    flexShrink: 0,
    overflowX: 'auto',
    backgroundColor: 'var(--jp-layout-color2, #f5f5f5)',
    borderBottom: '1px solid var(--jp-border-color1, #e0e0e0)'
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '5px 14px',
    fontSize: '12px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    userSelect: 'none'
  },
  tabActive: {
    color: 'var(--jp-brand-color1, #1976d2)',
    fontWeight: 600,
    borderBottom: '2px solid var(--jp-brand-color1, #1976d2)',
    backgroundColor: 'var(--jp-layout-color1, #fff)'
  },
  tabInactive: {
    color: 'var(--jp-ui-font-color2, #555)',
    fontWeight: 400,
    borderBottom: '2px solid transparent'
  },
  tabClose: {
    fontSize: '14px',
    lineHeight: '1',
    opacity: 0.5,
    cursor: 'pointer',
    marginLeft: '2px',
    padding: '0 1px'
  },
  mainArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    overflow: 'hidden'
  },
  sidebar: {
    width: '220px',
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
    padding: '7px 10px',
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
    padding: '2px 6px',
    border: '1px solid var(--jp-border-color1, #e0e0e0)',
    borderRadius: '3px',
    backgroundColor: 'var(--jp-layout-color1, #fff)',
    color: 'var(--jp-ui-font-color2, #555)',
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  },
  sidebarClose: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    lineHeight: '1',
    padding: '0 2px',
    opacity: 0.5,
    color: 'var(--jp-ui-font-color1, #111)',
    flexShrink: 0
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
    padding: '4px 10px',
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
  dataArea: {
    flex: 1,
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column'
  },
  fetchingOverlay: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    color: 'var(--jp-ui-font-color2, #888)'
  },
  paginationBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '6px 12px',
    flexShrink: 0,
    backgroundColor: 'var(--jp-layout-color2, #f5f5f5)',
    borderTop: '1px solid var(--jp-border-color1, #e0e0e0)',
    fontSize: '12px'
  },
  navGroup: {
    display: 'flex',
    border: '1px solid var(--jp-border-color1, #e0e0e0)',
    borderRadius: '4px',
    overflow: 'hidden',
    backgroundColor: 'var(--jp-layout-color0, #fafafa)',
    flexShrink: 0
  },
  navButton: {
    background: 'none',
    border: 'none',
    padding: '3px 10px',
    fontSize: '15px',
    lineHeight: '1',
    color: 'var(--jp-ui-font-color1, #111)',
    cursor: 'pointer',
    userSelect: 'none'
  },
  navDivider: {
    width: '1px',
    backgroundColor: 'var(--jp-border-color1, #e0e0e0)',
    flexShrink: 0
  },
  pageInfo: {
    flex: 1,
    textAlign: 'center',
    color: 'var(--jp-ui-font-color2, #555)',
    fontSize: '12px',
    fontVariantNumeric: 'tabular-nums'
  },
  pageSizeSelect: {
    fontSize: '11px',
    padding: '2px 4px',
    border: '1px solid var(--jp-border-color1, #e0e0e0)',
    borderRadius: '3px',
    backgroundColor: 'var(--jp-layout-color1, #fff)',
    color: 'var(--jp-ui-font-color1, #111)',
    cursor: 'pointer'
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
  modal: {
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
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '11px 16px',
    backgroundColor: 'var(--jp-layout-color2, #f5f5f5)',
    borderBottom: '1px solid var(--jp-border-color1, #e0e0e0)'
  },
  modalTitle: {
    fontWeight: 600,
    fontSize: '13px',
    color: 'var(--jp-ui-font-color1, #111)'
  },
  modalClose: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '20px',
    lineHeight: '1',
    padding: '0 2px',
    opacity: 0.6,
    color: 'var(--jp-ui-font-color1, #111)'
  },
  modalBody: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  queryTextarea: {
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
  modalFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px'
  },
  queryHint: {
    fontSize: '11px',
    color: 'var(--jp-ui-font-color3, #999)',
    fontFamily: 'var(--jp-code-font-family, monospace)',
    flex: 1
  },
  executeButton: {
    padding: '6px 18px',
    fontSize: '13px',
    fontWeight: 500,
    backgroundColor: 'var(--jp-brand-color1, #1976d2)',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    flexShrink: 0
  },
  queryError: {
    padding: '8px 12px',
    fontSize: '12px',
    borderRadius: '4px',
    backgroundColor: 'var(--jp-error-color3, #ffebee)',
    color: 'var(--jp-error-color1, #c62828)',
    border: '1px solid var(--jp-error-color2, #ffcdd2)',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word'
  }
};
