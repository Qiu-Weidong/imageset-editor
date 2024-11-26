'''
python 全局配置类

直接根据需要修改对应的配置项目即可
'''

import json, os


CONFIG = {
  # 先设置默认值
  'PORT': 1420,
  'HOST': 'localhost',
  'REPO_DIR': os.path.join(os.getcwd(), 'tmp'),
  'IMAGE_EXT': 'jpg',
  'WEB_DIR': os.path.join(os.getcwd(), 'build'),
}




CONF_PATH = os.path.join(os.getcwd(), 'config.json')
try:
  with open(CONF_PATH, 'r') as f:
    config = json.load(f)
    CONFIG.update(config)
except:
  pass



CONF_PORT = CONFIG['PORT']
CONF_HOST = CONFIG['HOST']
CONF_REPO_DIR = CONFIG['REPO_DIR']
CONF_IMAGE_EXT = CONFIG['IMAGE_EXT']
CONF_WEB_DIR = CONFIG['WEB_DIR']












'''
class Config:
  import os 
  
  PORT= 1420
  HOST = 'localhost'
  REPO_DIR = os.path.normpath(os.path.abspath('../tmp')).replace('\\', '/')
  
  
  def __init__(self, config_filename: str):
    import os 
    # 还是先给一个默认值
    self.repo_dir = os.path.normpath(os.path.abspath('../tmp')).replace('\\', '/')
    self.port = 1420
    self.host = "localhost"
    self.image_ext = "jpg"
    
    try:
      self.load_from_file(config_filename)
    except Exception as e:
      print(e)

  def load_from_file(self, config_filename: str): 
    import json
    # 从 json 文件中加载配置 
    with open(config_filename, 'r') as file:
      data: dict = json.load(file)
    
    for key, value in data.items():
      setattr(self, key, value)
      
    if self.repo_dir is not None:
      # 如果是相对路径, 那么填充为绝对路径
      import os 
      # C:/Users/Qiu-Weidong/Documents/imageset-editor/tmp
      self.repo_dir = os.path.normpath(os.path.abspath(self.repo_dir)).replace('\\', '/')
config = Config('./settings.json')
'''


