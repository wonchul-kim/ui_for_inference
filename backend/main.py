from PIL import Image
from io import BytesIO
import numpy as np
import base64
import cv2

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import StreamingResponse

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

# Upload endpoint
@app.post("/upload-image/")
async def upload_image(image: UploadFile = File(...)):
    image = byte_to_array(image)

    pred = predict(image)
    cv2.imwrite('/home/wonchul/github/inference/backend/outputs/pred.png', pred)

    if image is not None:
        return {"status": f"Image ({image.shape}) uploaded successfully",
                "prediction": encode_image(pred)}
    else:
        return {"status": "Failed to upload Image"}


def byte_to_array(image: UploadFile):
    image_data = Image.open(BytesIO(image.file.read()))
    image_array = np.array(image_data)

    return image_array

def predict(image):
    h, w, ch = image.shape
    print(">>>> ", h, w, ch)

    pred = np.zeros(image.shape)
    pred[:1000, 0:1000, 0] = 0.5
    pred[:1000, 0:1000, 1] = 0.5
    pred[:1000, 0:1000, 2] = 0.5
    pred[:, :, 3] = 1

    pred *= 255

    print(">>>>>>>>>>>>>>>>> ", pred.shape)

    return pred.astype(np.uint8)

def encode_image(segmentation_prediction):
    image = Image.fromarray(segmentation_prediction)
    buffered = BytesIO()
    image.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode("utf-8")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)
