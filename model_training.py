import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import VotingClassifier
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler

# Step 1: Load data
data = pd.read_csv('../dataset/angles_data_sampled.csv')  # Adjust the path

# Check the first few rows to inspect the data
print("First few rows of the dataset:")
print(data.head())

# Step 2: Check for 'emotion' column and validate the dataset
if 'emotion' not in data.columns:
    print("Error: 'emotion' column not found!")
else:
    print(f"Columns in the dataset: {data.columns}")

    # Step 3: Split the data into features (X) and labels (y)
    X = data.drop('emotion', axis=1, errors='ignore')  # Drop 'emotion' column if it exists
    X = X.iloc[:, :200]
    y = data['emotion'] if 'emotion' in data.columns else None

    if y is None:
        print("Error: 'emotion' column is missing from the data.")
        exit()

    # Step 4: Check if there is more than one class in the target variable
    print(f"Unique values in the 'emotion' column: {y.unique()}")  # Show unique values

    if len(y.unique()) <= 1:
        print(f"Error: The target 'emotion' has only {len(y.unique())} class(es).")
        print("This might be caused by an issue in the dataset. Please verify the data.")
        exit()

    # Step 5: Split the data into training and testing sets
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Step 6: Scale the data
    scaler = StandardScaler()
    X_train = scaler.fit_transform(X_train)
    X_test = scaler.transform(X_test)

    # Step 7: Define models for the ensemble
    svm = SVC(kernel='linear', random_state=42)
    dt = DecisionTreeClassifier(random_state=42)
    knn = KNeighborsClassifier()

    # Step 8: Create an ensemble model using VotingClassifier
    ensemble = VotingClassifier(estimators=[('svm', svm), ('dt', dt), ('knn', knn)], voting='hard')

    # Step 9: Train the model
    print("Training the model...")
    ensemble.fit(X_train, y_train)

    # Step 10: Evaluate the model
    print(f"Training accuracy: {ensemble.score(X_train, y_train):.4f}")
    print(f"Test accuracy: {ensemble.score(X_test, y_test):.4f}")

# Save the trained ensemble model
import joblib
joblib.dump(ensemble, "ensemble_model.pkl")
print("Model saved as ensemble_model.pkl")

