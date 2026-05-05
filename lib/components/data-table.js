"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataTable = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const MAX_ROWS = 1000;
const DataTable = ({ data, columns }) => {
    const [sortConfig, setSortConfig] = (0, react_1.useState)(null);
    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev && prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };
    const sortedData = (0, react_1.useMemo)(() => {
        if (!data || data.length === 0)
            return [];
        if (!sortConfig)
            return data;
        return [...data].sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];
            if (aValue == null && bValue == null)
                return 0;
            if (aValue == null)
                return 1;
            if (bValue == null)
                return -1;
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortConfig.direction === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }
            const numA = Number(aValue);
            const numB = Number(bValue);
            if (isNaN(numA) || isNaN(numB)) {
                return sortConfig.direction === 'asc'
                    ? String(aValue).localeCompare(String(bValue))
                    : String(bValue).localeCompare(String(aValue));
            }
            return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
        });
    }, [data, sortConfig]);
    if (!data || data.length === 0) {
        return ((0, jsx_runtime_1.jsx)("div", Object.assign({ style: { height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, { children: (0, jsx_runtime_1.jsx)("p", { children: "No data available" }) })));
    }
    const displayData = sortedData.length > MAX_ROWS ? sortedData.slice(0, MAX_ROWS) : sortedData;
    return ((0, jsx_runtime_1.jsxs)("div", Object.assign({ style: { height: '100%', width: '100%', overflow: 'auto' } }, { children: [(0, jsx_runtime_1.jsxs)("table", Object.assign({ style: { borderCollapse: 'collapse', width: '100%' } }, { children: [(0, jsx_runtime_1.jsx)("thead", { children: (0, jsx_runtime_1.jsx)("tr", { children: columns.map((col, i) => ((0, jsx_runtime_1.jsx)("th", Object.assign({ onClick: () => handleSort(col), style: { border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', cursor: 'pointer' } }, { children: (0, jsx_runtime_1.jsxs)("div", Object.assign({ style: { display: 'flex', alignItems: 'center' } }, { children: [(0, jsx_runtime_1.jsx)("span", Object.assign({ style: { flex: 1 } }, { children: col })), (0, jsx_runtime_1.jsx)("span", Object.assign({ style: { marginLeft: '4px' } }, { children: (sortConfig === null || sortConfig === void 0 ? void 0 : sortConfig.key) === col ? (sortConfig.direction === 'asc' ? '↑' : '↓') : null }))] })) }), i))) }) }), (0, jsx_runtime_1.jsx)("tbody", { children: displayData.map((row, ri) => ((0, jsx_runtime_1.jsx)("tr", { children: columns.map((col, ci) => ((0, jsx_runtime_1.jsx)("td", Object.assign({ style: { border: '1px solid #ddd', padding: '8px' } }, { children: row[col] !== undefined ? String(row[col]) : '' }), ci))) }, ri))) })] })), data.length > MAX_ROWS && ((0, jsx_runtime_1.jsxs)("div", Object.assign({ style: { padding: '8px', textAlign: 'center', fontSize: 'smaller', color: '#666' } }, { children: ["Showing first ", MAX_ROWS, " of ", data.length, " rows"] })))] })));
};
exports.DataTable = DataTable;
