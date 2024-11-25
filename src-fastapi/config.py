'''
python 全局配置类

直接根据需要修改对应的配置项目即可
'''


class Config:
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



