"""JupyterLab data viewer extension."""

from ._version import __version__
from .handlers import setup_handlers


def _jupyter_labextension_paths():
    return [{"src": "labextension", "dest": "jupyterlab-data-viewer"}]


def _jupyter_server_extension_points():
    return [{"module": "jupyterlab_data_viewer"}]


def _load_jupyter_server_extension(server_app):
    setup_handlers(server_app.web_app)
