from PIL import Image
from io import BytesIO
import numpy as np
import base64
import cv2

from fastapi import FastAPI, File, UploadFile, HTTPException, Form
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
    image = byte_to_array(image)

    channels = get_seg_dummy(image)
    if image is not None:
        return {"status": f"Image ({image.shape}) uploaded successfully",
                "task": 'segmentation',
                "prediction": encode_image(channels),
                "shape": {"height": image.shape[0], "width": image.shape[1], "channel": image.shape[2]}}
    else:
        return {"status": "Failed to upload Image", 'task': 'segmentation', 'prediction': None, 'shape': None}

    # preds = get_det_dummy(image)

    # if image is not None:
    #     return JSONResponse(content={"status": f"Image ({image.shape}) uploaded successfully",
    #             "task": 'detection',
    #             "prediction": preds,
    #             "shape": {"height": image.shape[0], "width": image.shape[1], "channel": image.shape[2]}})
    # else:
    #     return JSONResponse(content={"status": "Failed to upload Image", 
    #         "task": 'detection',
    #         'prediction': None, 'shape': None})


def byte_to_array(image: UploadFile):
    image_data = Image.open(BytesIO(image.file.read()))
    image_array = np.array(image_data)

    return image_array


def encode_image(channels):
    if isinstance(channels, dict):
        res = {}
        for key, val in channels.items():
            image = Image.fromarray(val)
            buffered = BytesIO()
            image.save(buffered, format="PNG")
            
            res[key] = base64.b64encode(buffered.getvalue()).decode("utf-8")

        return res
    else:        
        image = Image.fromarray(channels)
        buffered = BytesIO()
        image.save(buffered, format="PNG")
        
        return base64.b64encode(buffered.getvalue()).decode("utf-8")

def get_seg_dummy(image):
    h, w, ch = image.shape
    print("image shape: ", image.shape)
    channel1 = np.zeros((h, w))
    channel2 = np.zeros((h, w))
    channel3 = np.zeros((h, w))
    channel4 = np.zeros((h, w))
    channel5 = np.zeros((h, w))

    channel1[0:1000, 0:1000] = 0.3
    channel2[500:1500, 500:1500] = 0.3
    channel2[:, -500:] = 0.6
    channel3[-1000:, -1000:] = 0.3
    channel4[-1000:, :] = 0.3
    channel5[:1000, :] = 0.6

    channel1 = (np.stack([channel1, channel1, channel1, np.ones((h, w))], axis=-1)*255).astype(np.uint8)
    channel2 = (np.stack([channel2, channel2, channel2, np.ones((h, w))], axis=-1)*255).astype(np.uint8)
    channel3 = (np.stack([channel3, channel3, channel3, np.ones((h, w))], axis=-1)*255).astype(np.uint8)
    channel4 = (np.stack([channel4, channel4, channel4, np.ones((h, w))], axis=-1)*255).astype(np.uint8)
    channel5 = (np.stack([channel5, channel5, channel5, np.ones((h, w))], axis=-1)*255).astype(np.uint8)

    print(">>> Check: ", np.where(channel1==1))
    print(np.unique(channel1))
    print(channel1.shape)

    # channels = {'channel1': channel1, 'channel2': channel2, 'channel3': channel3, 
    #             'channel4': channel4, 'channel5': channel5, }
    channels = {'channel1': channel1, 'channel2': channel2}

    return channels

def get_det_dummy(image):
    h, w, ch = image.shape
    print("image shape: ", image.shape)

    rect1 = {'label': 'label1', 'points': [500, 10, 1000, 1000], 'confidence': 0.5}
    rect2 = {'label': 'label2', 'points': [500, 500, 1500, 1500], 'confidence': 0.8}
    rect3 = {'label': 'label3', 'points': [0, 500, 1000, 1500], 'confidence': 0.3}

    pred = [rect1, rect2, rect3]

    return pred

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)
