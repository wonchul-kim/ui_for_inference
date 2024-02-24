# Inference 

![Animated GIF](assets/inference.gif)

- Frontend: Javscript with `MUI`
- Backend: Python with `FastAPI`

## Backend

#### To execute the backend 
```cmd
cd backend
docker build -t backend .
docker run -it -p 8000:8000 -v ./:/workspace backend
cd workspace
python -m uvicorn main:app --reload
```

#### Segmentation Result

This will give segmentation result as mask (height * width * 4) to frontend

```python
preds = get_seg_dummy(image)
if image is not None:
    return {"status": f"Image ({image.shape}) uploaded successfully",
            "task": 'segmentation',
            "prediction": encode_image(preds),
            "shape": {"height": image.shape[0], "width": image.shape[1], "channel": image.shape[2]}}
else:
    return {"status": "Failed to upload Image", 'task': 'segmentation', 'prediction': None, 'shape': None}
```

- `get_seg_dummy`

```python
def get_seg_dummy(image):
    h, w, ch = image.shape
    print("image shape: ", image.shape)
    channel1 = np.zeros((h, w))
    channel2 = np.zeros((h, w))
    channel3 = np.zeros((h, w))
    channel4 = np.zeros((h, w))
    channel5 = np.zeros((h, w))

    channel1[0:350, 0:350] = 0.3
    channel2[200:600, 200:600] = 0.3
    channel2[:, -200:] = 0.6
    channel3[-400:, -400:] = 0.3
    channel4[-100:, :] = 0.3
    channel5[:100, :] = 0.6

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
    channels = {'channel1': channel1, 'channel2': channel2, 'channel3': channel3}

    return channels
```

#### Detection Result

This will give detection result as `json` format to frontend

```python

preds = get_det_dummy(image)

if image is not None:
    return JSONResponse(content={"status": f"Image ({image.shape}) uploaded successfully",
            "task": 'detection',
            "prediction": preds,
            "shape": {"height": image.shape[0], "width": image.shape[1], "channel": image.shape[2]}})
else:
    return JSONResponse(content={"status": "Failed to upload Image", 
        "task": 'detection',
        'prediction': None, 'shape': None})

```

- `get_det_dummy`
```python
def get_det_dummy(image):
    h, w, ch = image.shape
    print("image shape: ", image.shape)

    rect1 = {'label': 'label1', 'points': [500, 10, 1000, 1000], 'confidence': 0.5}
    rect2 = {'label': 'label2', 'points': [500, 500, 1500, 1500], 'confidence': 0.8}
    rect3 = {'label': 'label3', 'points': [0, 500, 1000, 1500], 'confidence': 0.3}

    pred = [rect1, rect2, rect3]

    return pred
```

## Frontend

#### To execute the frontend
```cmd
cd frontend
docker build -t frontend .
docker run -it -p 3000:3000 -v ./:/workspace frontend bash
cd workspace 
npm run start
```

#### Segmentation Result

Using segmentation result from backend, it is filtered by the threshold and then, shows all channels in one image and also each channel.

#### Detection Result

Using detection result from backend, it is filtered by threshold and then, shows bounding boxes on image.