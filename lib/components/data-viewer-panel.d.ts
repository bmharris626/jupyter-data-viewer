import React from 'react';
interface IDataViewerProps {
    data: any[];
    columns: string[];
    loading: boolean;
    error?: string;
    filePath: string;
    onExecuteQuery?: (query: string) => Promise<any>;
}
declare const DataViewerPanel: React.FC<IDataViewerProps>;
export { DataViewerPanel };
