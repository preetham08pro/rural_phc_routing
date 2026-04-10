from flask import Flask, request, jsonify
from flask_cors import CORS
import csv
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# ✅ Input Validation
def validate_input(data):
    try:
        temp = float(data.get('temperature', 0))
        oxygen = float(data.get('oxygen', 0))
        bp = float(data.get('bp', 0))
        age = int(data.get('age', 0))

        if temp < 30 or temp > 45:
            return False, "Invalid Temperature (30-45°C only)"
        if oxygen < 50 or oxygen > 100:
            return False, "Invalid Oxygen Level (50-100%)"
        if bp < 60 or bp > 200:
            return False, "Invalid Blood Pressure (60-200)"
        if age < 0 or age > 120:
            return False, "Invalid Age (0-120)"

        return True, ""

    except (ValueError, TypeError):
        return False, "Invalid Input Type (enter numbers only)"


# 🔍 Prediction Route
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data provided"}), 400

        is_valid, error_msg = validate_input(data)
        if not is_valid:
            return jsonify({"error": error_msg}), 400

        temp = float(data.get('temperature', 0))
        oxygen = float(data.get('oxygen', 0))
        bp = float(data.get('bp', 0))
        age = int(data.get('age', 0))
        symptoms = data.get('symptoms', "")

        # 🤖 TRIAGE LOGIC (FIXED)
        if oxygen < 90 or temp > 39:
            severity = "High"
            doctor = "Dr Kumar"
            room = "ICU"
            wait_time = "0-5 mins"

        elif temp > 37.5 or bp > 140:
            severity = "Medium"
            doctor = "Dr Ravi"
            room = "General Ward"
            wait_time = "10-20 mins"

        else:
            severity = "Low"
            doctor = "Dr Asha"
            room = "OPD"
            wait_time = "20-40 mins"

        # ✅ Save to CSV (SAFE)
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        file_exists = os.path.isfile("patients.csv")

        with open("patients.csv", mode="a", newline="", encoding="utf-8") as file:
            writer = csv.writer(file)

            if not file_exists:
                writer.writerow([
                    "temperature", "oxygen", "bp", "age",
                    "symptoms", "severity", "doctor", "room", "timestamp"
                ])

            writer.writerow([
                str(temp),
                str(oxygen),
                str(bp),
                str(age),
                symptoms if symptoms else "",
                severity,
                doctor,
                room,
                timestamp
            ])

        return jsonify({
            "severity": severity,
            "doctor": doctor,
            "room": room,
            "wait_time": wait_time
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 📊 Patients Route (FIXED)
@app.route('/patients', methods=['GET'])
def get_patients():
    patients = []

    try:
        if os.path.isfile("patients.csv"):
            with open("patients.csv", mode="r", encoding="utf-8") as file:
                reader = csv.DictReader(file)

                for row in reader:
                    # ✅ Clean None values and gracefully handle erratic CSV headers
                    clean_row = {}
                    for k, v in row.items():
                        if k is not None:
                            clean_row[str(k)] = v if v is not None else ""
                    
                    patients.append(clean_row)

    except Exception as e:
        print("Error reading CSV:", e)

    return jsonify(patients[::-1]), 200


# 📈 Analytics Route
@app.route('/analytics', methods=['GET'])
def get_analytics():
    total = 0
    high = 0
    medium = 0
    low = 0
    sum_oxygen = 0.0

    try:
        if os.path.isfile("patients.csv"):
            with open("patients.csv", mode="r", encoding="utf-8") as file:
                reader = csv.DictReader(file)
                for row in reader:
                    total += 1
                    
                    sev = row.get("severity", "").strip().upper()
                    if sev == "EMERGENCY" or sev == "HIGH":
                        high += 1
                    elif sev == "MEDIUM":
                        medium += 1
                    elif sev == "LOW":
                        low += 1
                        
                    try:
                        oxy = float(row.get("oxygen", 0))
                        sum_oxygen += oxy
                    except ValueError:
                        pass

    except Exception as e:
        print("Error reading CSV for analytics:", e)

    avg_oxygen = round(sum_oxygen / total, 2) if total > 0 else 0

    return jsonify({
        "total": total,
        "high": high,
        "medium": medium,
        "low": low,
        "avg_oxygen": avg_oxygen
    }), 200


# 🏠 Optional Home Route
@app.route('/')
def home():
    return "Backend running 🚀"


if __name__ == '__main__':
    app.run(debug=True, port=5000)