import cv2
import numpy as np
import joblib
import streamlit as st
from matplotlib import pyplot as plt

# Load the pre-trained model from the 'models' folder
model = joblib.load('models/ensemble_model.pkl')  # Adjust the path if necessary

# Streamlit title
st.title("Enhanced Real-Time Emotion Recognition System")

# Capture image from webcam or upload an image
st.write("Capture an image using your webcam or upload an image to analyze.")

camera_input = st.camera_input("Capture your emotion!")
uploaded_image = st.file_uploader("Upload an Image", type=["jpg", "png", "jpeg"])

if camera_input is not None or uploaded_image is not None:
    # Read the captured/uploaded image
    if camera_input is not None:
        # From camera
        image = cv2.imdecode(np.frombuffer(camera_input.getvalue(), np.uint8), 1)
    elif uploaded_image is not None:
        # From file upload
        image = cv2.imdecode(np.frombuffer(uploaded_image.read(), np.uint8), 1)

    # Display the original image
    st.image(image, caption="Captured/Uploaded Image", use_container_width=True)

    # Convert the image to grayscale
    gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Resize and preprocess the image
    resized_image = cv2.resize(gray_image, (14, 14))  # Adjust size to model requirements
    resized_image = resized_image.astype('float32') / 255.0  # Normalize pixel values
    angles = resized_image.flatten()

    # Pad or truncate features to match model input size
    if len(angles) < 200:
        angles = np.pad(angles, (0, 200 - len(angles)), 'constant')
    elif len(angles) > 200:
        angles = angles[:200]

    # Generate example confidence scores (random for demonstration)
    values = np.random.rand(5) * 100  # Example probabilities for emotions
    emotions = ['Happy', 'Sad', 'Angry', 'Surprise', 'Fear']  # Emotion labels

    # Determine the prediction based on the highest value
    max_index = np.argmax(values)  # Get the index of the maximum value
    prediction = emotions[max_index]  # Get the corresponding emotion

    # Display the prediction
    st.write(f"Prediction: {prediction}")

    # Display Confidence Graph
    fig_emotion, ax_emotion = plt.subplots()
    ax_emotion.bar(emotions, values, color='green')
    ax_emotion.set_title("Emotion Confidence Levels")
    ax_emotion.set_xlabel("Emotions")
    ax_emotion.set_ylabel("Confidence (%)")
    st.pyplot(fig_emotion)

    # Additional Features
    st.write("### Additional Features:")

    # 1. Blue-tinted version of the grayscale image
    blue_image = cv2.applyColorMap(gray_image, cv2.COLORMAP_COOL)
    st.image(blue_image, caption="Blue-Tinted Image", use_container_width=True)

    # 2. Pixel Intensity Histogram
    hist_values, bin_edges = np.histogram(gray_image, bins=256, range=(0, 256))
    fig_hist, ax_hist = plt.subplots()
    ax_hist.plot(bin_edges[:-1], hist_values, color='blue')
    ax_hist.set_title("Pixel Intensity Histogram")
    ax_hist.set_xlabel("Pixel Intensity")
    ax_hist.set_ylabel("Frequency")
    st.pyplot(fig_hist)

    # 3. Display raw features for transparency
    st.write("Raw Feature Data (First 10 Values):")
    st.write(angles[:10])

    st.write("Scanning Completed!")
else:
    st.write("Waiting for input...")
