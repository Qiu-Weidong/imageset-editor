'''
  启动脚本
'''

import argparse
from fastapi import FastAPI
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from api import *




app = FastAPI()

from api.image import api_image
from api.imageset import api_imageset


app.include_router(api_image, prefix="/image", tags=['图片接口'])
app.include_router(api_imageset, prefix="/imageset", tags=["数据集接口"])  




@app.get('/web/{path:path}')
async def web_handler(path: str):
  import os
  fp = f"{CONF_WEB_DIR}/{path}"
  if (not os.path.exists(fp)) or (not os.path.isfile(fp)):
    fp = f"{CONF_WEB_DIR}/index.html" 
  return FileResponse(fp)

@app.get("/")
async def index():
  return RedirectResponse(url="/web")


if __name__ == "__main__":
  parser = argparse.ArgumentParser(description='imageset editor')
  parser.add_argument('--dev', action='store_true', help='开发模式运行')
  args = parser.parse_args()
  
  if args.dev:
    # 定义允许的来源
    origins = [
      "http://localhost:3000",  # 允许的来源（例如前端的地址）
    ]
    # 添加 CORS 中间件
    app.add_middleware(
      CORSMiddleware,
      allow_origins=origins,   # 允许的来源列表
      allow_credentials=True,  # 是否允许发送凭证（如 Cookies）
      allow_methods=["*"],     # 允许的请求方法（例如 GET, POST, OPTIONS）
      allow_headers=["*"],     # 允许的请求头
    )
  
  # 需要的参数包含 前端项目的路径, 端口, 图片仓库路径
  uvicorn.run("launch:app", host=CONF_HOST, port=CONF_PORT, reload=args.dev)





