from services import *


def start(develop: bool, port: int):
  """Start Eel with either production or development configuration."""

  if develop:
    directory = 'src'
    app = None
    page = {'port': 3000}
  else:
    directory = 'build'
    app = 'chrome-app'
    page = '' # 初始路径
    with open('build/config.js', 'w') as f:
      f.write(f'window.api_port = {port};')

  eel.init(directory, ['.tsx', '.ts', '.jsx', '.js', '.html'])

  eel_kwargs = dict(
    host='localhost',
    port=port,
  )

  try:
    eel.start(page, mode=app, **eel_kwargs)
  except EnvironmentError:
    import sys, platform
    # If Chrome isn't found, fallback to Microsoft Edge on Win10 or greater
    if sys.platform in ['win32', 'win64'] and int(platform.release()) >= 10:
      eel.start(page, mode='edge', **eel_kwargs)
    else:
      raise
  

import argparse

def main():
  parser = argparse.ArgumentParser(description="imageset editor")
  parser.add_argument('--port', type=int, default=1420, help='端口, 默认 1420')
  parser.add_argument('--dev', action='store_true', help='以调试模式运行')
  parser.add_argument('--data_path', type=str, default="./tmp", help='数据的存放路径')
  
  args = parser.parse_args()
  if args.dev:
    logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
  else:
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
  
  start(args.dev, args.port)
  

# 设置一些参数 develop, port, 
if __name__ == '__main__':
  main()



