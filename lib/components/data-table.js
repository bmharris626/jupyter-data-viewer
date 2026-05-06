"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataTable = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
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
            const av = a[sortConfig.key];
            const bv = b[sortConfig.key];
            if (av == null && bv == null)
                return 0;
            if (av == null)
                return 1;
            if (bv == null)
                return -1;
            const na = Number(av);
            const nb = Number(bv);
            if (!isNaN(na) && !isNaN(nb))
                return sortConfig.direction === 'asc' ? na - nb : nb - na;
            return sortConfig.direction === 'asc'
                ? String(av).localeCompare(String(bv))
                : String(bv).localeCompare(String(av));
        });
    }, [data, sortConfig]);
    if (!data || data.length === 0) {
        return ((0, jsx_runtime_1.jsx)("div", Object.assign({ style: {
                padding: '32px',
                textAlign: 'center',
                color: 'var(--jp-ui-font-color2, #888)',
                fontSize: '13px'
            } }, { children: "No data available" })));
    }
    const sortIcon = (col) => {
        if (!sortConfig || sortConfig.key !== col)
            return (0, jsx_runtime_1.jsx)("span", Object.assign({ style: { opacity: 0.25, marginLeft: '4px' } }, { children: "\u21C5" }));
        return ((0, jsx_runtime_1.jsx)("span", Object.assign({ style: { opacity: 0.8, marginLeft: '4px' } }, { children: sortConfig.direction === 'asc' ? '↑' : '↓' })));
    };
    return ((0, jsx_runtime_1.jsx)("div", Object.assign({ style: { width: '100%' } }, { children: (0, jsx_runtime_1.jsxs)("table", Object.assign({ style: tableStyle }, { children: [(0, jsx_runtime_1.jsx)("thead", { children: (0, jsx_runtime_1.jsx)("tr", { children: columns.map((col, i) => ((0, jsx_runtime_1.jsx)("th", Object.assign({ onClick: () => handleSort(col), style: Object.assign(Object.assign({}, thStyle), { color: sortConfig && sortConfig.key === col
                                    ? 'var(--jp-brand-color1, #1976d2)'
                                    : 'var(--jp-ui-font-color1, #111)' }) }, { children: (0, jsx_runtime_1.jsxs)("div", Object.assign({ style: thInnerStyle }, { children: [(0, jsx_runtime_1.jsx)("span", { children: col }), sortIcon(col)] })) }), i))) }) }), (0, jsx_runtime_1.jsx)("tbody", { children: sortedData.map((row, ri) => ((0, jsx_runtime_1.jsx)("tr", Object.assign({ style: ri % 2 === 0 ? trEvenStyle : trOddStyle }, { children: columns.map((col, ci) => ((0, jsx_runtime_1.jsx)("td", Object.assign({ style: tdStyle }, { children: row[col] !== undefined && row[col] !== null
                                ? String(row[col])
                                : '' }), ci))) }), ri))) })] })) })));
};
exports.DataTable = DataTable;
const tableStyle = {
    borderCollapse: 'collapse',
    width: '100%',
    fontSize: '12px',
    fontFamily: 'var(--jp-ui-font-family, system-ui, sans-serif)'
};
const thStyle = {
    padding: '7px 12px',
    textAlign: 'left',
    fontWeight: 600,
    fontSize: '11px',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    backgroundColor: 'var(--jp-layout-color2, #f5f5f5)',
    borderBottom: '2px solid var(--jp-border-color1, #e0e0e0)',
    borderRight: '1px solid var(--jp-border-color2, #eee)',
    cursor: 'pointer',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    position: 'sticky',
    top: 0,
    zIndex: 1
};
const thInnerStyle = {
    display: 'flex',
    alignItems: 'center'
};
const trEvenStyle = {
    backgroundColor: 'var(--jp-layout-color1, #fff)'
};
const trOddStyle = {
    backgroundColor: 'var(--jp-layout-color0, #fafafa)'
};
const tdStyle = {
    padding: '5px 12px',
    borderBottom: '1px solid var(--jp-border-color2, #eee)',
    borderRight: '1px solid var(--jp-border-color2, #eee)',
    color: 'var(--jp-content-font-color1, #111)',
    whiteSpace: 'nowrap',
    maxWidth: '320px',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
};
