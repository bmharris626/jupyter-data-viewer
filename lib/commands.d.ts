/// <reference types="react" />
import { ReactWidget } from '@jupyterlab/apputils';
import { ABCWidgetFactory, DocumentRegistry, DocumentWidget } from '@jupyterlab/docregistry';
import { DataService } from './services/data-service';
declare class DataViewerWidget extends ReactWidget {
    private _filePath;
    private _dataService;
    constructor(_filePath: string, _dataService: DataService);
    render(): JSX.Element;
}
export declare class DataViewerFactory extends ABCWidgetFactory<DocumentWidget<DataViewerWidget>> {
    private _dataService;
    protected createNewWidget(context: DocumentRegistry.IContext<DocumentRegistry.IModel>): DocumentWidget<DataViewerWidget>;
}
export {};
