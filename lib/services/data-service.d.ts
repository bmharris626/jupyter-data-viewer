export interface DataResponse {
    data: Record<string, any>[];
    columns: string[];
    total_rows: number;
    offset?: number;
    limit?: number;
}
export declare class ApiClient {
    private baseUrl;
    constructor(baseUrl?: string);
    getFileData(path: string, offset?: number, limit?: number): Promise<DataResponse>;
    executeQuery(path: string, query: string): Promise<DataResponse>;
}
export declare class DataService {
    private apiClient;
    constructor();
    fetchFileData(path: string, offset?: number, limit?: number): Promise<DataResponse>;
    executeQuery(path: string, query: string): Promise<DataResponse>;
}
