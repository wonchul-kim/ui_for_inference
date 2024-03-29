from PIL import Image
from io import BytesIO
import numpy as np
import base64
import cv2
import io
import json 
import copy

import os.path as osp 
import glob

from fastapi import FastAPI, File, UploadFile, HTTPException, Form, Query
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse

app = FastAPI()

# CORS settings (adjust as needed for your frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Update with your frontend's URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# TrustedHostMiddleware settings (add your frontend's host)
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["localhost"])

@app.post("/upload-image/")
async def upload_image(image: UploadFile = File(...)):
    ratio = 1
    image, original_image = byte_to_array(image, ratio)
    print("** Original Image size: ", original_image.size)
    print("** Image shane: ", image.shape)
    preds = get_seg_dummy(original_image, ratio)
    if image is not None:
        return {"status": f"Image ({image.shape}) uploaded successfully",
                "task": 'segmentation',
                "prediction": encode_image(preds),
                "shape": {"height": image.shape[0], "width": image.shape[1], "channel": image.shape[2]},
                "ratio": ratio}
    else:
        return {"status": "Failed to upload Image", 'task': 'segmentation', 'prediction': None, 'shape': None}

    # preds = get_det_dummy(image)
    # if image is not None:
    #     return JSONResponse(content={"status": f"Image ({image.shape}) uploaded successfully",
    #             "task": 'detection',
    #             "prediction": preds,
    #             "shape": {"height": image.shape[0], "width": image.shape[1], "channel": image.shape[2]},
    #             "ratio": ratio},
    #             )
    # else:
    #     return JSONResponse(content={"status": "Failed to upload Image", 
    #         "task": 'detection',
    #         'prediction': None, 'shape': None})


def byte_to_array(image: UploadFile, ratio=1):
    image_data = Image.open(BytesIO(image.file.read()))
    height, width = image_data.size
    if ratio != 1:
        new_height, new_width = int(height*ratio), int(width*ratio)
        image_data = image_data.resize((new_width, new_height))
    image_array = np.array(image_data)

    return image_array, image_data


def encode_image(channels):
    if isinstance(channels, dict):
        res = {}
        for key, val in channels.items():
            image = Image.fromarray(val)
            
            # RGBA 이미지를 RGB로 변환
            if image.mode == "RGBA":
                image = image.convert("RGB")
                
            buffered = BytesIO()
            image.save(buffered, format="JPEG")
            
            res[key] = base64.b64encode(buffered.getvalue()).decode("utf-8")

        return res
    else:        
        image = Image.fromarray(channels)
        # RGBA 이미지를 RGB로 변환
        if image.mode == "RGBA":
            image = image.convert("RGB")
        buffered = BytesIO()
        image.save(buffered, format="JPEG")
        
        return base64.b64encode(buffered.getvalue()).decode("utf-8")

def get_seg_dummy(image, ratio):
    h, w = image.size
    scaled_h, scaled_w = int(h*ratio), int(w*ratio)
    print(">>> get_seg_dummy image size: ", h, w, ratio)

    channel1 = np.zeros((scaled_h, scaled_w))
    points = [[10, 0], [10, 300], [300, 300], [300, 600], [600, 600], [600, 0]]
    print('111 poinrts: ', points)
    scaled_points = [[int(point[0] * ratio), int(point[1] * ratio)] for point in points]
    # scaled_points =  [[5, 0], [5, 50], [50, 50], [50, 100], [100, 100], [100, 0]]
    print("111 scaled points: ", scaled_points)
    arr = np.array(scaled_points, dtype=np.int32)
    cv2.fillPoly(channel1, [arr], color=(0.8))

    channel2 = np.zeros((scaled_h, scaled_w))
    points = [[600, 1100], [600, 800], [800, 800], [800, 200], [1100, 200], [1100, 1100]]
    scaled_points = [[int(point[0] * ratio), int(point[1] * ratio)] for point in points]
    arr = np.array(scaled_points, dtype=np.int32)
    cv2.fillPoly(channel2, [arr], color=(0.5))

    channel3 = np.zeros((scaled_h, scaled_w))
    points = [[10, 1100], [10, 900], [200, 900], [200, 700], [500, 700], [500, 1100]]
    scaled_points = [[int(point[0] * ratio), int(point[1] * ratio)] for point in points]
    arr = np.array(scaled_points, dtype=np.int32)
    cv2.fillPoly(channel3, [arr], color=(0.7))
    
    channel1 = (np.stack([channel1, channel1, channel1, np.ones((scaled_h, scaled_w))], axis=-1)*255).astype(np.uint8)
    channel2 = (np.stack([channel2, channel2, channel2, np.ones((scaled_h, scaled_w))], axis=-1)*255).astype(np.uint8)
    channel3 = (np.stack([channel3, channel3, channel3, np.ones((scaled_h, scaled_w))], axis=-1)*255).astype(np.uint8)

    channels = {'channel1': channel1, 'channel2': channel2, 'channel3': channel3}

    return channels

