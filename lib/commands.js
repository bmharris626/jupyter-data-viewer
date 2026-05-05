"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openFileViewer = void 0;
const apputils_1 = require("@jupyterlab/apputils");
const data_service_1 = require("./services/data-service");
async function openFileViewer(_app, fileBrowserFactory) {
    const browser = fileBrowserFactory.tracker.currentWidget;
    if (!browser) {
        console.error('No file browser available');
        return;
    }
    const selected = browser.selectedItems().next();
    if (selected.done) {
        console.error('No file selected');
        return;
    }
    const filePath = selected.value.path;
    const dataService = new data_service_1.DataService();
    try {
        const data = await dataService.fetchFileData(filePath);
        await (0, apputils_1.showDialog)({
            title: 'Data Viewer',
            body: `Data successfully loaded from ${filePath}`,
            buttons: [apputils_1.Dialog.okButton()]
        });
        console.log('Data loaded successfully:', data);
    }
    catch (error) {
        console.error('Error loading data:', error);
        await (0, apputils_1.showDialog)({
            title: 'Error',
            body: `Failed to load data from ${filePath}: ${error}`,
            buttons: [apputils_1.Dialog.okButton()]
        });
    }
}
exports.openFileViewer = openFileViewer;
