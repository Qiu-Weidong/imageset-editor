from fastapi import FastAPI
import uvicorn


from api.image import api_image
from api.imageset import api_imageset


app = FastAPI()


# 用于直接在前端渲染图片, 而无需转换为base64格式
app.include_router(api_image, prefix="/image", tags=['图片接口'])
app.include_router(api_imageset, prefix="/imageset", tags=["数据集接口"])  
  
  
if __name__ == "__main__":
  from config import config
  uvicorn.run("main:app", host=config.host, port=config.port, reload=True)




