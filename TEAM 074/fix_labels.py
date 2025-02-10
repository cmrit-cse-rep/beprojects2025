import pandas as pd

# Load the CSV file
data = pd.read_csv('angles_data_fixed.csv')

# Add a dummy 'emotion' column with random values
data['emotion'] = ['happy' for _ in range(len(data))]  # Replace with actual labels if available

# Save the modified dataset to a new CSV file
data.to_csv('angles_data_fixed.csv', index=False)

print("File 'angles_data_fixed.csv' created successfully!")
