import { useState, useRef, CSSProperties } from 'react';
import { DataTable } from './data-table';
import { DataResponse } from '../services/data-service';

const PAGE_SIZES = [500, 1000, 2000, 5000];
const DEFAULT_PAGE_SIZE = 2000;

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
  const [query, setQuery] = useState('SELECT * FROM df LIMIT 100');
  const [isExecuting, setIsExecuting] = useState(false);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [isFetchingPage, setIsFetchingPage] = useState(false);
  const queryCountRef = useRef(0);

  const openModal = () => {
    setQueryError(null);
    setShowModal(true);
  };
  const closeModal = () => setShowModal(false);

  const handleExecute = async () => {
    if (!query.trim() || isExecuting || !onExecuteQuery) return;
    setIsExecuting(true);
    setQueryError(null);
    try {
      const result = await onExecuteQuery(query);
      queryCountRef.current += 1;
      const newId = 'query-' + queryCountRef.current;
      const newTab: Tab = {
        id: newId,
        label: 'Query ' + queryCountRef.current,
        data: result.data,
        columns: result.columns
      };
      setTabs(prev => [...prev, newTab]);
      setActiveTabId(newId);
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

  if (loading) {
    return (
      <div
        style={{
          ...s.root,
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
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
    activeTab?.isPaginated &&
    (activeTab.totalRows ?? 0) > 0;
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
        {onExecuteQuery && (
          <button
            onClick={openModal}
            style={s.sqlButton}
            title="Open SQL query editor"
          >
            SQL Query
          </button>
        )}
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

      {/* Data area */}
      <div style={s.dataArea}>
        {isFetchingPage ? (
          <div style={s.fetchingOverlay}>Loading…</div>
        ) : (
          activeTab && (
            <DataTable data={activeTab.data} columns={activeTab.columns} />
          )
        )}
      </div>

      {/* Pagination bar — only shown for the paginated original tab */}
      {showPagination && (
        <div style={s.paginationBar}>
          <button
            onClick={() => navigatePage(activeTab, offset - pageSize)}
            disabled={!hasPrev || isFetchingPage}
            style={{
              ...s.pageButton,
              opacity: !hasPrev || isFetchingPage ? 0.4 : 1,
              cursor: !hasPrev || isFetchingPage ? 'not-allowed' : 'pointer'
            }}
          >
            ← Prev
          </button>
          <span style={s.pageInfo}>
            {totalRows === 0
              ? 'No rows'
              : `Rows ${startRow.toLocaleString()}–${endRow.toLocaleString()} of ${totalRows.toLocaleString()}`}
          </span>
          <button
            onClick={() => navigatePage(activeTab, offset + pageSize)}
            disabled={!hasNext || isFetchingPage}
            style={{
              ...s.pageButton,
              opacity: !hasNext || isFetchingPage ? 0.4 : 1,
              cursor: !hasNext || isFetchingPage ? 'not-allowed' : 'pointer'
            }}
          >
            Next →
          </button>
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

      {/* SQL modal */}
      {showModal && (
        <>
          <div onClick={closeModal} style={s.backdrop} />
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <span style={s.modalTitle}>SQL Query</span>
              <button onClick={closeModal} style={s.modalClose} title="Close">
                ×
              </button>
            </div>
            <div style={s.modalBody}>
              <textarea
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={6}
                spellCheck={false}
                autoFocus
                placeholder="SELECT * FROM df LIMIT 100"
                style={s.queryTextarea}
              />
              <div style={s.modalFooter}>
                <span style={s.queryHint}>
                  Table alias: df · Ctrl+Enter to run
                </span>
                <button
                  onClick={handleExecute}
                  disabled={isExecuting || !query.trim()}
                  style={{
                    ...s.executeButton,
                    opacity: isExecuting || !query.trim() ? 0.55 : 1,
                    cursor:
                      isExecuting || !query.trim() ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isExecuting ? 'Running…' : 'Execute'}
                </button>
              </div>
              {queryError && (
                <div style={s.queryError}>{queryError}</div>
              )}
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
    whiteSpace: 'nowrap'
  },
  sqlButton: {
    padding: '4px 12px',
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.03em',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    backgroundColor: 'var(--jp-brand-color1, #1976d2)',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
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
  pageButton: {
    padding: '3px 10px',
    fontSize: '12px',
    backgroundColor: 'var(--jp-layout-color1, #fff)',
    color: 'var(--jp-ui-font-color1, #111)',
    border: '1px solid var(--jp-border-color1, #e0e0e0)',
    borderRadius: '3px',
    cursor: 'pointer'
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
    width: 'min(580px, 90%)',
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
    fontFamily:
      'var(--jp-code-font-family, "Source Code Pro", monospace)',
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
    justifyContent: 'space-between'
  },
  queryHint: {
    fontSize: '11px',
    color: 'var(--jp-ui-font-color3, #999)',
    fontFamily: 'var(--jp-code-font-family, monospace)'
  },
  executeButton: {
    padding: '6px 18px',
    fontSize: '13px',
    fontWeight: 500,
    backgroundColor: 'var(--jp-brand-color1, #1976d2)',
    color: '#fff',
    border: 'none',
    borderRadius: '4px'
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
