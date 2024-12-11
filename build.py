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
    '--add-data', r'{}/build;build'.format(basePath),
    '--name', "imageset-editor",
    "--hidden-import=launch",
  ]
  run(opts)
   
if __name__ == '__main__':
  package()

