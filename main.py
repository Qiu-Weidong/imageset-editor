'''
严格按照这个格式来管理

数据集的格式
name
  src
    <n>_concept1
    <m>_concept2
  reg
    <t>_concept3
    <k>_concept4
  .imageset
    settings.json
    project.json
    
    
base_dir
  imageset-name1
  imageset-name2
  ...
  
'''

import platform
import sys, os
import eel
import logging


base_dir = './tmp'

@eel.expose
def find_imageset_list():
  imageset_names: list[str] = os.listdir(base_dir)
  imageset_names = [name[9:] for name in imageset_names if name.startswith('imageset-')]
  logging.info(f'found imageset {imageset_names}')
  return imageset_names


@eel.expose
def create_imageset(name: str):
  origin_name = name
  name = 'imageset-' + name
  imageset_path = os.path.join(base_dir, name)
  logging.info(f'create_imageset {imageset_path}')
  if not os.path.exists(imageset_path):
    os.mkdir(imageset_path)
    return origin_name
  # 创建失败
  raise Exception(f"imageset '{origin_name}' is existed.")
  



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
  logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
  
  # Pass any second argument to enable debugging
  if not main(develop=len(sys.argv) == 2):
    print('failed to start service.')