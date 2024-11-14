"""Main Python application file for the EEL-CRA demo."""

import platform
import sys, os
from pathlib import Path
import eel



@eel.expose
def create_imageset(base_dir: str, name: str):
  imageset_path = os.path.join(base_dir, name)
  if not os.path.exists(imageset_path):
    os.mkdir(imageset_path)
    # 返回创建成功
  
  # 创建失败
  
  
@eel.expose  
def open_imageset(imageset_path: str):
  pass  


def main(develop):
  """Start Eel with either production or development configuration."""

  if develop:
    directory = 'src'
    app = None
    page = {'port': 3000}
  else:
    directory = 'build'
    app = 'chrome-app'
    page = 'index.html'

  eel.init(directory, ['.tsx', '.ts', '.jsx', '.js', '.html'])

  eel_kwargs = dict(
    host='localhost',
    port=8080,
    size=(1280, 800),
  )
  try:
    eel.start(page, mode=app, **eel_kwargs)
  except EnvironmentError:
    # If Chrome isn't found, fallback to Microsoft Edge on Win10 or greater
    if sys.platform in ['win32', 'win64'] and int(platform.release()) >= 10:
      eel.start(page, mode='edge', **eel_kwargs)
    else:
      raise


if __name__ == '__main__':
  # Pass any second argument to enable debugging
  if not main(develop=len(sys.argv) == 2):
    print('failed to start service.')