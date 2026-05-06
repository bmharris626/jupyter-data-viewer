"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const filebrowser_1 = require("@jupyterlab/filebrowser");
const commands_1 = require("./commands");
const PLUGIN_ID = 'jupyterlab-data-viewer:plugin';
const plugin = {
    id: PLUGIN_ID,
    autoStart: true,
    requires: [filebrowser_1.IFileBrowserFactory],
    // IFileBrowserFactory is listed as a requirement only to ensure this plugin
    // activates after the file browser registers its built-in file types (csv,
    // tsv, json). Without it our factory binds before those types exist.
    activate: (app, _fb) => {
        // Parquet has no built-in JupyterLab file type — register one
        app.docRegistry.addFileType({
            name: 'parquet',
            displayName: 'Parquet File',
            extensions: ['.parquet'],
            mimeTypes: ['application/octet-stream'],
            iconClass: 'jp-MaterialIcon jp-SpreadsheetIcon'
        });
        // Register our factory as the default opener for all four file types.
        // Previous defaults (text editor, JSON viewer, etc.) remain available
        // via right-click → "Open With" automatically.
        const factory = new commands_1.DataViewerFactory({
            name: 'Data Viewer',
            modelName: 'text',
            fileTypes: ['csv', 'tsv', 'json', 'parquet'],
            defaultFor: ['csv', 'tsv', 'json', 'parquet']
        });
        app.docRegistry.addWidgetFactory(factory);
    }
};
exports.default = plugin;
