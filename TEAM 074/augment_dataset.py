import pandas as pd

# Load the original dataset
data = pd.read_csv('angles_data_fixed.csv')

# Create additional samples for new emotions
emotions = ['happy', 'sad', 'angry', 'surprised', 'neutral']
augmented_data = pd.DataFrame()

for i, emotion in enumerate(emotions):
    # Duplicate the existing data
    temp_data = data.copy()
    temp_data['emotion'] = emotion  # Assign a new emotion
    augmented_data = pd.concat([augmented_data, temp_data], ignore_index=True)

# Save the augmented dataset
augmented_data.to_csv('angles_data_fixed_balanced.csv', index=False)
print("Balanced dataset saved as 'angles_data_fixed_balanced.csv'")
