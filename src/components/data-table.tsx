import React, { useState, useMemo } from 'react';

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

const MAX_ROWS = 1000;

const DataTable: React.FC<{ data: any[]; columns: string[] }> = ({ data, columns }) => {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev && prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedData = useMemo(() => {
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

  if (!data || data.length === 0) {
    return (
      <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>No data available</p>
      </div>
    );
  }

  const displayData = sortedData.length > MAX_ROWS ? sortedData.slice(0, MAX_ROWS) : sortedData;

  return (
    <div style={{ height: '100%', width: '100%', overflow: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th
                key={i}
                onClick={() => handleSort(col)}
                style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ flex: 1 }}>{col}</span>
                  <span style={{ marginLeft: '4px' }}>
                    {sortConfig?.key === col ? (sortConfig.direction === 'asc' ? '↑' : '↓') : null}
                  </span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayData.map((row, ri) => (
            <tr key={ri}>
              {columns.map((col, ci) => (
                <td key={ci} style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {row[col] !== undefined ? String(row[col]) : ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length > MAX_ROWS && (
        <div style={{ padding: '8px', textAlign: 'center', fontSize: 'smaller', color: '#666' }}>
          Showing first {MAX_ROWS} of {data.length} rows
        </div>
      )}
    </div>
  );
};

export { DataTable };
