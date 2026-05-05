import { JupyterFrontEnd } from '@jupyterlab/application';
import { IFileBrowserFactory } from '@jupyterlab/filebrowser';
/**
 * Opens the file viewer for a given file path.
 *
 * @param app - The JupyterLab application instance
 * @param fileBrowserFactory - The file browser factory
 * @returns A promise that resolves when the viewer is opened
 */
export declare function openFileViewer(app: JupyterFrontEnd, fileBrowserFactory: IFileBrowserFactory): Promise<void>;
