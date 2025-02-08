import pandas as pd
import numpy as np
import os

# Load the FER2013 dataset
data = pd.read_csv('dataset/fer2013.csv')

# Prepare the new CSV file for the angles_data.csv format
output_data = []

# Iterate through each row in the FER2013 dataset
for index, row in data.iterrows():
    # Get the emotion label
    emotion = row['emotion']
    
    # Get the pixel data (converting it into a numpy array)
    pixels = np.fromstring(row['pixels'], sep=' ', dtype=int)
    
    # Append the pixels and emotion to the output_data list
    output_data.append(np.append(pixels, emotion))

# Convert the output data to a pandas DataFrame
output_df = pd.DataFrame(output_data)

# Save the DataFrame to a new CSV file (angles_data.csv)
output_df.to_csv('dataset/angles_data.csv', index=False, header=False)

print("angles_data.csv created successfully!")
