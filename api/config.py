'''
python 全局配置类

直接根据需要修改对应的配置项目即可
'''

import json, os
import sys

# 需要配置前端文件夹地址
if getattr(sys, "frozen", False):
  base_path = sys._MEIPASS
else:
  base_path = os.path.abspath(".")

print(base_path)

CONFIG = {
  # 先设置默认值
  'PORT': 1420,
  'HOST': 'localhost',
  'REPO_DIR': os.path.join(os.getcwd(), 'repo'), 
  'IMAGE_EXT': 'JPEG', # 将图片保存为 jpeg 还是 png
  'WEB_DIR': os.path.join(base_path, 'build'), # 定义为这个路径再来尝试一下
}




CONF_PATH = os.path.join(os.getcwd(), 'config.json')
try:
  with open(CONF_PATH, 'r') as f:
    config = json.load(f)
    CONFIG.update(config)
except:
  print('did not found config.json, use default config')
  pass



CONF_PORT = CONFIG['PORT']
CONF_HOST = CONFIG['HOST']
CONF_REPO_DIR = CONFIG['REPO_DIR']
CONF_IMAGE_EXT = CONFIG['IMAGE_EXT']
CONF_WEB_DIR = CONFIG['WEB_DIR']

if not os.path.exists(CONF_REPO_DIR):
  os.makedirs(CONF_REPO_DIR, exist_ok=True)







