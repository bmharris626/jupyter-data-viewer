import { expect, test, jest } from '@jest/globals';

// Mock global fetch for API client tests
const mockFetch = jest.fn();
(global as any).fetch = mockFetch;

describe('ApiClient', () => {
  let ApiClient: any; // We'll import and test the class

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('should initialize with default base URL', () => {
    // Import the actual class
    const { ApiClient: ActualApiClient } = require('../../lib/services/data-service');
    const client = new ActualApiClient();
    expect(client).toBeDefined();
  });

  test('should initialize with custom base URL', () => {
    const { ApiClient: ActualApiClient } = require('../../lib/services/data-service');
    const client = new ActualApiClient('/custom/api');
    expect(client).toBeDefined();
  });

  test('should fetch file data successfully', async () => {
    const { ApiClient: ActualApiClient } = require('../../lib/services/data-service');
    const client = new ActualApiClient('http://localhost:8888/api/data');
    
    const mockData = {
      data: [{ name: 'John', age: 25 }],
      columns: ['name', 'age'],
      total_rows: 1
    };
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockData)
    });

    const result = await client.getFileData('/test/path.csv');
    
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:8888/api/data/file?path=%2Ftest%2Fpath.csv');
    expect(result).toEqual(mockData);
  });

  test('should throw error when fetching file data fails', async () => {
    const { ApiClient: ActualApiClient } = require('../../lib/services/data-service');
    const client = new ActualApiClient('http://localhost:8888/api/data');
    
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    });

    await expect(client.getFileData('/test/path.csv')).rejects.toThrow('Failed to fetch file data: 500');
  });

  test('should execute query successfully', async () => {
    const { ApiClient: ActualApiClient } = require('../../lib/services/data-service');
    const client = new ActualApiClient('http://localhost:8888/api/data');
    
    const mockData = {
      data: [{ name: 'John', age: 25 }],
      columns: ['name', 'age'],
      total_rows: 1
    };
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockData)
    });

    const result = await client.executeQuery('/test/path.csv', 'SELECT * FROM df');
    
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:8888/api/data/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ path: '/test/path.csv', query: 'SELECT * FROM df' })
    });
    expect(result).toEqual(mockData);
  });

  test('should throw error when executing query fails', async () => {
    const { ApiClient: ActualApiClient } = require('../../lib/services/data-service');
    const client = new ActualApiClient('http://localhost:8888/api/data');
    
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    });

    await expect(client.executeQuery('/test/path.csv', 'SELECT * FROM df')).rejects.toThrow('Failed to execute query: 500');
  });
});
