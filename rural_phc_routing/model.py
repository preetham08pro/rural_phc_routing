import pandas as pd
from sklearn.linear_model import LogisticRegression

# Load dataset
data = pd.read_csv("patients.csv")

# Features
X = data[['age', 'temp', 'pulse', 'oxygen', 'bp']]

# Target
y = data['risk']

# Train model
model = LogisticRegression()
model.fit(X, y)

# ✅ REQUIRED FUNCTION
def predict_risk(age, temp, pulse, oxygen, bp):
    input_data = [[age, temp, pulse, oxygen, bp]]
    prediction = model.predict(input_data)[0]
    return prediction