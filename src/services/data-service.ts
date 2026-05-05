interface DataResponse {
  data: Record<string, any>[];
  columns: string[];
  total_rows: number;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl = '/data-viewer') {
    this.baseUrl = baseUrl;
  }

  async getFileData(path: string): Promise<DataResponse> {
    const response = await fetch(
      `${this.baseUrl}/file?path=${encodeURIComponent(path)}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch file data: ${response.status}`);
    }
    return response.json();
  }

  async executeQuery(path: string, query: string): Promise<DataResponse> {
    const response = await fetch(`${this.baseUrl}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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

  async fetchFileData(path: string): Promise<DataResponse> {
    return this.apiClient.getFileData(path);
  }

  async executeQuery(path: string, query: string): Promise<DataResponse> {
    return this.apiClient.executeQuery(path, query);
  }
}
