import React, { useState, useEffect } from 'react';
import { ReactWidget } from '@jupyterlab/apputils';
import { ABCWidgetFactory, DocumentRegistry, DocumentWidget } from '@jupyterlab/docregistry';
import { DataViewerPanel } from './components/data-viewer-panel';
import { DataService } from './services/data-service';

interface AsyncDataViewerProps {
  filePath: string;
  dataService: DataService;
}

function AsyncDataViewer({ filePath, dataService }: AsyncDataViewerProps): JSX.Element {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    let cancelled = false;
    dataService
      .fetchFileData(filePath)
      .then(result => {
        if (cancelled) return;
        setData(result.data);
        setColumns(result.columns);
        setTotalRows(result.total_rows);
        setLoading(false);
      })
      .catch(e => {
        if (cancelled) return;
        setError(String(e));
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filePath]);

  if (loading) {
    return React.createElement(
      'div',
      {
        style: {
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--jp-ui-font-color2, #888)',
          fontSize: '13px',
          fontFamily: 'var(--jp-ui-font-family, system-ui, sans-serif)'
        }
      },
      `Loading ${filePath}...`
    );
  }

  if (error) {
    return React.createElement(
      'div',
      {
        style: {
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--jp-error-color1, #c62828)',
          fontSize: '13px',
          fontFamily: 'var(--jp-ui-font-family, system-ui, sans-serif)'
        }
      },
      `Error: ${error}`
    );
  }

  return React.createElement(DataViewerPanel, {
    filePath,
    data,
    columns,
    totalRows,
    loading: false,
    onExecuteQuery: (query: string) => dataService.executeQuery(filePath, query),
    onFetchPage: (offset: number, limit: number) =>
      dataService.fetchFileData(filePath, offset, limit)
  });
}

class DataViewerWidget extends ReactWidget {
  constructor(
    private _filePath: string,
    private _dataService: DataService
  ) {
    super();
    this.addClass('jp-DataViewerWidget');
  }

  render(): JSX.Element {
    return React.createElement(AsyncDataViewer, {
      filePath: this._filePath,
      dataService: this._dataService
    });
  }
}

export class DataViewerFactory extends ABCWidgetFactory<DocumentWidget<DataViewerWidget>> {
  private _dataService = new DataService();

  protected createNewWidget(
    context: DocumentRegistry.IContext<DocumentRegistry.IModel>
  ): DocumentWidget<DataViewerWidget> {
    const content = new DataViewerWidget(context.localPath, this._dataService);
    const widget = new DocumentWidget({ content, context });
    widget.toolbar.hide();
    return widget;
  }
}
