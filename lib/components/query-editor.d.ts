import React from 'react';
interface QueryEditorProps {
    onExecuteQuery: (query: string) => Promise<void>;
    isLoading: boolean;
    error?: string;
}
declare const QueryEditor: React.FC<QueryEditorProps>;
export { QueryEditor };
