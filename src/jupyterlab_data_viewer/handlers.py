"""Tornado handlers for the data viewer extension."""

import json
import os

import tornado
from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join

from .data_viewer import read_data_file, execute_sql_query


class FileHandler(APIHandler):
    @tornado.web.authenticated
    def get(self):
        path = self.get_argument('path')
        if not os.path.exists(path):
            raise tornado.web.HTTPError(404, 'File not found')
        try:
            df = read_data_file(path)
        except ValueError as e:
            raise tornado.web.HTTPError(400, str(e))
        except Exception as e:
            raise tornado.web.HTTPError(500, f'Error reading file: {e}')
        self.finish(json.dumps({
            'data': json.loads(df.to_json(orient='records')),
            'columns': list(df.columns),
            'total_rows': len(df),
        }))


class QueryHandler(APIHandler):
    @tornado.web.authenticated
    def post(self):
        body = self.get_json_body()
        path = body.get('path', '')
        query = body.get('query', '')
        if not os.path.exists(path):
            raise tornado.web.HTTPError(404, 'File not found')
        try:
            df = read_data_file(path)
            result_df = execute_sql_query(df, query)
        except ValueError as e:
            raise tornado.web.HTTPError(400, str(e))
        except Exception as e:
            raise tornado.web.HTTPError(500, f'Error executing query: {e}')
        self.finish(json.dumps({
            'data': json.loads(result_df.to_json(orient='records')),
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
