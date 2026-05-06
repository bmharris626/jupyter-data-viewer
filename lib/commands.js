"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataViewerFactory = void 0;
const react_1 = __importStar(require("react"));
const apputils_1 = require("@jupyterlab/apputils");
const docregistry_1 = require("@jupyterlab/docregistry");
const data_viewer_panel_1 = require("./components/data-viewer-panel");
const data_service_1 = require("./services/data-service");
function AsyncDataViewer({ filePath, dataService }) {
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [data, setData] = (0, react_1.useState)([]);
    const [columns, setColumns] = (0, react_1.useState)([]);
    const [totalRows, setTotalRows] = (0, react_1.useState)(0);
    const [error, setError] = (0, react_1.useState)();
    (0, react_1.useEffect)(() => {
        let cancelled = false;
        dataService
            .fetchFileData(filePath)
            .then(result => {
            if (cancelled)
                return;
            setData(result.data);
            setColumns(result.columns);
            setTotalRows(result.total_rows);
            setLoading(false);
        })
            .catch(e => {
            if (cancelled)
                return;
            setError(String(e));
            setLoading(false);
        });
        return () => {
            cancelled = true;
        };
    }, [filePath]);
    if (loading) {
        return react_1.default.createElement('div', {
            style: {
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--jp-ui-font-color2, #888)',
                fontSize: '13px',
                fontFamily: 'var(--jp-ui-font-family, system-ui, sans-serif)'
            }
        }, `Loading ${filePath}...`);
    }
    if (error) {
        return react_1.default.createElement('div', {
            style: {
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--jp-error-color1, #c62828)',
                fontSize: '13px',
                fontFamily: 'var(--jp-ui-font-family, system-ui, sans-serif)'
            }
        }, `Error: ${error}`);
    }
    return react_1.default.createElement(data_viewer_panel_1.DataViewerPanel, {
        filePath,
        data,
        columns,
        totalRows,
        loading: false,
        onExecuteQuery: (query) => dataService.executeQuery(filePath, query),
        onFetchPage: (offset, limit) => dataService.fetchFileData(filePath, offset, limit)
    });
}
class DataViewerWidget extends apputils_1.ReactWidget {
    constructor(_filePath, _dataService) {
        super();
        this._filePath = _filePath;
        this._dataService = _dataService;
        this.addClass('jp-DataViewerWidget');
    }
    render() {
        return react_1.default.createElement(AsyncDataViewer, {
            filePath: this._filePath,
            dataService: this._dataService
        });
    }
}
class DataViewerFactory extends docregistry_1.ABCWidgetFactory {
    constructor() {
        super(...arguments);
        this._dataService = new data_service_1.DataService();
    }
    createNewWidget(context) {
        const content = new DataViewerWidget(context.localPath, this._dataService);
        const widget = new docregistry_1.DocumentWidget({ content, context });
        widget.toolbar.hide();
        return widget;
    }
}
exports.DataViewerFactory = DataViewerFactory;
