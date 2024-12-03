from fastapi import APIRouter, HTTPException
from typing import List
import os
from .config import CONF_REPO_DIR


api_tag = APIRouter()


'''
  将图片列表作为data传递过来
'''
from pydantic import BaseModel
from .tagger import interrogators
from pathlib import Path
from PIL import Image
from .tagger import Interrogator
from tqdm import tqdm





def update_tags(image_path: str, tags: list[str]) -> list[str]:
  import pyexiv2, json
  metadata = pyexiv2.Image(image_path)
  old_tags = metadata.read_comment()
  try:
    old_tags = json.loads(old_tags)
  except:
    old_tags = []
  tags = list(set([*tags, *old_tags]))
  metadata.modify_comment(json.dumps(tags))
  metadata.close()
  return tags


class ImageListInterrogateRequest(BaseModel):
  images: List[str]               # 图片元信息列表
  additional_tags: List[str] = []
  exclude_tags: List[str] = []
  model_name: str                 # 模型名称
  threshold: float                # 可选的阈值
@api_tag.post('/image_list_interrogate')
async def image_list_interrogate(request_body: ImageListInterrogateRequest):
  interrogator = interrogators[request_body.model_name]
  ret = {}
  for image_path in tqdm(request_body.images):
    # 注意添加将原有的标签添加到 additional 的逻辑
    im = Image.open(Path(os.path.join(CONF_REPO_DIR, image_path)))
    _, result = interrogator.interrogate(im)
    tags = Interrogator.postprocess_tags(
      result,
      threshold=request_body.threshold,
      additional_tags=request_body.additional_tags, # 要添加的标签
      exclude_tags=request_body.exclude_tags, # 要排除的标签, 给出一个标签的列表即可
    )
    # TODO 保存标签到图片
    ret[image_path] = list(tags.keys())
  # 直接保存算了
  return ret

class InterrogateRequest(BaseModel):
  image: str                          # 图片元信息列表
  additional_tags: List[str] = []
  exclude_tags: List[str] = []
  model_name: str                     # 模型名称
  threshold: float                    # 可选的阈值
@api_tag.post("/interrogate")
async def image_interrogate(request: InterrogateRequest):
  interrogator = interrogators[request.model_name]
  image_path = os.path.join(CONF_REPO_DIR, request.image)
  im = Image.open(Path(image_path))
  _, result = interrogator.interrogate(im)
  tags = Interrogator.postprocess_tags(
    result,
    threshold=request.threshold,
    additional_tags=request.additional_tags,  # 要添加的标签
    exclude_tags=request.exclude_tags,        # 要排除的标签, 给出一个标签的列表即可
  )
  tags = list(tags.keys())
  tags = update_tags(image_path, tags)
  # 将标签保存到图片的 comment 中去
  return tags




async def save_tags():
  '''
    i = Image(image_path)
    i.read_comment()
    i.modity_comment('')
    i.close()
  '''
  pass

