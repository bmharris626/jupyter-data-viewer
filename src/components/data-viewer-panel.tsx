import React, { useState } from 'react';
import { DataTable } from './data-table';
import { QueryEditor } from './query-editor';

interface IDataViewerProps {
  data: any[];
  columns: string[];
  loading: boolean;
  error?: string;
  filePath: string;
  onExecuteQuery?: (query: string) => Promise<any>;
}

const DataViewerPanel: React.FC<IDataViewerProps> = ({ data, columns, loading, error, filePath, onExecuteQuery }) => {
  const [queryData, setQueryData] = useState<any[]>([]);
  const [queryColumns, setQueryColumns] = useState<string[]>([]);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [isLoadingQuery, setIsLoadingQuery] = useState(false);
  const [showQueryEditor, setShowQueryEditor] = useState(false);

  const handleQueryExecution = async (query: string) => {
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
    } catch (err) {
      setQueryError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoadingQuery(false);
    }
  };

  if (loading) {
    return (
      <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Loading data from {filePath}...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'red' }}>Error loading data: {error}</div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
      <h2>Data Viewer: {filePath}</h2>
      <div style={{ marginBottom: '10px' }}>
        <button
          onClick={() => setShowQueryEditor(v => !v)}
          style={{ padding: '5px 10px', backgroundColor: showQueryEditor ? '#e0e0e0' : '#007acc', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {showQueryEditor ? 'Hide Query Editor' : 'Show Query Editor'}
        </button>
      </div>
      {showQueryEditor && (
        <div style={{ marginBottom: '10px' }}>
          <QueryEditor onExecuteQuery={handleQueryExecution} isLoading={isLoadingQuery} error={queryError ?? undefined} />
        </div>
      )}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3>Original Data</h3>
        <DataTable data={data} columns={columns} />
        {showQueryEditor && queryData.length > 0 && (
          <>
            <h3>Query Results</h3>
            <DataTable data={queryData} columns={queryColumns} />
          </>
        )}
      </div>
    </div>
  );
};

export { DataViewerPanel };
