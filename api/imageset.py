from fastapi import APIRouter, HTTPException,  File, UploadFile, Form
from pydantic import BaseModel
from .config import CONF_REPO_DIR, CONF_HOST, CONF_PORT
import os
from typing import List
from tqdm import tqdm
from PIL import Image


api_imageset = APIRouter()


'''
  所有的 path 都从 imageset-xxx/src/8_xxx 开始
  绝对路径直接使用 repo_dir/{path} 即可
  图片的url则直接 http://{config.host}:{config.port}/image/{path}即可
  图片的缩略图url则直接 http://{config.host}:{config.port}/image/thumbnail/{path}即可
'''

def get_next_image_count(target_dir: str):
    result = 0
    # 列出目标目录中的所有文件
    for file_name in os.listdir(target_dir):
      name, _ = os.path.splitext(file_name)
      try:
        number = int(name) + 1
        if number > result:
          result = number
      except:
        continue
    return result  # 返回下一个可用的序号

def get_concept_folder_list(train_or_regular_dir: str):
  '''
    从 imageset-xxx/src 目录下获取所有的概念列表
    ret [{ 'name': 'katana', 'repeat': 8, 'path': 'imageset-xx/src/8_katana' }, ...]
  '''
  import re
  pattern = r'^(?P<repeat>\d+)_(?P<concept>.+)$'

  result = []
  for name in os.listdir(os.path.join(CONF_REPO_DIR, train_or_regular_dir)):
    match = re.match(pattern, name)
    if not match:
      continue
    # 获取当前concept的重复次数
    repeat: int = int(match.group('repeat'))
    concept_name: str = match.group('concept')
    result.append({
      'name': concept_name, 
      'repeat': repeat, 
      'path': os.path.join(train_or_regular_dir, name)
    })
  return result

def get_image_list(concept_dir: str):
  '''
    从 imageset-xxx/src/8_katana 目录下获取所有的图片文件名称
    return ['imageset-xxx/src/8_katana/katana_000001.jpg', ...]
  '''
  image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp'}
  imagefilenames = [os.path.join(concept_dir, imagefilename) for imagefilename in os.listdir(os.path.join(CONF_REPO_DIR, concept_dir))
    if os.path.isfile(os.path.join(CONF_REPO_DIR, concept_dir, imagefilename)) and os.path.splitext(imagefilename)[1].lower() in image_extensions]
  imagefilenames = [os.path.normpath(imagefilename).replace('\\', '/') for imagefilename in imagefilenames]
  return imagefilenames

def convert_and_copy_images(source_dir, target_dir):  
  
  valid_image_extensions = {'jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp', '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp'}
  
  # 获取源目录下的所有图片文件
  files = [os.path.join(source_dir, filename) for filename in os.listdir(source_dir)]
  files = [filename for filename in files if os.path.isfile(filename) and os.path.splitext(filename)[1].lower() in valid_image_extensions]
  
  # image_count 应该初始化为已有图片的序号的最大值
  index = get_next_image_count(target_dir)
  image_count = 0
  
  from tqdm import tqdm
  
  for file_name in tqdm(files):
    source_path = os.path.join(source_dir, file_name)
    try:
      with Image.open(source_path) as img:
        img = img.convert("RGB")
        # 生成新的文件名
        new_file_name = f"{index:06d}.jpg"
        target_path = os.path.join(target_dir, new_file_name)
        # 保存为 JPG 格式
        img.save(target_path, "JPEG")
        # 增加计数器
        index += 1
        image_count += 1
    except Exception:
      continue
  return image_count

def load_caption(image_path: str):
  import pyexiv2, json
  image_path = os.path.join(CONF_REPO_DIR, image_path)
  metadata = pyexiv2.Image(image_path)
  tags = metadata.read_comment()
  metadata.close()
  try: 
    tags = json.loads(tags)
  except:
    tags = []
  return tags
  
  




