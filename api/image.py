from fastapi import APIRouter, HTTPException
from PIL import Image
from .config import CONF_REPO_DIR


api_image = APIRouter()



# 注意将这个放在前面, 直接通过路径获取缩略图
@api_image.get("/thumbnail/{image_name:path}")
async def get_thumbnail(image_name: str):
  import os
  from fastapi.responses import FileResponse
  
  image_path = os.path.join(CONF_REPO_DIR, image_name)
  thumbnail_path = os.path.join(CONF_REPO_DIR, './.thumbnail', image_name)
  
  # 检查缩略图是否存在, 存在就直接返回即可
  if os.path.exists(thumbnail_path) and os.path.isfile(thumbnail_path):
    return FileResponse(thumbnail_path)
  elif os.path.exists(image_path) and os.path.isfile(image_path):
    with Image.open(image_path) as img:
      img: Image = img.convert('RGB')
      img.thumbnail(size=(320, 320))
      parent_dir = os.path.dirname(thumbnail_path)
      if not os.path.exists(parent_dir):
        os.makedirs(parent_dir)
      img.save(thumbnail_path)
      return FileResponse(thumbnail_path)
  raise HTTPException(status_code=404, detail="Image not found")
  
# 直接通过路径获取原图
@api_image.get("/{image_name:path}")
async def get_image(image_name: str):
  import os
  from fastapi.responses import FileResponse
  
  # 结合基础路径和用户传入的图像名称, repo_dir (将所有图片都保存在repo_dir中)
  image_path = os.path.join(CONF_REPO_DIR, image_name)
  
  # 检查文件是否存在
  if os.path.exists(image_path) and os.path.isfile(image_path):
    return FileResponse(image_path)
  raise HTTPException(status_code=404, detail="Image not found")
  


