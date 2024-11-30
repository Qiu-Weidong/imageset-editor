

'''
options:
  -h, --help            show this help message and exit
  --dir DIR             Predictions for all images in the directory
  --file FILE           Predictions for one file
  --threshold THRESHOLD
                        Prediction threshold (default is 0.35)
  --ext EXT             Extension to add to caption file in case of dir option (default is .txt)
  --overwrite           Overwrite caption file if it exists
  --cpu                 Use CPU only
  --rawtag              Use the raw output of the model
  --recursive           Enable recursive file search
  --exclude-tag t1,t2,t3
                        Specify tags to exclude (Need comma-separated list)
  --model {wd14-vit.v1,wd14-vit.v2,wd14-convnext.v1,wd14-convnext.v2,wd14-convnextv2.v1,wd14-swinv2-v1,wd-v1-4-moat-tagger.v2,wd-v1-4-vit-tagger.v3,wd-v1-4-convnext-tagger.v3,wd-v1-4-swinv2-tagger.v3,wd-vit-large-tagger-v3,wd-eva02-large-tagger-v3,z3d-e621-convnext-toynya,z3d-e621-convnext-silveroxides,mld-caformer.dec-5-97527,mld-tresnetd.6-30000}
                        modelname to use for prediction (default is wd14-convnextv2.v1)
'''


from tagger.interrogator import Interrogator
from PIL import Image
from pathlib import Path

from tagger.interrogators import interrogators





def image_interrogate(image_path: Path, model_name: str, threshold: float) -> dict[str, float]:
  interrogator = interrogators[model_name]
  im = Image.open(image_path)
  _, result = interrogator.interrogate(im)
  return Interrogator.postprocess_tags(
    result,
    threshold=threshold,
    additional_tags=[], # 要添加的标签
    exclude_tags=[], # 要排除的标签, 给出一个标签的列表即可
  )


if __name__ == "__main__":
  tags = image_interrogate(
    Path("C:\\Users\\Qiu-Weidong\\Documents\\imageset-editor\\tmp\\imageset-accordion\\src\\1_realistica\\realistica_000000.jpg"),
    'wd14-convnextv2.v1', 
    0.35
  )
  print('-----------------------------------------------')
  tags_str = ', '.join(tags.keys())
  print(tags_str)




