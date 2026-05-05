"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataTable = void 0;
const react_1 = __importStar(require("react"));
// Simple data table component with sorting
const DataTable = ({ data, columns }) => {
    const [sortConfig, setSortConfig] = (0, react_1.useState)(null);
    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev && prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };
    const sortedData = (0, react_1.useMemo)(() => {
        if (!data || data.length === 0) return [];
        if (!sortConfig) return data;
        return [...data].sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];
            if (aValue == null && bValue == null) return 0;
            if (aValue == null) return 1;
            if (bValue == null) return -1;
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
    const renderSortIndicator = (key) => {
        if (!sortConfig || sortConfig.key !== key) return null;
        return sortConfig.direction === 'asc' ? '↑' : '↓';
    };
    if (!data || data.length === 0) {
        return (<div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>No data available</p>
      </div>);
    }
    const MAX_ROWS = 1000;
    const displayData = sortedData.length > MAX_ROWS ? sortedData.slice(0, MAX_ROWS) : sortedData;
    return (<div style={{ height: '100%', width: '100%', overflow: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            {columns.map((col, index) => (<th key={index} style={{
                border: '1px solid #ddd',
                padding: '8px',
                backgroundColor: '#f2f2f2',
                cursor: 'pointer',
                position: 'relative'
            }} onClick={() => handleSort(col)}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ flex: 1 }}>{col}</span>
                  <span style={{ marginLeft: '4px' }}>{renderSortIndicator(col)}</span>
                </div>
              </th>))}
          </tr>
        </thead>
        <tbody>
          {displayData.map((row, rowIndex) => (<tr key={rowIndex}>
              {columns.map((col, colIndex) => (<td key={colIndex} style={{
                    border: '1px solid #ddd',
                    padding: '8px'
                }}>
                  {row[col] !== undefined ? String(row[col]) : ''}
                </td>))}
            </tr>))}
        </tbody>
      </table>
      {data.length > MAX_ROWS && (<div style={{ padding: '8px', textAlign: 'center', fontSize: 'smaller', color: '#666' }}>
          Showing first {MAX_ROWS} of {data.length} rows
        </div>)}
    </div>);
};
exports.DataTable = DataTable;
