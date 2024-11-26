from fastapi import APIRouter, HTTPException
from .config import CONF_REPO_DIR, CONF_HOST, CONF_PORT
import os


api_imageset = APIRouter()


'''
  所有的 path 都从 imageset-xxx/src/8_xxx 开始
  绝对路径直接使用 repo_dir/{path} 即可
  图片的url则直接 http://{config.host}:{config.port}/image/{path}即可
  图片的缩略图url则直接 http://{config.host}:{config.port}/image/thumbnail/{path}即可
'''

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
        'cover': f"http://{CONF_HOST}:{CONF_PORT}/image/{cover}",
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
  imageset_dir = os.path.join(CONF_REPO_DIR, 'imageset-' + name)
  import shutil
  shutil.rmtree(imageset_dir)



def convert_and_copy_images(concept_name: str, source_dir, target_dir):
  # print('convert_and_copy_images', concept_name, source_dir, target_dir)
  
  def get_next_image_count(target_dir):
    import re
    max_count = -1
    pattern = re.compile(f'{concept_name}_(\\d{6})\\.jpg')
    
    # 列出目标目录中的所有文件
    for file_name in os.listdir(target_dir):
      match = pattern.match(file_name)
      if match:
        count = int(match.group(1))
        max_count = max(max_count, count)
    return max_count + 1  # 返回下一个可用的序号
  from PIL import Image
  
  valid_image_extensions = {'jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp', '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp'}
  
  # 获取源目录下的所有图片文件
  files = [os.path.join(source_dir, filename) for filename in os.listdir(source_dir)]
  files = [filename for filename in files if os.path.isfile(filename) and os.path.splitext(filename)[1].lower() in valid_image_extensions]
  # print(files)
  
  # image_count 应该初始化为已有图片的序号的最大值
  image_count = get_next_image_count(target_dir)

  for file_name in files:
    source_path = os.path.join(source_dir, file_name)
    try:
      with Image.open(source_path) as img:
        img = img.convert("RGB")
        # 生成新的文件名
        new_file_name = f"{concept_name}_{image_count:06d}.jpg"
        target_path = os.path.join(target_dir, new_file_name)
        # 保存为 JPG 格式
        img.save(target_path, "JPEG")
        # 增加计数器
        image_count += 1
    except Exception as e:
      pass
  return image_count
              
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
    os.makedirs(concept_dir)
  # 将 load_directory 目录下的所有图片全部复制到concept目录下, 并全部转换为统一格式, 统一命名
  image_count = convert_and_copy_images(concept_name, load_directory, concept_dir)
  return image_count



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
      result['images'].append({
        'src': f'http://{CONF_HOST}:{CONF_PORT}/image/{imagefilename}',
        'thumbnail': f'http://{CONF_HOST}:{CONF_PORT}/image/thumbnail/{imagefilename}',
        'filename': filename,
        'basename': basename,
        'captions': [],
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




@api_imageset.get("/")
async def get_imageset_list():
  '''
    查找已经创建的所有数据集
  '''
  import os 
  imageset_names = os.listdir(CONF_REPO_DIR)
  imageset_names = [name[9:] for name in imageset_names if name.startswith('imageset-')]
  return imageset_names




