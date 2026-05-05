"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataService = exports.ApiClient = void 0;
const coreutils_1 = require("@jupyterlab/coreutils");
class ApiClient {
    constructor(baseUrl) {
        this.baseUrl =
            baseUrl !== null && baseUrl !== void 0 ? baseUrl : coreutils_1.URLExt.join(coreutils_1.PageConfig.getBaseUrl(), 'data-viewer');
    }
    async getFileData(path) {
        const response = await fetch(`${this.baseUrl}/file?path=${encodeURIComponent(path)}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch file data: ${response.status}`);
        }
        return response.json();
    }
    async executeQuery(path, query) {
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
exports.ApiClient = ApiClient;
class DataService {
    constructor() {
        this.apiClient = new ApiClient();
    }
    async fetchFileData(path) {
        return this.apiClient.getFileData(path);
    }
    async executeQuery(path, query) {
        return this.apiClient.executeQuery(path, query);
    }
}
exports.DataService = DataService;
