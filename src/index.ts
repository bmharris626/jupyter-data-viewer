import { JupyterFrontEnd, JupyterFrontEndPlugin } from '@jupyterlab/application';

/**
 * The plugin ID for the data viewer extension.
 */
const PLUGIN_ID = 'jupyterlab-data-viewer';

/**
 * The main plugin for the data viewer extension.
 */
const main: JupyterFrontEndPlugin<void> = {
  id: PLUGIN_ID,
  autoStart: true,
  activate: (_app: JupyterFrontEnd) => {
    console.log('Data Viewer plugin activated.');
  }
};

export default main;