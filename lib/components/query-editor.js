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
exports.QueryEditor = void 0;
const react_1 = __importStar(require("react"));
const QueryEditor = ({ onExecuteQuery, isLoading, error }) => {
    const [query, setQuery] = (0, react_1.useState)('SELECT * FROM df LIMIT 10');
    const [isExecuting, setIsExecuting] = (0, react_1.useState)(false);
    const handleExecute = () => {
        if (query.trim() && !isExecuting) {
            setIsExecuting(true);
            onExecuteQuery(query)
                .finally(() => setIsExecuting(false));
        }
    };
    const handleKeyDown = (e) => {
        // Execute on Ctrl+Enter
        if (e.ctrlKey && e.key === 'Enter') {
            handleExecute();
        }
    };
    return (<div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            padding: '10px',
            backgroundColor: '#f8f8f8',
            border: '1px solid #ddd',
            borderRadius: '4px'
        }}>
      <div style={{ marginBottom: '10px' }}>
        <label htmlFor="query-input" style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
          SQL Query
        </label>
        <textarea id="query-input" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={handleKeyDown} style={{
            width: '100%',
            height: '100px',
            fontFamily: 'monospace',
            fontSize: '14px',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            resize: 'vertical'
        }} placeholder="Enter your SQL query here..." disabled={isLoading || isExecuting}/>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={handleExecute} disabled={isLoading || isExecuting || !query.trim()} style={{
            padding: '8px 16px',
            backgroundColor: '#007acc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading || isExecuting || !query.trim() ? 'not-allowed' : 'pointer',
            opacity: isLoading || isExecuting || !query.trim() ? 0.6 : 1
        }}>
          {isExecuting ? 'Executing...' : 'Execute Query'}
        </button>
      </div>
      
      {error && (<div style={{
                marginTop: '10px',
                padding: '8px',
                backgroundColor: '#ffebee',
                color: '#c62828',
                borderRadius: '4px',
                border: '1px solid #ffcdd2'
            }}>
          Error: {error}
        </div>)}
    </div>);
};
exports.QueryEditor = QueryEditor;
