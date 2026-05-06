import { useState, useMemo, CSSProperties } from 'react';

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

const DataTable: React.FC<{ data: any[]; columns: string[] }> = ({
  data,
  columns
}) => {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction:
        prev && prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    if (!sortConfig) return data;
    return [...data].sort((a, b) => {
      const av = a[sortConfig.key];
      const bv = b[sortConfig.key];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
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
    return (
      <div
        style={{
          padding: '32px',
          textAlign: 'center',
          color: 'var(--jp-ui-font-color2, #888)',
          fontSize: '13px'
        }}
      >
        No data available
      </div>
    );
  }

  const sortIcon = (col: string) => {
    if (!sortConfig || sortConfig.key !== col)
      return <span style={{ opacity: 0.25, marginLeft: '4px' }}>⇅</span>;
    return (
      <span style={{ opacity: 0.8, marginLeft: '4px' }}>
        {sortConfig.direction === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  return (
    <div style={{ width: '100%' }}>
      <table style={tableStyle}>
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th
                key={i}
                onClick={() => handleSort(col)}
                style={{
                  ...thStyle,
                  color:
                    sortConfig && sortConfig.key === col
                      ? 'var(--jp-brand-color1, #1976d2)'
                      : 'var(--jp-ui-font-color1, #111)'
                }}
              >
                <div style={thInnerStyle}>
                  <span>{col}</span>
                  {sortIcon(col)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, ri) => (
            <tr key={ri} style={ri % 2 === 0 ? trEvenStyle : trOddStyle}>
              {columns.map((col, ci) => (
                <td key={ci} style={tdStyle}>
                  {row[col] !== undefined && row[col] !== null
                    ? String(row[col])
                    : ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export { DataTable };

const tableStyle: CSSProperties = {
  borderCollapse: 'collapse',
  width: '100%',
  fontSize: '12px',
  fontFamily: 'var(--jp-ui-font-family, system-ui, sans-serif)'
};

const thStyle: CSSProperties = {
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

const thInnerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center'
};

const trEvenStyle: CSSProperties = {
  backgroundColor: 'var(--jp-layout-color1, #fff)'
};

const trOddStyle: CSSProperties = {
  backgroundColor: 'var(--jp-layout-color0, #fafafa)'
};

const tdStyle: CSSProperties = {
  padding: '5px 12px',
  borderBottom: '1px solid var(--jp-border-color2, #eee)',
  borderRight: '1px solid var(--jp-border-color2, #eee)',
  color: 'var(--jp-content-font-color1, #111)',
  whiteSpace: 'nowrap',
  maxWidth: '320px',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
};
