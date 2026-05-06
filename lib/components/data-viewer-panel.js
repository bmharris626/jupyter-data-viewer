"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataViewerPanel = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const data_table_1 = require("./data-table");
const PAGE_SIZES = [500, 1000, 2000, 5000];
const DEFAULT_PAGE_SIZE = 2000;
const DataViewerPanel = ({ data: initialData, columns: initialColumns, totalRows: initialTotalRows = 0, loading, error, filePath, onExecuteQuery, onFetchPage }) => {
    var _a, _b, _c, _d, _e;
    const [tabs, setTabs] = (0, react_1.useState)([
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
    const [activeTabId, setActiveTabId] = (0, react_1.useState)('original');
    const [showModal, setShowModal] = (0, react_1.useState)(false);
    const [query, setQuery] = (0, react_1.useState)('SELECT * FROM df LIMIT 100');
    const [isExecuting, setIsExecuting] = (0, react_1.useState)(false);
    const [queryError, setQueryError] = (0, react_1.useState)(null);
    const [isFetchingPage, setIsFetchingPage] = (0, react_1.useState)(false);
    const queryCountRef = (0, react_1.useRef)(0);
    const openModal = () => {
        setQueryError(null);
        setShowModal(true);
    };
    const closeModal = () => setShowModal(false);
    const handleExecute = async () => {
        if (!query.trim() || isExecuting || !onExecuteQuery)
            return;
        setIsExecuting(true);
        setQueryError(null);
        try {
            const result = await onExecuteQuery(query);
            queryCountRef.current += 1;
            const newId = 'query-' + queryCountRef.current;
            const newTab = {
                id: newId,
                label: 'Query ' + queryCountRef.current,
                data: result.data,
                columns: result.columns
            };
            setTabs(prev => [...prev, newTab]);
            setActiveTabId(newId);
            closeModal();
        }
        catch (err) {
            setQueryError(err instanceof Error ? err.message : String(err));
        }
        finally {
            setIsExecuting(false);
        }
    };
    const handleKeyDown = (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            handleExecute();
        }
        if (e.key === 'Escape')
            closeModal();
    };
    const closeTab = (e, tabId) => {
        e.stopPropagation();
        setTabs(prev => {
            const next = prev.filter(t => t.id !== tabId);
            if (activeTabId === tabId)
                setActiveTabId(next[next.length - 1].id);
            return next;
        });
    };
    const navigatePage = async (tab, newOffset) => {
        var _a;
        if (!onFetchPage || isFetchingPage)
            return;
        setIsFetchingPage(true);
        try {
            const result = await onFetchPage(newOffset, (_a = tab.pageSize) !== null && _a !== void 0 ? _a : DEFAULT_PAGE_SIZE);
            setTabs(prev => prev.map(t => t.id === tab.id
                ? Object.assign(Object.assign({}, t), { data: result.data, columns: result.columns, offset: newOffset, totalRows: result.total_rows }) : t));
        }
        finally {
            setIsFetchingPage(false);
        }
    };
    const changePageSize = async (tab, newSize) => {
        if (!onFetchPage || isFetchingPage)
            return;
        setIsFetchingPage(true);
        try {
            const result = await onFetchPage(0, newSize);
            setTabs(prev => prev.map(t => t.id === tab.id
                ? Object.assign(Object.assign({}, t), { data: result.data, columns: result.columns, offset: 0, pageSize: newSize, totalRows: result.total_rows }) : t));
        }
        finally {
            setIsFetchingPage(false);
        }
    };
    const activeTab = (_a = tabs.find(t => t.id === activeTabId)) !== null && _a !== void 0 ? _a : tabs[0];
    if (loading) {
        return ((0, jsx_runtime_1.jsxs)("div", Object.assign({ style: Object.assign(Object.assign({}, s.root), { alignItems: 'center', justifyContent: 'center' }) }, { children: ["Loading ", filePath, "..."] })));
    }
    if (error) {
        return ((0, jsx_runtime_1.jsxs)("div", Object.assign({ style: Object.assign(Object.assign({}, s.root), { alignItems: 'center', justifyContent: 'center', color: 'var(--jp-error-color1, #c62828)' }) }, { children: ["Error: ", error] })));
    }
    const showPagination = (activeTab === null || activeTab === void 0 ? void 0 : activeTab.isPaginated) &&
        ((_b = activeTab.totalRows) !== null && _b !== void 0 ? _b : 0) > 0;
    const offset = (_c = activeTab === null || activeTab === void 0 ? void 0 : activeTab.offset) !== null && _c !== void 0 ? _c : 0;
    const pageSize = (_d = activeTab === null || activeTab === void 0 ? void 0 : activeTab.pageSize) !== null && _d !== void 0 ? _d : DEFAULT_PAGE_SIZE;
    const totalRows = (_e = activeTab === null || activeTab === void 0 ? void 0 : activeTab.totalRows) !== null && _e !== void 0 ? _e : 0;
    const startRow = totalRows === 0 ? 0 : offset + 1;
    const endRow = Math.min(offset + pageSize, totalRows);
    const hasPrev = offset > 0;
    const hasNext = offset + pageSize < totalRows;
    return ((0, jsx_runtime_1.jsxs)("div", Object.assign({ style: s.root }, { children: [(0, jsx_runtime_1.jsxs)("div", Object.assign({ style: s.header }, { children: [(0, jsx_runtime_1.jsx)("span", Object.assign({ style: s.headerTitle }, { children: filePath })), onExecuteQuery && ((0, jsx_runtime_1.jsx)("button", Object.assign({ onClick: openModal, style: s.sqlButton, title: "Open SQL query editor" }, { children: "SQL Query" })))] })), (0, jsx_runtime_1.jsx)("div", Object.assign({ style: s.tabBar }, { children: tabs.map(tab => ((0, jsx_runtime_1.jsxs)("div", Object.assign({ onClick: () => setActiveTabId(tab.id), style: Object.assign(Object.assign({}, s.tab), (tab.id === activeTabId ? s.tabActive : s.tabInactive)) }, { children: [(0, jsx_runtime_1.jsx)("span", { children: tab.label }), tab.id !== 'original' && ((0, jsx_runtime_1.jsx)("span", Object.assign({ onClick: e => closeTab(e, tab.id), style: s.tabClose, title: "Close" }, { children: "\u00D7" })))] }), tab.id))) })), (0, jsx_runtime_1.jsx)("div", Object.assign({ style: s.dataArea }, { children: isFetchingPage ? ((0, jsx_runtime_1.jsx)("div", Object.assign({ style: s.fetchingOverlay }, { children: "Loading\u2026" }))) : (activeTab && ((0, jsx_runtime_1.jsx)(data_table_1.DataTable, { data: activeTab.data, columns: activeTab.columns }))) })), showPagination && ((0, jsx_runtime_1.jsxs)("div", Object.assign({ style: s.paginationBar }, { children: [(0, jsx_runtime_1.jsx)("button", Object.assign({ onClick: () => navigatePage(activeTab, offset - pageSize), disabled: !hasPrev || isFetchingPage, style: Object.assign(Object.assign({}, s.pageButton), { opacity: !hasPrev || isFetchingPage ? 0.4 : 1, cursor: !hasPrev || isFetchingPage ? 'not-allowed' : 'pointer' }) }, { children: "\u2190 Prev" })), (0, jsx_runtime_1.jsx)("span", Object.assign({ style: s.pageInfo }, { children: totalRows === 0
                            ? 'No rows'
                            : `Rows ${startRow.toLocaleString()}–${endRow.toLocaleString()} of ${totalRows.toLocaleString()}` })), (0, jsx_runtime_1.jsx)("button", Object.assign({ onClick: () => navigatePage(activeTab, offset + pageSize), disabled: !hasNext || isFetchingPage, style: Object.assign(Object.assign({}, s.pageButton), { opacity: !hasNext || isFetchingPage ? 0.4 : 1, cursor: !hasNext || isFetchingPage ? 'not-allowed' : 'pointer' }) }, { children: "Next \u2192" })), (0, jsx_runtime_1.jsx)("select", Object.assign({ value: pageSize, onChange: e => changePageSize(activeTab, Number(e.target.value)), disabled: isFetchingPage, style: s.pageSizeSelect, title: "Rows per page" }, { children: PAGE_SIZES.map(size => ((0, jsx_runtime_1.jsxs)("option", Object.assign({ value: size }, { children: [size.toLocaleString(), " / page"] }), size))) }))] }))), showModal && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { onClick: closeModal, style: s.backdrop }), (0, jsx_runtime_1.jsxs)("div", Object.assign({ style: s.modal }, { children: [(0, jsx_runtime_1.jsxs)("div", Object.assign({ style: s.modalHeader }, { children: [(0, jsx_runtime_1.jsx)("span", Object.assign({ style: s.modalTitle }, { children: "SQL Query" })), (0, jsx_runtime_1.jsx)("button", Object.assign({ onClick: closeModal, style: s.modalClose, title: "Close" }, { children: "\u00D7" }))] })), (0, jsx_runtime_1.jsxs)("div", Object.assign({ style: s.modalBody }, { children: [(0, jsx_runtime_1.jsx)("textarea", { value: query, onChange: e => setQuery(e.target.value), onKeyDown: handleKeyDown, rows: 6, spellCheck: false, autoFocus: true, placeholder: "SELECT * FROM df LIMIT 100", style: s.queryTextarea }), (0, jsx_runtime_1.jsxs)("div", Object.assign({ style: s.modalFooter }, { children: [(0, jsx_runtime_1.jsx)("span", Object.assign({ style: s.queryHint }, { children: "Table alias: df \u00B7 Ctrl+Enter to run" })), (0, jsx_runtime_1.jsx)("button", Object.assign({ onClick: handleExecute, disabled: isExecuting || !query.trim(), style: Object.assign(Object.assign({}, s.executeButton), { opacity: isExecuting || !query.trim() ? 0.55 : 1, cursor: isExecuting || !query.trim() ? 'not-allowed' : 'pointer' }) }, { children: isExecuting ? 'Running…' : 'Execute' }))] })), queryError && ((0, jsx_runtime_1.jsx)("div", Object.assign({ style: s.queryError }, { children: queryError })))] }))] }))] }))] })));
};
exports.DataViewerPanel = DataViewerPanel;
const s = {
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
