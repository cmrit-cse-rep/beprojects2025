import pandas as pd

# Load the original angles_data.csv file
try:
    data = pd.read_csv('angles_data.csv')
    print("Original columns:", data.columns)

    # Add an 'emotion' column with dummy labels if it doesn't exist
    if 'emotion' not in data.columns:
        print("No 'emotion' column found. Adding dummy 'emotion' column...")
        # Replace these with real labels if available
        data['emotion'] = ['Happy'] * len(data)

    # Save the fixed file
    data.to_csv('angles_data_fixed.csv', index=False)
    print("Saved fixed file as 'angles_data_fixed.csv'.")
except FileNotFoundError:
    print("Error: 'angles_data.csv' not found!")
