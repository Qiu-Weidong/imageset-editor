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
    r'--icon','{}/build/icon.ico'.format(basePath),
    r'--add-data', r'{}/build;build'.format(basePath),
    r'--name', "imageset-editor",
    r"--hidden-import=launch",
  ]
  run(opts)
   
if __name__ == '__main__':
  package()

