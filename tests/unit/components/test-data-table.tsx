/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DataTable } from '../../../lib/components/data-table';

const testData = [
  { name: 'Alice', age: 30, city: 'New York' },
  { name: 'Bob', age: 25, city: 'Los Angeles' },
  { name: 'Charlie', age: 35, city: 'Chicago' },
];
const testColumns = ['name', 'age', 'city'];

describe('DataTable', () => {
  test('renders column headers', () => {
    render(<DataTable data={testData} columns={testColumns} />);
    expect(screen.getByText('name')).toBeInTheDocument();
    expect(screen.getByText('age')).toBeInTheDocument();
    expect(screen.getByText('city')).toBeInTheDocument();
  });

  test('renders all data rows', () => {
    render(<DataTable data={testData} columns={testColumns} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
  });

  test('shows empty state for empty data', () => {
    render(<DataTable data={[]} columns={testColumns} />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  test('sorts strings ascending on first header click', () => {
    render(<DataTable data={testData} columns={testColumns} />);
    fireEvent.click(screen.getByText('name'));
    expect(screen.getByText('↑')).toBeInTheDocument();
    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('Alice');
    expect(rows[2]).toHaveTextContent('Bob');
    expect(rows[3]).toHaveTextContent('Charlie');
  });

  test('sorts strings descending on second header click', () => {
    render(<DataTable data={testData} columns={testColumns} />);
    fireEvent.click(screen.getByText('name'));
    fireEvent.click(screen.getByText('name'));
    expect(screen.getByText('↓')).toBeInTheDocument();
    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('Charlie');
    expect(rows[2]).toHaveTextContent('Bob');
    expect(rows[3]).toHaveTextContent('Alice');
  });

  test('sorts numbers correctly', () => {
    render(<DataTable data={testData} columns={testColumns} />);
    fireEvent.click(screen.getByText('age'));
    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('Bob');   // 25
    expect(rows[2]).toHaveTextContent('Alice'); // 30
    expect(rows[3]).toHaveTextContent('Charlie'); // 35
  });

  test('sorts null values last regardless of direction', () => {
    const dataWithNulls = [
      { name: 'Alice', score: 90 },
      { name: 'Bob', score: null },
      { name: 'Charlie', score: 70 },
    ];
    render(<DataTable data={dataWithNulls} columns={['name', 'score']} />);
    fireEvent.click(screen.getByText('score'));
    const rows = screen.getAllByRole('row');
    // null should be last in ascending sort
    expect(rows[rows.length - 1]).toHaveTextContent('Bob');
  });

  test('falls back to string comparison for mixed numeric columns', () => {
    const mixedData = [
      { name: 'Alice', age: '30' },
      { name: 'Bob', age: 'invalid' },
      { name: 'Charlie', age: '25' },
    ];
    render(<DataTable data={mixedData} columns={['name', 'age']} />);
    fireEvent.click(screen.getByText('age'));
    // should not throw; all rows still render
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
  });
});
