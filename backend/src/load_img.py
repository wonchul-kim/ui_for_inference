import cv2 
import os.path as osp
import os 
import glob 

# input_dir = './images'

# img_files = glob.glob(osp.join(input_dir, '*.png'))

img_file = '/home/wonchul/github/inference/backend/images/munster_000000_000019_gtFine_labelIds.png'

img = cv2.imread(img_file)
print(img.shape)
print(img)