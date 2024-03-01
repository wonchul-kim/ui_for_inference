import os.path as osp
import glob 
import json

input_dir = '/HDD/datasets/projects/inferences/detection/'

img_files = glob.glob(osp.join(input_dir, "*.bmp"))
json_files = glob.glob(osp.join(input_dir, "*.json"))

pred = []

with open(str(json_files[0]), 'r') as jf:
    anns = json.load(jf)
    
"""
{'version': '2.2.0', 
 'flags': {}, 
 'shapes': [
     {'otherData': None, 
      'bbox': None, 
      'label': 'LINE', 
      'points': [[529.0, 710.0], [537.0, 716.0]], 
      'rotationrect': None, 
      'group_id': None, 
      'shape_type': 'rectangle', 
      'flags': {}
     }, 
     {'otherData': None, 
      'bbox': None, 
      'label': 'SCRATCH', 
      'points': [[478.0, 234.0], [495.0, 237.0]], 
      'rotationrect': None, 
      'group_id': None, 
      'shape_type': 'rectangle', 
      'flags': {}
     }, 
 ], 
 'imagePath': '002291_Pal002Index29-1.bmp', 
 'imageData': None, 
 'imageHeight': 800, 
 'imageWidth': 800
}
"""
    
    
for ann in anns['shapes']:
    conf = 0.5
    _pred = {'label': ann['label'], 
             'points': [ann['points'][0][0], ann['points'][0][1], 
                        ann['points'][1][0], ann['points'][1][1]],
             'confidence': conf}
    pred.append(_pred)
    
print(pred)