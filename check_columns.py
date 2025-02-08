import pandas as pd

# Load the CSV file
data = pd.read_csv('angles_data_fixed.csv')

# Print the column names
print("Columns in the dataset:")
print(data.columns)
