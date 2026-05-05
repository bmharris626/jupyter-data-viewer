"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFileViewer = exports.DataService = exports.ApiClient = void 0;
/**
 * API client for communicating with the backend
 */
class ApiClient {
    constructor(baseUrl = '/data-viewer') {
        this.baseUrl = baseUrl;
    }
    /**
     * Gets file data from the backend
     *
     * @param path - The file path
     * @returns A promise that resolves to the file data
     */
    async getFileData(path) {
        const response = await fetch(`${this.baseUrl}/file?path=${encodeURIComponent(path)}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch file data: ${response.status}`);
        }
        return response.json();
    }
    /**
     * Executes a query on data
     *
     * @param path - The file path
     * @param query - The SQL query to execute
     * @returns A promise that resolves to the query results
     */
    async executeQuery(path, query) {
        const response = await fetch(`${this.baseUrl}/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ path, query })
        });
        if (!response.ok) {
            throw new Error(`Failed to execute query: ${response.status}`);
        }
        return response.json();
    }
}
exports.ApiClient = ApiClient;
/**
 * Service for data operations
 */
class DataService {
    constructor() {
        this.apiClient = new ApiClient();
    }
    /**
     * Fetches data from a file
     *
     * @param path - The file path
     * @returns A promise that resolves to the file data
     */
    async fetchFileData(path) {
        return this.apiClient.getFileData(path);
    }
    /**
     * Executes a query on data
     *
     * @param path - The file path
     * @param query - The SQL query to execute
     * @returns A promise that resolves to the query results
     */
    async executeQuery(path, query) {
        return this.apiClient.executeQuery(path, query);
    }
}
exports.DataService = DataService;
/**
 * Creates a new data viewer panel for a file path
 *
 * @param filePath - The path to the file
 * @param app - The JupyterLab application instance
 * @returns A new file viewer instance
 */
function createFileViewer(filePath, app) {
    // This will be implemented in phase 3
    return {
        path: filePath,
        title: `Data Viewer: ${filePath}`,
        content: 'Data viewer content will be implemented in phase 3'
    };
}
exports.createFileViewer = createFileViewer;
