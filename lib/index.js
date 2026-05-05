"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const filebrowser_1 = require("@jupyterlab/filebrowser");
const apputils_1 = require("@jupyterlab/apputils");
const commands_1 = require("./commands");
const PLUGIN_ID = 'jupyterlab-data-viewer';
const SUPPORTED_EXTENSIONS = ['.csv', '.tsv', '.json', '.parquet'];
const main = {
    id: PLUGIN_ID,
    autoStart: true,
    requires: [filebrowser_1.IFileBrowserFactory, apputils_1.ICommandPalette],
    activate: (app, fileBrowserFactory, palette) => {
        app.commands.addCommand('data-viewer:open-file', {
            label: 'Open with Data Viewer',
            isVisible: () => {
                const browser = fileBrowserFactory.tracker.currentWidget;
                if (!browser) return false;
                const item = browser.selectedItems().next();
                if (item.done) return false;
                const name = item.value.name;
                const ext = name.slice(name.lastIndexOf('.'));
                return SUPPORTED_EXTENSIONS.includes(ext);
            },
            execute: () => (0, commands_1.openFileViewer)(app, fileBrowserFactory)
        });
        app.contextMenu.addItem({
            command: 'data-viewer:open-file',
            selector: '.jp-DirListing-item[data-isdir="false"]',
            rank: 10
        });
        palette.addItem({
            command: 'data-viewer:open-file',
            category: 'Data Viewer'
        });
    }
};
exports.default = main;
