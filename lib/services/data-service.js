"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataService = exports.ApiClient = void 0;
const coreutils_1 = require("@jupyterlab/coreutils");
function getCookie(name) {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
}
class ApiClient {
    constructor(baseUrl) {
        this.baseUrl =
            baseUrl !== null && baseUrl !== void 0 ? baseUrl : coreutils_1.URLExt.join(coreutils_1.PageConfig.getBaseUrl(), 'data-viewer');
    }
    async getFileData(path, offset = 0, limit = 2000) {
        const url = `${this.baseUrl}/file?path=${encodeURIComponent(path)}&offset=${offset}&limit=${limit}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch file data: ${response.status}`);
        }
        return response.json();
    }
    async executeQuery(path, query) {
        const xsrf = getCookie('_xsrf');
        const response = await fetch(`${this.baseUrl}/query`, {
            method: 'POST',
            headers: Object.assign({ 'Content-Type': 'application/json' }, (xsrf ? { 'X-XSRFToken': xsrf } : {})),
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
    async fetchFileData(path, offset = 0, limit = 2000) {
        return this.apiClient.getFileData(path, offset, limit);
    }
    async executeQuery(path, query) {
        return this.apiClient.executeQuery(path, query);
    }
}
exports.DataService = DataService;
