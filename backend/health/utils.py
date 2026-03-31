import joblib
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), "risk_model.pkl")
model = joblib.load(MODEL_PATH)


def predict_health_risk(data):
    features = [[
        data.get("gender"),
        data.get("age"),
        data.get("hypertension"),
        data.get("heart_disease"),
        data.get("ever_married"),
        data.get("work_type"),
        data.get("Residence_type"),
        data.get("avg_glucose_level"),
        data.get("bmi"),
        data.get("smoking_status"),
    ]]
    return model.predict(features)[0]


def calculate_risk_percentage(risk):
    return 75 if risk == 1 else 25
