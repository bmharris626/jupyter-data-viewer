interface DataResponse {
    data: Record<string, any>[];
    columns: string[];
    total_rows: number;
}
export declare class ApiClient {
    private baseUrl;
    constructor(baseUrl?: string);
    getFileData(path: string): Promise<DataResponse>;
    executeQuery(path: string, query: string): Promise<DataResponse>;
}
export declare class DataService {
    private apiClient;
    constructor();
    fetchFileData(path: string): Promise<DataResponse>;
    executeQuery(path: string, query: string): Promise<DataResponse>;
}
export {};
