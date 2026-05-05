"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryEditor = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const QueryEditor = ({ onExecuteQuery, isLoading, error }) => {
    const [query, setQuery] = (0, react_1.useState)('SELECT * FROM df LIMIT 10');
    const [isExecuting, setIsExecuting] = (0, react_1.useState)(false);
    const handleExecute = () => {
        if (query.trim() && !isExecuting) {
            setIsExecuting(true);
            onExecuteQuery(query).finally(() => setIsExecuting(false));
        }
    };
    const handleKeyDown = (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            handleExecute();
        }
    };
    const disabled = isLoading || isExecuting || !query.trim();
    return ((0, jsx_runtime_1.jsxs)("div", Object.assign({ style: { display: 'flex', flexDirection: 'column', padding: '10px', backgroundColor: '#f8f8f8', border: '1px solid #ddd', borderRadius: '4px' } }, { children: [(0, jsx_runtime_1.jsx)("label", Object.assign({ htmlFor: "query-input", style: { fontWeight: 'bold', display: 'block', marginBottom: '5px' } }, { children: "SQL Query" })), (0, jsx_runtime_1.jsx)("textarea", { id: "query-input", value: query, onChange: e => setQuery(e.target.value), onKeyDown: handleKeyDown, style: { width: '100%', height: '100px', fontFamily: 'monospace', fontSize: '14px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', resize: 'vertical' }, placeholder: "Enter your SQL query here...", disabled: isLoading || isExecuting }), (0, jsx_runtime_1.jsx)("div", Object.assign({ style: { display: 'flex', justifyContent: 'flex-end', marginTop: '10px' } }, { children: (0, jsx_runtime_1.jsx)("button", Object.assign({ onClick: handleExecute, disabled: disabled, style: { padding: '8px 16px', backgroundColor: '#007acc', color: 'white', border: 'none', borderRadius: '4px', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1 } }, { children: isExecuting ? 'Executing...' : 'Execute Query' })) })), error && ((0, jsx_runtime_1.jsxs)("div", Object.assign({ style: { marginTop: '10px', padding: '8px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '4px', border: '1px solid #ffcdd2' } }, { children: ["Error: ", error] })))] })));
};
exports.QueryEditor = QueryEditor;
