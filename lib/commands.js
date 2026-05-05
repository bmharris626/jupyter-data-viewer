"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openFileViewer = void 0;
const apputils_1 = require("@jupyterlab/apputils");
const data_service_1 = require("./services/data-service");
/**
 * Opens the file viewer for a given file path.
 *
 * @param app - The JupyterLab application instance
 * @param fileBrowserFactory - The file browser factory
 * @returns A promise that resolves when the viewer is opened
 */
async function openFileViewer(app, fileBrowserFactory) {
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
    // Initialize the data service
    const dataService = new data_service_1.DataService();
    try {
        // Fetch data from the file
        const data = await dataService.fetchFileData(filePath);
        // Show a success message
        await (0, apputils_1.showDialog)({
            title: 'Data Viewer',
            body: `Data successfully loaded from ${filePath}`,
            buttons: [apputils_1.Dialog.okButton()]
        });
        // In a real implementation, this would create an actual data viewer panel
        // For now, we'll just log that it's working
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
