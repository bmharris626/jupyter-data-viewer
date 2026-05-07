import os
from setuptools import setup

LAB_EXT = os.path.join("src", "jupyterlab_data_viewer", "labextension")
DEST = "share/jupyter/labextensions/jupyterlab-data-viewer"


def collect_data_files():
    pairs = []
    for dirpath, _, filenames in os.walk(LAB_EXT):
        rel = os.path.relpath(dirpath, LAB_EXT)
        dest = DEST if rel == "." else os.path.join(DEST, rel)
        sources = [os.path.join(dirpath, f) for f in filenames]
        if sources:
            pairs.append((dest, sources))
    pairs.append((
        "etc/jupyter/jupyter_server_config.d",
        ["jupyter-config/jupyter_server_config.d/jupyterlab_data_viewer.json"],
    ))
    return pairs


setup(data_files=collect_data_files())
