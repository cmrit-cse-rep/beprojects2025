import pandas as pd
import numpy as np
import cv2
import os

# Load the dataset CSV file
df = pd.read_csv('fer2013.csv')

# Define the emotion labels
emotion_dict = {
    0: 'Angry',
    1: 'Disgust',
    2: 'Fear',
    3: 'Happy',
    4: 'Sad',
    5: 'Surprised',
    6: 'Neutral'
}

# Create a function to save images
def save_image(pixels, emotion, index):
    # Convert the string of pixel values to a numpy array
    pixels = np.array([int(i) for i in pixels.split()]).reshape(48, 48)  # FER2013 images are 48x48
    
    # Convert to uint8 type for image saving
    pixels = pixels.astype(np.uint8)
    
    # Create a folder for the emotion if it doesn't exist
    folder_path = f'dataset/{emotion_dict[emotion]}'
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)
    
    # Save the image
    cv2.imwrite(f'{folder_path}/{index}.png', pixels)

# Loop through the dataframe and save the images
for index, row in df.iterrows():
    emotion = row['emotion']
    pixels = row['pixels']
    save_image(pixels, emotion, index)

print("Images saved successfully.")