def get_det_dummy(image):
    h, w, ch = image.shape
    print("image shape: ", image.shape)

    rect1 = {'label': 'label1', 'points': [500, 10, 1000, 1000], 'confidence': 0.5}
    rect2 = {'label': 'label2', 'points': [500, 500, 1500, 1500], 'confidence': 0.8}
    rect3 = {'label': 'label3', 'points': [0, 500, 1000, 1500], 'confidence': 0.3}

    pred = [rect1, rect2, rect3]

    return pred


@app.get("/get-image-file-list/")
async def get_image_list(input_dir, extensions):
    print("*** get_image_list > input_dir: ", osp.exists(input_dir), input_dir)
    print("*** get_image_list > extensions: ", extensions)
    
    extensions = extensions.split(",")
    print("*** extensions: ", extensions)

    img_files = []
    for extension in extensions:
        img_files += glob.glob(osp.join(input_dir, "*.{}".format(extension)))

    return {"img_files_list": img_files}

# @app.get("/get-image/")
# async def get_image(ratio: float = Query(...), 
#                     img_file: str = Query(...),
#                     task: str = Query(...)):
#     print("*** task: ", task)
#     print("*** ratio: ", ratio)
#     print("*** img_file: ", osp.exists(img_file), img_file)

#     npz_file = osp.splitext(img_file)[0] + '.npz'
#     assert osp.exists(npz_file), ValueError(f"There is no such npz_file: {npz_file}")

#     img = cv2.imread(img_file)
#     height, width, channel = img.shape
#     print("1111. img.shape: ", img.shape)
#     scaled_height, scaled_width, scaled_channel = int(height*ratio), int(width*ratio), int(channel*ratio)
#     scaled_img = cv2.resize(copy.deepcopy(img), (scaled_width, scaled_height))
#     print("2222. scaled_img.shape: ", scaled_img.shape)
#     img_encoded = cv2.imencode('.jpg', scaled_img)[1]  # 이미지를 JPEG 형식으로 인코딩
#     img_base64 = base64.b64encode(img_encoded).decode('utf-8')
    
#     loaded_data = np.load(npz_file)
#     loaded_arr = loaded_data['arr']
#     print("3333. loaded_arr.shape: ", loaded_arr.shape)
    
#     preds = {}
#     for ch in range(loaded_arr.shape[-1]):
#         _channel = loaded_arr[:, :, ch]
#         scaled_channel = cv2.resize(copy.deepcopy(_channel), (scaled_width, scaled_height))
#         __channel = (np.stack([scaled_channel, scaled_channel, scaled_channel, np.ones((scaled_height, scaled_width))],
#                                 axis=-1)*255).astype(np.uint8)

#         preds.update({ch: __channel})
        
#     return {"status": f"Image ({scaled_img.shape}) uploaded successfully",
#             'image': img_base64,
#             'prediction': encode_image(preds),
#             "shape": {"height": scaled_img.shape[0], "width": scaled_img.shape[1], "channel": scaled_img.shape[2]},
#             'ratio': ratio}


