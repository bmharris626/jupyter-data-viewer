import { JupyterFrontEnd } from '@jupyterlab/application';
import { IFileViewer } from './data-viewer-panel';
/**
 * API client for communicating with the backend
 */
export declare class ApiClient {
    private baseUrl;
    constructor(baseUrl?: string);
    /**
     * Gets file data from the backend
     *
     * @param path - The file path
     * @returns A promise that resolves to the file data
     */
    getFileData(path: string): Promise<any>;
    /**
     * Executes a query on data
     *
     * @param path - The file path
     * @param query - The SQL query to execute
     * @returns A promise that resolves to the query results
     */
    executeQuery(path: string, query: string): Promise<any>;
}
/**
 * Service for data operations
 */
export declare class DataService {
    private apiClient;
    constructor();
    /**
     * Fetches data from a file
     *
     * @param path - The file path
     * @returns A promise that resolves to the file data
     */
    fetchFileData(path: string): Promise<any>;
    /**
     * Executes a query on data
     *
     * @param path - The file path
     * @param query - The SQL query to execute
     * @returns A promise that resolves to the query results
     */
    executeQuery(path: string, query: string): Promise<any>;
}
/**
 * Creates a new data viewer panel for a file path
 *
 * @param filePath - The path to the file
 * @param app - The JupyterLab application instance
 * @returns A new file viewer instance
 */
export declare function createFileViewer(filePath: string, app: JupyterFrontEnd): IFileViewer;
