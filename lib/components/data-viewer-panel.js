"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataViewerPanel = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const data_table_1 = require("./data-table");
const query_editor_1 = require("./query-editor");
const DataViewerPanel = ({ data, columns, loading, error, filePath, onExecuteQuery }) => {
    const [queryData, setQueryData] = (0, react_1.useState)([]);
    const [queryColumns, setQueryColumns] = (0, react_1.useState)([]);
    const [queryError, setQueryError] = (0, react_1.useState)(null);
    const [isLoadingQuery, setIsLoadingQuery] = (0, react_1.useState)(false);
    const [showQueryEditor, setShowQueryEditor] = (0, react_1.useState)(false);
    const handleQueryExecution = async (query) => {
        if (!onExecuteQuery) {
            setQueryError('Query execution not available');
            return;
        }
        try {
            setIsLoadingQuery(true);
            setQueryError(null);
            const result = await onExecuteQuery(query);
            setQueryData(result.data);
            setQueryColumns(result.columns);
        }
        catch (err) {
            setQueryError(err instanceof Error ? err.message : 'Unknown error occurred');
        }
        finally {
            setIsLoadingQuery(false);
        }
    };
    if (loading) {
        return ((0, jsx_runtime_1.jsx)("div", Object.assign({ style: { height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, { children: (0, jsx_runtime_1.jsxs)("div", { children: ["Loading data from ", filePath, "..."] }) })));
    }
    if (error) {
        return ((0, jsx_runtime_1.jsx)("div", Object.assign({ style: { height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, { children: (0, jsx_runtime_1.jsxs)("div", Object.assign({ style: { color: 'red' } }, { children: ["Error loading data: ", error] })) })));
    }
    return ((0, jsx_runtime_1.jsxs)("div", Object.assign({ style: { height: '100%', width: '100%', display: 'flex', flexDirection: 'column' } }, { children: [(0, jsx_runtime_1.jsxs)("h2", { children: ["Data Viewer: ", filePath] }), (0, jsx_runtime_1.jsx)("div", Object.assign({ style: { marginBottom: '10px' } }, { children: (0, jsx_runtime_1.jsx)("button", Object.assign({ onClick: () => setShowQueryEditor(v => !v), style: { padding: '5px 10px', backgroundColor: showQueryEditor ? '#e0e0e0' : '#007acc', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' } }, { children: showQueryEditor ? 'Hide Query Editor' : 'Show Query Editor' })) })), showQueryEditor && ((0, jsx_runtime_1.jsx)("div", Object.assign({ style: { marginBottom: '10px' } }, { children: (0, jsx_runtime_1.jsx)(query_editor_1.QueryEditor, { onExecuteQuery: handleQueryExecution, isLoading: isLoadingQuery, error: queryError !== null && queryError !== void 0 ? queryError : undefined }) }))), (0, jsx_runtime_1.jsxs)("div", Object.assign({ style: { flex: 1, display: 'flex', flexDirection: 'column' } }, { children: [(0, jsx_runtime_1.jsx)("h3", { children: "Original Data" }), (0, jsx_runtime_1.jsx)(data_table_1.DataTable, { data: data, columns: columns }), showQueryEditor && queryData.length > 0 && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("h3", { children: "Query Results" }), (0, jsx_runtime_1.jsx)(data_table_1.DataTable, { data: queryData, columns: queryColumns })] }))] }))] })));
};
exports.DataViewerPanel = DataViewerPanel;
