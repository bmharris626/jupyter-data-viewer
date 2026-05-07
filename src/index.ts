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

    // Two factories are needed because Parquet is binary (modelName: 'base64')
    // while CSV/TSV/JSON are text.  Using 'text' for Parquet causes the
    // ContentsManager to reject it with a UTF-8 decode error before our widget
    // ever opens.  The widget itself ignores the model content entirely — it
    // fetches data via our own API — so the model type only matters for the
    // initial ContentsManager read.
    const textFactory = new DataViewerFactory({
      name: 'Data Viewer',
      modelName: 'text',
      fileTypes: ['csv', 'tsv', 'json'],
      defaultFor: ['csv', 'tsv', 'json']
    });
    app.docRegistry.addWidgetFactory(textFactory);

    const binaryFactory = new DataViewerFactory({
      name: 'Data Viewer (binary)',
      modelName: 'base64',
      fileTypes: ['parquet'],
      defaultFor: ['parquet']
    });
    app.docRegistry.addWidgetFactory(binaryFactory);
  }
};

export default plugin;
