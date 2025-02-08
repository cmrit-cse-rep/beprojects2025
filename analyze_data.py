import pandas as pd

# Use the absolute path to the file
file_path = r"C:\Users\DELL\emoji_facial_project\dataset\angles_data.csv"
data = pd.read_csv(file_path)

print("Columns in the dataset:", data.columns.tolist())