@api_imageset.get('/metadata')
async def get_imageset_metadata(name: str):
  '''
    {
      'train': {
        'total_repeat': int, 
        'image_count': int,
        'concepts': [
          {
            'name': str,
            'cover': str, 
            'repeat': int, 
            'image_count': int,
          }
        ],
      },
      'regular': {
      },
    }
  '''
  train_dir = os.path.join('imageset-'+name, 'src')
  reg_dir = os.path.join('imageset-'+name, 'reg')
  
  
  # 拼接出缩略图的url
  # http://localhost:1420/image/imageset-mikasa/src/8_cloak/cloak___1.jpg
  def load_cover(concept_image_filenames: list[str]) -> str | None:
    if len(concept_image_filenames) <= 0:
      return None
    import random
    random_element = random.choice(concept_image_filenames)
    return random_element
  
  def get_metadata(train_or_regular_dir: str) -> dict:
    ret = {
      'total_repeat': 0,
      'image_count': 0,
      'concepts': [],
    }

    concepts = get_concept_folder_list(train_or_regular_dir)

    for concept in concepts:      
      concept_image_filenames = get_image_list(concept['path'])
      
      cover = load_cover(concept_image_filenames)
      count = len(concept_image_filenames)
      ret['concepts'].append({
        'name': concept['name'], 
        'cover': f"http://{CONF_HOST}:{CONF_PORT}/image/{cover}" if cover is not None else None ,
        'repeat': concept['repeat'], 
        'image_count': count,
      })
      ret['image_count'] += count
      ret['total_repeat'] += concept['repeat'] * count
    return ret
  
  if not os.path.exists(os.path.join(CONF_REPO_DIR, 'imageset-'+name)):
    raise HTTPException(status_code=404, detail=f'imageset {name} is not existed.')
  
  result = {}
  if os.path.exists(os.path.join(CONF_REPO_DIR, train_dir)):
    # 如果存在数据集, 那么获取数据集的相关元信息
    result['train'] = get_metadata(train_dir)

  if os.path.exists(os.path.join(CONF_REPO_DIR, reg_dir)):
    # 如果存在正则集, 那么获取正则集的相关元信息
    result['regular'] = get_metadata(reg_dir)
  return result

@api_imageset.get("/load")  
async def load(imageset_name: str, is_regular: bool):
  '''
    加载数据集中的所有图片元信息
  {
    "name": imageset_name, 
    "type": 'regular',
    "filters": [{
      "name": "1_katana", 
      "concept": { "name": "katana", "repeat": 1, },   
      "images": [],
    }],
  }
  '''
  imageset_dir = os.path.join('imageset-' + imageset_name)
  if is_regular:
    imageset_dir = os.path.join(imageset_dir, 'reg')
  else:
    imageset_dir = os.path.join(imageset_dir, 'src')
    
  # 传入文件夹的名称, 保证满足 8_xxx 这样的格式
  def load_concept(name: str, repeat: int, path: str):
    result = {
      "name": f"{repeat}_{name}", 
      "concept": { "name": name, "repeat": repeat, },
      "images": [], 
    }
    
    # 遍历下方的所有图片, 并添加到 result 中去, 注意这里的 imagefilenames 是包含了前缀的
    imagefilenames = get_image_list(path)
    for imagefilename in imagefilenames:
      basename = os.path.basename(imagefilename)
      filename, _ = os.path.splitext(basename)
      # 读取字幕/标签
      result['images'].append({
        'src': f'http://{CONF_HOST}:{CONF_PORT}/image/{imagefilename}',
        'thumbnail': f'http://{CONF_HOST}:{CONF_PORT}/image/thumbnail/{imagefilename}',
        'filename': filename,
        'basename': basename,
        'captions': load_caption(imagefilename),
        'concept': name, 
        'repeat': repeat,
        'path': imagefilename,
      })
    
    return result
    
  
  result = {
    "name": imageset_name, 
    "type": 'regular' if is_regular else 'train',
    "filters": [],
  }
  
  concepts = get_concept_folder_list(imageset_dir)
  for concept in concepts:
    concept = load_concept(concept['name'], concept['repeat'], concept['path'])
    result['filters'].append(concept)
  
  return result

@api_imageset.get("/open_in_file_explore")
async def open_in_file_explore(imageset_name: str):
  dir = os.path.join(CONF_REPO_DIR, 'imageset-' + imageset_name)
  import platform, subprocess
  info = platform.system()
  if info == 'Windows':
    os.startfile(dir)
  elif info == 'Darwin':
    subprocess.run(['open', dir])
  elif info == 'Linux':
    subprocess.run(['xdg-open', dir])

@api_imageset.get("/")
async def get_imageset_list():
  '''
    查找已经创建的所有数据集
  '''
  import os 
  imageset_names = os.listdir(CONF_REPO_DIR)
  imageset_names = [name[9:] for name in imageset_names if name.startswith('imageset-')]
  return imageset_names






@api_imageset.post("/create")  
async def create_imageset(name: str):
  origin_name = name
  name = 'imageset-' + name
  imageset_path = os.path.join(CONF_REPO_DIR, name)
  if not os.path.exists(imageset_path):
    os.mkdir(imageset_path)
    return origin_name
  # 创建失败
  raise HTTPException(status_code=400, detail=f"imageset {origin_name} is already exists.")

