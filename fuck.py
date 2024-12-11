

from PIL import Image
from PIL.PngImagePlugin import PngInfo

image_path = r'tmp\imageset-katana\src\8_katana\000177.png'


image = Image.open(image_path)
png_info = PngInfo()
png_info.add_text('captions', '[fuck, you]')
image.save(image_path, pnginfo=png_info)

image = Image.open(image_path)
print(image.text['captions'], type(image.text))

