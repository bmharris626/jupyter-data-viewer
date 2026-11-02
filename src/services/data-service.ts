import { PageConfig, URLExt } from '@jupyterlab/coreutils';
import { ServerConnection } from '@jupyterlab/services';

export interface DataResponse {
  data: Record<string, any>[];
  columns: string[];
  total_rows: number;
  offset?: number;
  limit?: number;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl =
      baseUrl ?? URLExt.join(PageConfig.getBaseUrl(), 'data-viewer');
  }

  async getFileData(
    path: string,
    offset = 0,
    limit = 2000
  ): Promise<DataResponse> {
    const url = `${this.baseUrl}/file?path=${encodeURIComponent(path)}&offset=${offset}&limit=${limit}`;
    const response = await ServerConnection.makeRequest(
      url,
      {},
      ServerConnection.makeSettings()
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch file data: ${response.status}`);
    }
    return response.json();
  }

  async executeQuery(path: string, query: string): Promise<DataResponse> {
    const response = await ServerConnection.makeRequest(
      `${this.baseUrl}/query`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, query })
      },
      ServerConnection.makeSettings()
    );
    if (!response.ok) {
      throw new Error(`Failed to execute query: ${response.status}`);
    }
    return response.json();
  }
}

export class DataService {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = new ApiClient();
  }

  async fetchFileData(
    path: string,
    offset = 0,
    limit = 2000
  ): Promise<DataResponse> {
    return this.apiClient.getFileData(path, offset, limit);
  }

  async executeQuery(path: string, query: string): Promise<DataResponse> {
    return this.apiClient.executeQuery(path, query);
  }
}