@api_imageset.post("/add_concept")
async def add_concept(
  imageset_name: str, 
  concept_name: str, 
  repeat: int, 
  type: str, 
  load_directory: str):
  # load_directory 需要是绝对路径
  dir = os.path.join(CONF_REPO_DIR, 'imageset-' + imageset_name)
  if type == 'train':
    dir = os.path.join(dir, "src")
  elif type == "regular":
    dir = os.path.join(dir, "reg")
  else:
    raise HTTPException(status_code=400, detail=f"unknown type {type}")
  
  concept_dir = os.path.join(dir, f"{repeat}_{concept_name.strip()}")
  # 如果不存在，则创建目录, 创建目录功能正常
  if not os.path.exists(concept_dir):
    os.makedirs(concept_dir, exist_ok=True)
  if not os.path.exists(load_directory):
    return 0
  
  # 将 load_directory 目录下的所有图片全部复制到concept目录下, 并全部转换为统一格式, 统一命名
  image_count = convert_and_copy_images(load_directory, concept_dir)
  return image_count

@api_imageset.post("/uploadimages")
async def upload_images(files: List[UploadFile] = File(...), 
                        imageset_name: str = Form(...),
                        type: str = Form(...),
                        concept_folder: str = Form(...),
                        ):
  subdir = 'reg' if type == "regular" else "src"
  dest_dir = os.path.join(CONF_REPO_DIR, 'imageset-'+imageset_name, subdir, concept_folder)
  if not os.path.exists(dest_dir):
    os.makedirs(dest_dir, exist_ok=True)
  
  index = get_next_image_count(dest_dir)
  
  for file in tqdm(files):
    contents = await file.read()
    import io
    image = Image.open(io.BytesIO(contents))
    file_path = os.path.join(dest_dir, f'{index:06d}.jpg')
    index += 1
    image.convert("RGB").save(file_path, "JPEG")
  




@api_imageset.put("/rename")  
async def rename_imageset(origin_name: str, new_name: str): 
  new_name = 'imageset-' + new_name
  origin_name = 'imageset-' + origin_name
  new_path = os.path.join(CONF_REPO_DIR, new_name)
  origin_path = os.path.join(CONF_REPO_DIR, origin_name)
  try:
    os.rename(origin_path, new_path)  
  except Exception as e:
    raise HTTPException(status_code=400, detail=str(e))
  return new_name




@api_imageset.delete("/delete")
async def delete_imageset(name: str):
  import shutil

  imageset_dir = os.path.join(CONF_REPO_DIR, 'imageset-' + name)
  # 注意先删除缩略图再删除原图
  thumbnail_dir = os.path.join(CONF_REPO_DIR, '.thumbnail', 'imageset-'+name)
  if os.path.exists(thumbnail_dir):
    shutil.rmtree(thumbnail_dir)
  if os.path.exists(imageset_dir):
    shutil.rmtree(imageset_dir)
  

@api_imageset.delete("/delete/src")
async def delete_train(name: str):
  imageset_dir = os.path.join(CONF_REPO_DIR, 'imageset-' + name, 'src')
  import shutil
  thumbnail_dir = os.path.join(CONF_REPO_DIR, '.thumbnail', 'imageset-' + name, 'src')
  if os.path.exists(thumbnail_dir):
    shutil.rmtree(thumbnail_dir)
  if os.path.exists(imageset_dir):
    shutil.rmtree(imageset_dir)
  
@api_imageset.delete("/delete/reg")
async def delete_regular(name: str):
  imageset_dir = os.path.join(CONF_REPO_DIR, 'imageset-' + name, 'reg')
  import shutil
  thumbnail_dir = os.path.join(CONF_REPO_DIR, '.thumbnail', 'imageset-' + name, 'reg')
  if os.path.exists(thumbnail_dir):
    shutil.rmtree(thumbnail_dir)
  if os.path.exists(imageset_dir):
    shutil.rmtree(imageset_dir)
  
class DeleteImageRequest(BaseModel):
  filenames: List[str]

@api_imageset.delete("/delete/images")
async def delete_images(request: DeleteImageRequest):
  deleted_names = []
  from tqdm import tqdm
  for filename in tqdm(request.filenames):
    abs_filename = os.path.join(CONF_REPO_DIR, filename)
    thumbnail_filename = os.path.join(CONF_REPO_DIR, '.thumbnail', filename)
    try:
      os.remove(thumbnail_filename)
      os.remove(abs_filename)
    except:
      continue
    deleted_names.append(filename)
  return deleted_names
  
@api_imageset.delete("/delete_concept")
async def delete_concept(imageset_name: str, is_regular: bool, concept_folder: str):
  if is_regular:
    dir = os.path.join('imageset-'+imageset_name, 'reg', concept_folder)
  else:
    dir = os.path.join('imageset-'+imageset_name, 'src', concept_folder)
  thumbnail_dir = os.path.join(CONF_REPO_DIR, '.thumbnail', dir)
  dir = os.path.join(CONF_REPO_DIR, dir)
  import shutil
  if os.path.exists(thumbnail_dir):
    shutil.rmtree(thumbnail_dir)
  if os.path.exists(dir):
    shutil.rmtree(dir)
  


