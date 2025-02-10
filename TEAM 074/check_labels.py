import pandas as pd

# Load the fixed CSV file
data = pd.read_csv('angles_data_fixed.csv')

# Check unique classes in the 'emotion' column
if 'emotion' in data.columns:
    unique_classes = data['emotion'].unique()
    print(f"Unique classes in 'emotion': {unique_classes}")
    print(f"Number of unique classes: {len(unique_classes)}")
else:
    print("Error: 'emotion' column not found!")
