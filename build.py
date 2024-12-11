import os
from PyInstaller.__main__ import run

def package():
  basePath = os.path.abspath(__file__)
  basePath = os.path.dirname(basePath)
    
  opts = [
    '--clean',
    '-F',
    '{}/launch.py'.format(basePath),
    # '-w',
    '--icon','{}/build/icon.ico'.format(basePath),
    '--add-data', '{}/build;build'.format(basePath),
    '--add-binary', r'{}/api/exiv2api.pyd;pyexiv2/lib/py3.12-win'.format(basePath),
    '--collect-binaries=pyexiv2',
    '--name', "imageset-editor",
    "--hidden-import=launch",
  ]
  run(opts)
   
if __name__ == '__main__':
  package()

