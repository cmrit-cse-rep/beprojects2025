import cv2
import mediapipe as mp
import os
import pandas as pd

# Initialize MediaPipe Face Mesh
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh()

# Create a list to hold the features and emotions
features = []
emotions = []

# Define emotion labels (based on your dataset)
emotion_dict = {
    0: 'Angry',
    1: 'Disgust',
    2: 'Fear',
    3: 'Happy',
    4: 'Sad',
    5: 'Surprised',
    6: 'Neutral'
}

# Assuming images are stored in 'dataset' folder and labeled by emotion
image_folders = os.listdir('dataset')

for emotion in image_folders:
    image_folder_path = os.path.join('dataset', emotion)
    
    for image_name in os.listdir(image_folder_path):
        image_path = os.path.join(image_folder_path, image_name)
        
        # Read the image
        img = cv2.imread(image_path)
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        # Detect facial landmarks
        results = face_mesh.process(img_rgb)
        
        if results.multi_face_landmarks:
            # Get facial landmarks (for each face)
            for face_landmarks in results.multi_face_landmarks:
                # Extract key landmarks (e.g., nose, eyes, mouth)
                key_landmarks = [
                    face_landmarks.landmark[33],  # Nose tip
                    face_landmarks.landmark[133],  # Left eye
                    face_landmarks.landmark[362],  # Right eye
                    face_landmarks.landmark[61],   # Left mouth corner
                    face_landmarks.landmark[291],  # Right mouth corner
                ]

                # Calculate x, y coordinates of selected landmarks
                angles = [landmark.x for landmark in key_landmarks] + [landmark.y for landmark in key_landmarks]
                
                # Append features and emotion label to lists
                features.append(angles)
                emotions.append(emotion_dict[emotion])
        
# Create a DataFrame and save to CSV
data = pd.DataFrame(features, columns=[f"angle_{i}" for i in range(1, len(features[0]) + 1)])
data['emotion'] = emotions
data.to_csv('dataset/angles_data.csv', index=False)
print("Data saved to 'angles_data.csv'.")
