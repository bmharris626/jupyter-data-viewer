/// <reference types="react" />
import { DataResponse } from '../services/data-service';
interface IDataViewerProps {
    data: any[];
    columns: string[];
    totalRows?: number;
    loading: boolean;
    error?: string;
    filePath: string;
    onExecuteQuery?: (query: string) => Promise<DataResponse>;
    onFetchPage?: (offset: number, limit: number) => Promise<DataResponse>;
}
declare const DataViewerPanel: React.FC<IDataViewerProps>;
export { DataViewerPanel };