@app.get("/get-image/")
async def get_image(ratio: float = Query(...), 
                    img_file: str = Query(...),
                    task: str = Query(...)):
    print("*** task: ", task)
    print("*** ratio: ", ratio)
    print("*** img_file: ", img_file)

    if task == 'detection':

        json_file = osp.splitext(img_file)[0] + '.json'
        assert osp.exists(json_file), ValueError(f"There is no such json-file: {json_file}")
        print("*** json_file: ", json_file)

        img = cv2.imread(img_file)
        height, width, channel = img.shape
        print("1111. img.shape: ", img.shape)
        scaled_height, scaled_width, scaled_channel = int(height*ratio), int(width*ratio), int(channel*ratio)
        scaled_img = cv2.resize(copy.deepcopy(img), (scaled_width, scaled_height))
        print("2222. scaled_img.shape: ", scaled_img.shape)
        img_encoded = cv2.imencode('.jpg', scaled_img)[1]  # 이미지를 JPEG 형식으로 인코딩
        img_base64 = base64.b64encode(img_encoded).decode('utf-8')

        with open(str(json_file), 'r') as jf:
            anns = json.load(jf)
            
            
        pred = []
        for ann in anns['shapes']:
            print(">>>>>> points: ", ann['points'])
            conf = float(ann['otherData']['confidence'])
            print(">>>>>> confidence: ", conf)
            _pred = {'label': ann['label'], 
                    'points': [ann['points'][0][0], ann['points'][0][1], 
                                ann['points'][1][0], ann['points'][1][1]],
                    'confidence': conf}
            pred.append(_pred)
            
        return {'task': task, "image": img_base64, 'prediction': pred}

    elif task == 'segmentation':
        
        npz_file = osp.splitext(img_file)[0] + '.npz'
        assert osp.exists(npz_file), ValueError(f"There is no such npz_file: {npz_file}")

        img = cv2.imread(img_file)
        height, width, channel = img.shape
        print("1111. img.shape: ", img.shape)
        scaled_height, scaled_width, scaled_channel = int(height*ratio), int(width*ratio), int(channel*ratio)
        scaled_img = cv2.resize(copy.deepcopy(img), (scaled_width, scaled_height))
        print("2222. scaled_img.shape: ", scaled_img.shape)
        img_encoded = cv2.imencode('.jpg', scaled_img)[1]  # 이미지를 JPEG 형식으로 인코딩
        img_base64 = base64.b64encode(img_encoded).decode('utf-8')
        
        loaded_data = np.load(npz_file)
        loaded_arr = loaded_data['arr']
        print("3333. loaded_arr.shape: ", loaded_arr.shape)
        
        preds = {}
        for ch in range(loaded_arr.shape[-1]):
            _channel = loaded_arr[:, :, ch]
            scaled_channel = cv2.resize(copy.deepcopy(_channel), (scaled_width, scaled_height))
            __channel = (np.stack([scaled_channel, scaled_channel, scaled_channel, np.ones((scaled_height, scaled_width))],
                                    axis=-1)*255).astype(np.uint8)

            preds.update({ch: __channel})
            
        return {"status": f"Image ({scaled_img.shape}) uploaded successfully",
                'image': img_base64,
                'prediction': encode_image(preds),
                "shape": {"height": scaled_img.shape[0], "width": scaled_img.shape[1], "channel": scaled_img.shape[2]},
                'ratio': ratio}

# @app.get("/get-image/")
# async def get_image(ratio: float = Query(...), 
#                     img_file: str = Query(...),
#                     task: str = Query(...)):
#     print("*** task: ", task)
#     print("*** ratio: ", ratio)
#     print("*** img_file: ", img_file)

#     json_file = osp.splitext(img_file)[0] + '.json'
#     assert osp.exists(json_file), ValueError(f"There is no such json-file: {json_file}")
#     print("*** json_file: ", json_file)

#     img = cv2.imread(img_file)
#     height, width, channel = img.shape
#     print("1111. img.shape: ", img.shape)
#     scaled_height, scaled_width, scaled_channel = int(height*ratio), int(width*ratio), int(channel*ratio)
#     scaled_img = cv2.resize(copy.deepcopy(img), (scaled_width, scaled_height))
#     print("2222. scaled_img.shape: ", scaled_img.shape)
#     img_encoded = cv2.imencode('.jpg', scaled_img)[1]  # 이미지를 JPEG 형식으로 인코딩
#     img_base64 = base64.b64encode(img_encoded).decode('utf-8')

#     with open(str(json_file), 'r') as jf:
#         anns = json.load(jf)
        
        
#     if task == 'detection':
#         pred = []
#         for ann in anns['shapes']:
#             conf = 0.5
#             _pred = {'label': ann['label'], 
#                     'points': [ann['points'][0][0], ann['points'][0][1], 
#                                 ann['points'][1][0], ann['points'][1][1]],
#                     'confidence': conf}
#             pred.append(_pred)
            
#         return {'task': task, "image": img_base64, 'prediction': pred}

#     elif task == 'segmentation':
#         preds = {}
#         for ann in anns['shapes']:
#             conf = 0.6
#             if len(ann['points']) != 0:
#                 print(ann['points'])
#                 _channel = np.zeros((height, width))
#                 arr = np.array(ann['points'], dtype=np.int32)
#                 cv2.fillPoly(_channel, [arr], color=(conf))
                
#                 scaled_channel = cv2.resize(copy.deepcopy(_channel), (scaled_width, scaled_height))
#                 __channel = (np.stack([scaled_channel, scaled_channel, scaled_channel, np.ones((scaled_height, scaled_width))],
#                                     axis=-1)*255).astype(np.uint8)

#                 preds.update({ann['label']: __channel})
            
#         return {"status": f"Image ({scaled_img.shape}) uploaded successfully",
#                 'image': img_base64,
#                 'prediction': encode_image(preds),
#                 "shape": {"height": scaled_img.shape[0], "width": scaled_img.shape[1], "channel": scaled_img.shape[2]},
#                 'ratio': ratio}

#     # if img is not None:
#     #     return {"status": f"Image ({img.size}) uploaded successfully",
#     #             "task": 'segmentation',
#     #             "prediction": encode_image(preds),
#     #             "shape": {"height": img.size[0], "width": img.size[1], "channel": 3}}
#     # else:
#     #     return {"status": "Failed to upload Image", 'task': 'segmentation', 'prediction': None, 'shape': None}




if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)
