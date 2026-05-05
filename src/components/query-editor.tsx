import React, { useState } from 'react';

interface QueryEditorProps {
  onExecuteQuery: (query: string) => Promise<void>;
  isLoading: boolean;
  error?: string;
}

const QueryEditor: React.FC<QueryEditorProps> = ({ onExecuteQuery, isLoading, error }) => {
  const [query, setQuery] = useState('SELECT * FROM df LIMIT 10');
  const [isExecuting, setIsExecuting] = useState(false);

  const handleExecute = () => {
    if (query.trim() && !isExecuting) {
      setIsExecuting(true);
      onExecuteQuery(query).finally(() => setIsExecuting(false));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') {
      handleExecute();
    }
  };

  const disabled = isLoading || isExecuting || !query.trim();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', padding: '10px', backgroundColor: '#f8f8f8', border: '1px solid #ddd', borderRadius: '4px' }}>
      <label htmlFor="query-input" style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
        SQL Query
      </label>
      <textarea
        id="query-input"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{ width: '100%', height: '100px', fontFamily: 'monospace', fontSize: '14px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', resize: 'vertical' }}
        placeholder="Enter your SQL query here..."
        disabled={isLoading || isExecuting}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
        <button
          onClick={handleExecute}
          disabled={disabled}
          style={{ padding: '8px 16px', backgroundColor: '#007acc', color: 'white', border: 'none', borderRadius: '4px', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1 }}
        >
          {isExecuting ? 'Executing...' : 'Execute Query'}
        </button>
      </div>
      {error && (
        <div style={{ marginTop: '10px', padding: '8px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '4px', border: '1px solid #ffcdd2' }}>
          Error: {error}
        </div>
      )}
    </div>
  );
};

export { QueryEditor };
