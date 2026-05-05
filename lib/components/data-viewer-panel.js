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
exports.DataViewerPanel = void 0;
const react_1 = __importStar(require("react"));
const data_table_1 = require("./data-table");
const query_editor_1 = require("./query-editor");
// Main data viewer panel component
const DataViewerPanel = ({ data, columns, loading, error, filePath, onExecuteQuery }) => {
    const [queryData, setQueryData] = (0, react_1.useState)([]);
    const [queryColumns, setQueryColumns] = (0, react_1.useState)([]);
    const [queryError, setQueryError] = (0, react_1.useState)(null);
    const [isLoadingQuery, setIsLoadingQuery] = (0, react_1.useState)(false);
    const [showQueryEditor, setShowQueryEditor] = (0, react_1.useState)(false);
    // Handle query execution from the editor
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
        return (<div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Loading data from {filePath}...</div>
      </div>);
    }
    if (error) {
        return (<div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'red' }}>Error loading data: {error}</div>
      </div>);
    }
    return (<div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
      <h2>Data Viewer: {filePath}</h2>
      
      {/* Query Editor Toggle */}
      <div style={{ marginBottom: '10px' }}>
        <button onClick={() => setShowQueryEditor(!showQueryEditor)} style={{
            padding: '5px 10px',
            backgroundColor: showQueryEditor ? '#e0e0e0' : '#007acc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
        }}>
          {showQueryEditor ? 'Hide Query Editor' : 'Show Query Editor'}
        </button>
      </div>
      
      {/* Query Editor Section */}
      {showQueryEditor && (<div style={{ marginBottom: '10px' }}>
          <query_editor_1.QueryEditor onExecuteQuery={handleQueryExecution} isLoading={isLoadingQuery} error={queryError || undefined}/>
        </div>)}
      
      {/* Data Display */}
      <div style={{ flex: 1, height: 'calc(100% - 30px)', display: 'flex', flexDirection: 'column' }}>
        <h3>Original Data</h3>
        <div style={{ flex: 1, height: 'calc(100% - 30px)' }}>
          <data_table_1.DataTable data={data} columns={columns}/>
        </div>
        
        {/* Query Results */}
        {showQueryEditor && queryData.length > 0 && (<div>
            <h3>Query Results</h3>
            <div style={{ flex: 1, height: 'calc(100% - 30px)' }}>
              <data_table_1.DataTable data={queryData} columns={queryColumns}/>
            </div>
          </div>)}
      </div>
    </div>);
};
exports.DataViewerPanel = DataViewerPanel;
