import { showDialog, Dialog } from '@jupyterlab/apputils';
import { JupyterFrontEnd } from '@jupyterlab/application';
import { IFileBrowserFactory } from '@jupyterlab/filebrowser';
import { DataService } from './services/data-service';

export async function openFileViewer(
  _app: JupyterFrontEnd,
  fileBrowserFactory: IFileBrowserFactory
): Promise<void> {
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
  const filePath = (selected.value as any).path as string;
  const dataService = new DataService();
  try {
    const data = await dataService.fetchFileData(filePath);
    await showDialog({
      title: 'Data Viewer',
      body: `Data successfully loaded from ${filePath}`,
      buttons: [Dialog.okButton()]
    });
    console.log('Data loaded successfully:', data);
  } catch (error) {
    console.error('Error loading data:', error);
    await showDialog({
      title: 'Error',
      body: `Failed to load data from ${filePath}: ${error}`,
      buttons: [Dialog.okButton()]
    });
  }
}
