import { PageConfig, URLExt } from '@jupyterlab/coreutils';

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

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
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch file data: ${response.status}`);
    }
    return response.json();
  }

  async executeQuery(path: string, query: string): Promise<DataResponse> {
    const xsrf = getCookie('_xsrf');
    const response = await fetch(`${this.baseUrl}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(xsrf ? { 'X-XSRFToken': xsrf } : {})
      },
      body: JSON.stringify({ path, query })
    });
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
