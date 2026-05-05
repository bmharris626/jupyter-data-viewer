import { JupyterFrontEnd, JupyterFrontEndPlugin } from '@jupyterlab/application';
import { ICommandPalette } from '@jupyterlab/apputils';
import { IFileBrowserFactory } from '@jupyterlab/filebrowser';
import { openFileViewer } from './commands';

const PLUGIN_ID = 'jupyterlab-data-viewer:plugin';
const SUPPORTED_EXTENSIONS = ['.csv', '.tsv', '.json', '.parquet'];

const plugin: JupyterFrontEndPlugin<void> = {
  id: PLUGIN_ID,
  autoStart: true,
  requires: [IFileBrowserFactory, ICommandPalette],
  activate: (app: JupyterFrontEnd, fileBrowserFactory: IFileBrowserFactory, palette: ICommandPalette) => {
    app.commands.addCommand('data-viewer:open-file', {
      label: 'Open with Data Viewer',
      isVisible: () => {
        const browser = fileBrowserFactory.tracker.currentWidget;
        if (!browser) return false;
        const item = browser.selectedItems().next();
        if (item.done) return false;
        const name = (item.value as any).name as string;
        const ext = name.slice(name.lastIndexOf('.'));
        return SUPPORTED_EXTENSIONS.includes(ext);
      },
      execute: () => openFileViewer(app, fileBrowserFactory)
    });

    app.contextMenu.addItem({
      command: 'data-viewer:open-file',
      selector: '.jp-DirListing-item[data-isdir="false"]',
      rank: 10
    });

    palette.addItem({ command: 'data-viewer:open-file', category: 'Data Viewer' });
  }
};

export default plugin;
