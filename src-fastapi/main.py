from fastapi import FastAPI
import uvicorn
from fastapi.middleware.cors import CORSMiddleware


from api.image import api_image
from api.imageset import api_imageset


app = FastAPI()

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


# 用于直接在前端渲染图片, 而无需转换为base64格式
app.include_router(api_image, prefix="/image", tags=['图片接口'])
app.include_router(api_imageset, prefix="/imageset", tags=["数据集接口"])  
  
  
if __name__ == "__main__":
  from config import config
  uvicorn.run("main:app", host=config.host, port=config.port, reload=True)




