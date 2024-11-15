
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

import os
import eel
import logging
from PIL import Image
import base64
import io

base_dir = './tmp'

@eel.expose
def find_imageset_list() -> list[str]:
  '''
    查找已经创建的所有数据集
  '''
  imageset_names: list[str] = os.listdir(base_dir)
  imageset_names = [name[9:] for name in imageset_names if name.startswith('imageset-')]
  return imageset_names


@eel.expose
def get_imageset_cover(name: str) -> dict:
  '''
    {
      'train': {
        'repeat': 12,
        'image_count': 34,
        'concept_count': 12
        'cover': 'base64',
      },
      'regular': {
      },
    }

    todo 将这个函数获取的结果给缓存下来
  '''

  imageset_dir = os.path.join(base_dir, 'imageset-' + name)
  train_data_dir = os.path.join(imageset_dir, 'src')
  reg_data_dir = os.path.join(imageset_dir, 'reg')
  
  def get_metadata(data_dir: str) -> dict:
    import re
    ret = {
      'cover': None, 
      'repeat': 0,
      'image_count': 0,
      'concept_count': 0,
    }

    image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'}
    pattern = r'^(?P<repeat>\d+)_(?P<concept>.+)$'
    
    imagefiles = []

    for name in os.listdir(data_dir):
      match = re.match(pattern, name)
      if match:
        
        repeat: int = int(match.group('repeat'))

        # 获取目录下的图片文件的数量.
        images = [os.path.join(data_dir, name, filename) for filename in os.listdir(os.path.join(data_dir, name)) 
                      if os.path.splitext(filename)[1].lower() in image_extensions]
        imagefiles.extend(images)
        
        count = len(images)
        ret['image_count'] += count
        ret['repeat'] += count * repeat
        ret['concept_count'] += 1
  
    if not ret['cover'] and len(imagefiles) > 0:
      import random
      random_element = random.choice(imagefiles)
      with Image.open(random_element) as img:
        # 创建缩略图
        img.thumbnail(size=(360, 360))
        
        # 将缩略图保存到一个字节流中
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")  # 可以选择不同的格式，例如 "JPEG"
        
        # 获取字节流的内容并转换为 Base64 编码
        img_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8').replace("\r\n", "")
        img_base64 = f'data:image/{random_element};base64,{img_base64}'
        ret['cover'] = img_base64
    return ret
  
  result = {}
  if os.path.exists(train_data_dir):
    # 如果存在数据集, 那么获取数据集的相关元信息
    result['train'] = get_metadata(train_data_dir)

  if os.path.exists(reg_data_dir):
    # 如果存在正则集, 那么获取正则集的相关元信息
    result['regular'] = get_metadata(reg_data_dir)

  return result



@eel.expose
def create_imageset(name: str) -> str:
  origin_name = name
  name = 'imageset-' + name
  imageset_path = os.path.join(base_dir, name)
  logging.info(f'create_imageset {imageset_path}')
  if not os.path.exists(imageset_path):
    os.mkdir(imageset_path)
    return origin_name
  # 创建失败
  raise Exception(f"imageset '{origin_name}' is existed.")
  

