import h5py
import os.path as osp 
import glob 
import imgviz
import cv2 
import numpy as np

input_dir = '/home/wonchul/github/inference/backend/outputs'
output_dir = '/home/wonchul/github/inference/backend/outputs'
pred_files = glob.glob(osp.join(input_dir, '*.h5'))
threshold = 0.4

color_map = imgviz.label_colormap()

for pred_file in pred_files:
    with h5py.File(pred_file, 'r') as hf:
        pred = hf['data'][:]  # Assuming 'data' is the dataset name

    pred[:, :, 0][pred[:, :, 0] < threshold] = 0
    pred[:, :, 0][pred[:, :, 0] > threshold] = 1

    pred[:, :, 2][pred[:, :, 2] < threshold] = 0
    pred[:, :, 2][pred[:, :, 2] > threshold] = 3

    pred[:, :, 1][pred[:, :, 1] < threshold] = 0
    pred[:, :, 1][pred[:, :, 1] > threshold] = 2

    union = np.zeros(pred.shape)
    for ch in range(pred.shape[2]):
        mask = color_map[pred[:, :, ch].astype(np.uint8)].astype(np.uint8)
        union += mask

        cv2.imwrite(osp.join(output_dir, f'pred_{ch}.png'), mask)

    cv2.imwrite(osp.join(output_dir, f'pred_union.png'), union)
    



