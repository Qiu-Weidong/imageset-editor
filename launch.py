'''
  启动脚本
'''

from fastapi import FastAPI
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from api import *




app = FastAPI()

from api.image import api_image
from api.imageset import api_imageset


# 定义允许的来源, 发布的时候可以注释掉,
origins = [
  "http://localhost:3000",  # 允许的来源（例如前端的地址）
  "http://localhost:1420",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:1420",
]
# 添加 CORS 中间件
app.add_middleware(
  CORSMiddleware,
  allow_origins=origins,   # 允许的来源列表
  allow_credentials=True,  # 是否允许发送凭证（如 Cookies）
  allow_methods=["*"],     # 允许的请求方法（例如 GET, POST, OPTIONS）
  allow_headers=["*"],     # 允许的请求头
)





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
  # 就在这里写, 不影响
  import argparse
  parser = argparse.ArgumentParser(description="imageset editor")
  parser.add_argument('--reload', action='store_true')
  parser.add_argument('--desktop', action='store_true', help='启动桌面程序')
  args = parser.parse_args()
  
  if args.desktop:
    import webview, subprocess
    p = subprocess.Popen(f"uvicorn launch:app --port {CONF_PORT} --host {CONF_HOST}")
    window = webview.create_window("imageset editor", url=f"http://{CONF_HOST}:{CONF_PORT}/web", width=1200, height=800, confirm_close=True)
    webview.start()
    # 一些首尾工作
    p.kill()
    
  else:
    uvicorn.run("launch:app", host=CONF_HOST, port=CONF_PORT, reload=args.reload)





