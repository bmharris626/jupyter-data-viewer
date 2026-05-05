import { expect, describe, test, jest, beforeEach } from '@jest/globals';

const mockFetch = jest.fn();
(global as any).fetch = mockFetch;

describe('DataService', () => {
  let DataService: any;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    ({ DataService } = require('../../lib/services/data-service'));
  });

  test('fetchFileData calls GET /data-viewer/file with encoded path', async () => {
    const mockResponse = {
      data: [{ name: 'Alice', age: 30 }],
      columns: ['name', 'age'],
      total_rows: 1,
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse),
    });

    const service = new DataService();
    const result = await service.fetchFileData('/data/file.csv');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      '/data-viewer/file?path=%2Fdata%2Ffile.csv'
    );
    expect(result).toEqual(mockResponse);
  });

  test('fetchFileData throws on HTTP error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });

    const service = new DataService();
    await expect(service.fetchFileData('/missing.csv')).rejects.toThrow(
      'Failed to fetch file data: 404'
    );
  });

  test('executeQuery calls POST /data-viewer/query with path and query', async () => {
    const mockResponse = {
      data: [{ name: 'Alice', age: 30 }],
      columns: ['name', 'age'],
      total_rows: 1,
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse),
    });

    const service = new DataService();
    const result = await service.executeQuery('/data/file.csv', 'SELECT * FROM df WHERE age > 25');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith('/data-viewer/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: '/data/file.csv',
        query: 'SELECT * FROM df WHERE age > 25',
      }),
    });
    expect(result).toEqual(mockResponse);
  });

  test('executeQuery throws on HTTP error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

    const service = new DataService();
    await expect(
      service.executeQuery('/data/file.csv', 'SELECT * FROM df')
    ).rejects.toThrow('Failed to execute query: 500');
  });

  test('fetchFileData followed by executeQuery makes two independent fetch calls', async () => {
    const fileResponse = {
      data: [{ name: 'Alice' }, { name: 'Bob' }],
      columns: ['name'],
      total_rows: 2,
    };
    const queryResponse = {
      data: [{ name: 'Alice' }],
      columns: ['name'],
      total_rows: 1,
    };
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValue(fileResponse) })
      .mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValue(queryResponse) });

    const service = new DataService();
    const fileResult = await service.fetchFileData('/data/file.csv');
    const queryResult = await service.executeQuery('/data/file.csv', 'SELECT * FROM df WHERE name = \'Alice\'');

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(fileResult.total_rows).toBe(2);
    expect(queryResult.total_rows).toBe(1);
  });
});
