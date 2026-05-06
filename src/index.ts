import { JupyterFrontEnd, JupyterFrontEndPlugin } from '@jupyterlab/application';
import { IFileBrowserFactory } from '@jupyterlab/filebrowser';
import { DataViewerFactory } from './commands';

const PLUGIN_ID = 'jupyterlab-data-viewer:plugin';

const plugin: JupyterFrontEndPlugin<void> = {
  id: PLUGIN_ID,
  autoStart: true,
  requires: [IFileBrowserFactory],
  // IFileBrowserFactory is listed as a requirement only to ensure this plugin
  // activates after the file browser registers its built-in file types (csv,
  // tsv, json). Without it our factory binds before those types exist.
  activate: (app: JupyterFrontEnd, _fb: IFileBrowserFactory) => {
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
    const factory = new DataViewerFactory({
      name: 'Data Viewer',
      modelName: 'text',
      fileTypes: ['csv', 'tsv', 'json', 'parquet'],
      defaultFor: ['csv', 'tsv', 'json', 'parquet']
    });
    app.docRegistry.addWidgetFactory(factory);
  }
};

export default plugin;
