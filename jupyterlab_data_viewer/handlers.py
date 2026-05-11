"""Tornado handlers for the data viewer extension."""

import json
import os

import tornado
from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join

from .data_viewer import read_data_file, read_data_file_paged, execute_sql_query

MAX_QUERY_ROWS = 10000


def _resolve_path(handler, rel_path):
    """Return the absolute, symlink-resolved path for a relative path from the client.

    Uses the same path resolution as Jupyter's built-in editor: if the
    ContentsManager exposes _get_os_path(), delegate to it so our logic is
    identical to the regular file-open path.  Falls back to manual joining
    for non-FileContentsManager backends, stripping any leading slash so that
    os.path.join() cannot discard root_dir.

    Raises HTTPError 404 with diagnostic detail if the resolved path is not a file.
    """
    cm = handler.contents_manager

    if hasattr(cm, '_get_os_path'):
        raw = cm._get_os_path(rel_path)
    else:
        root_dir = (
            getattr(cm, 'root_dir', None)
            or handler.settings.get('root_dir')
            or handler.settings.get('server_root_dir')
            or os.getcwd()
        )
        root_dir = os.path.expanduser(root_dir)
        raw = os.path.join(root_dir, rel_path.lstrip('/'))

    path = os.path.realpath(raw)

    if not os.path.isfile(path):
        diag = {
            'rel': rel_path,
            'cm_class': type(cm).__name__,
            'cm_root_dir': getattr(cm, 'root_dir', '<unset>'),
            'raw': raw,
            'realpath': path,
            'lexists': os.path.lexists(raw),
            'exists': os.path.exists(raw),
            'isfile_raw': os.path.isfile(raw),
            'isfile_real': os.path.isfile(path),
        }
        raise tornado.web.HTTPError(404, f'File not found — diagnostics: {diag}')

    return path


class FileHandler(APIHandler):
    @tornado.web.authenticated
    def get(self):
        rel_path = self.get_argument('path')
        offset = int(self.get_argument('offset', '0'))
        limit = int(self.get_argument('limit', '2000'))
        path = _resolve_path(self, rel_path)
        try:
            page_df, total_rows, columns = read_data_file_paged(path, offset, limit)
        except ValueError as e:
            raise tornado.web.HTTPError(400, str(e))
        except Exception as e:
            raise tornado.web.HTTPError(500, f'Error reading file: {e}')
        self.finish(json.dumps({
            'data': json.loads(page_df.to_json(orient='records')),
            'columns': columns,
            'total_rows': total_rows,
            'offset': offset,
            'limit': limit,
        }))


class QueryHandler(APIHandler):
    @tornado.web.authenticated
    def post(self):
        body = self.get_json_body()
        rel_path = body.get('path', '')
        query = body.get('query', '')
        path = _resolve_path(self, rel_path)
        try:
            df = read_data_file(path)
            result_df = execute_sql_query(df, query)
        except ValueError as e:
            raise tornado.web.HTTPError(400, str(e))
        except Exception as e:
            raise tornado.web.HTTPError(500, f'Error executing query: {e}')
        capped = result_df.head(MAX_QUERY_ROWS)
        self.finish(json.dumps({
            'data': json.loads(capped.to_json(orient='records')),
            'columns': list(result_df.columns),
            'total_rows': len(result_df),
        }))


def setup_handlers(web_app):
    base_url = web_app.settings['base_url']
    handlers = [
        (url_path_join(base_url, 'data-viewer', 'file'), FileHandler),
        (url_path_join(base_url, 'data-viewer', 'query'), QueryHandler),
    ]
    web_app.add_handlers('.*$', handlers)
