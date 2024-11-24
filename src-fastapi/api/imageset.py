
from fastapi import APIRouter, HTTPException
from config import config
import os


api_imageset = APIRouter()



@api_imageset.get('/metadata')
async def get_imageset_metadata(name: str):
  imageset_dir = os.path.join(config.repo_dir, "imageset-" + name)
  base_url = f'http://{config.host}:{config.port}/image/imageset-{name}'
  train_data_dir = os.path.join(imageset_dir, 'src')
  train_data_url = f"{base_url}/src"
  reg_data_dir = os.path.join(imageset_dir, 'reg')
  reg_data_url = f"{base_url}/reg"
  
  # 拼接出缩略图的url
  # http://localhost:1420/image/imageset-mikasa/src/8_cloak/cloak___1.jpg
  def load_cover(concept_image_filenames: list[str]) -> str | None:
    if len(concept_image_filenames) <= 0:
      return None
    import random
    random_element = random.choice(concept_image_filenames)
    return random_element
  
  
  def get_metadata(data_dir: str, data_url: str) -> dict:
    import re
    ret = {
      'total_repeat': 0,
      'image_count': 0,
      'concepts': [],
    
      'image_count': 0,
    }

    image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'}
    pattern = r'^(?P<repeat>\d+)_(?P<concept>.+)$'

    for name in os.listdir(data_dir):
      match = re.match(pattern, name)
      if not match:
        continue
      # 获取当前concept的重复次数
      repeat: int = int(match.group('repeat'))
      concept_name: str = match.group('concept')
      

      # 获取目录下的图片文件的数量.
      concept_image_filenames = [os.path.join(name, filename) for filename in os.listdir(os.path.join(data_dir, name)) 
                    if os.path.splitext(filename)[1].lower() in image_extensions]
      # 将路径规范化
      concept_image_filenames = [os.path.normpath(filename).replace('\\', '/') for filename in concept_image_filenames]
      concept_image_urls = [f'{data_url}/{filename}' for filename in concept_image_filenames]
      cover = load_cover(concept_image_urls)
      count = len(concept_image_filenames)
      ret['concepts'].append({
        'name': concept_name, 
        'cover': cover,
        'repeat': repeat, 
        'image_count': count,
      })
      ret['image_count'] += count
      ret['total_repeat'] += repeat * count
    return ret
  
  if not os.path.exists(imageset_dir):
    raise HTTPException(status_code=404, detail=f'{imageset_dir} is not existed.')
  
  result = {}
  if os.path.exists(train_data_dir):
    # 如果存在数据集, 那么获取数据集的相关元信息
    result['train'] = get_metadata(train_data_dir, train_data_url)

  if os.path.exists(reg_data_dir):
    # 如果存在正则集, 那么获取正则集的相关元信息
    result['regular'] = get_metadata(reg_data_dir, reg_data_url)
  return result
    
@api_imageset.get("/create")  
async def create_imageset(name: str):
  origin_name = name
  name = 'imageset-' + name
  imageset_path = os.path.join(config.repo_dir, name)
  if not os.path.exists(imageset_path):
    os.mkdir(imageset_path)
    return origin_name
  # 创建失败
  raise HTTPException(status_code=400, detail=f"imageset {origin_name} is already exists.")

@api_imageset.get("/rename")  
async def rename_imageset(origin_name: str, new_name: str): 
  new_name = 'imageset-' + new_name
  origin_name = 'imageset-' + origin_name
  new_path = os.path.join(config.repo_dir, new_name)
  origin_path = os.path.join(config.repo_dir, origin_name)
  try:
    os.rename(origin_path, new_path)  
  except Exception as e:
    raise HTTPException(status_code=400, detail=str(e))
  return new_name


@api_imageset.delete("/delete")
async def delete_imageset(name: str):
  imageset_dir = os.path.join(config.repo_dir, 'imageset-' + name)
  import shutil
  shutil.rmtree(imageset_dir)

@api_imageset.get("/")
async def get_imageset_list():
  '''
    查找已经创建的所有数据集
  '''
  import os 
  imageset_names = os.listdir(config.repo_dir)
  imageset_names = [name[9:] for name in imageset_names if name.startswith('imageset-')]
  return imageset_names




