from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.conf import settings
from pathlib import Path
import joblib
import numpy as np

# ─── Load model once at startup ──────────────────────────────────────────────
MODEL_PATH = Path(settings.BASE_DIR) / "health" / "risk_model.pkl"

try:
    model_data = joblib.load(MODEL_PATH)
    # Support both old (bare model) and new (dict with metadata) format
    if isinstance(model_data, dict):
        model = model_data['model']
        FEATURE_COLS = model_data.get('feature_cols', None)
    else:
        model = model_data
        FEATURE_COLS = None
    print("✅ Model loaded successfully")
except Exception as e:
    model = None
    FEATURE_COLS = None
    print(f"⚠️ Model load failed: {e}")


def _save_to_firebase(data: dict):
    """Optional Firebase storage. Silently skips if Firebase is not configured."""
    try:
        from firebase_admin import db
        ref = db.reference('predictions')
        ref.push(data)
    except Exception:
        pass  # Firebase is optional – don't crash the request


@api_view(['POST'])
def predict_risk(request):
    if model is None:
        return Response({"error": "Model not loaded. Run ml_train.py first."}, status=503)

    try:
        d = request.data

        # ─── Core inputs ──────────────────────────────────────────────────────
        gender          = float(d.get('gender', 1))
        age             = float(d.get('age', 30))
        hypertension    = float(d.get('hypertension', 0))
        heart_disease   = float(d.get('heart_disease', 0))
        ever_married    = float(d.get('ever_married', 1))
        work_type       = float(d.get('work_type', 2))
        Residence_type  = float(d.get('Residence_type', 1))
        avg_glucose     = float(d.get('avg_glucose_level', 105))
        bmi             = float(d.get('bmi', 22))
        smoking_status  = float(d.get('smoking_status', 0))

        # ─── Engineered features (must match ml_train.py) ─────────────────────
        if bmi < 18.5:
            bmi_category = 0
        elif bmi < 25:
            bmi_category = 1
        elif bmi < 30:
            bmi_category = 2
        else:
            bmi_category = 3

        glucose_risk = 1 if avg_glucose > 140 else 0

        if age < 30:
            age_group = 0
        elif age < 45:
            age_group = 1
        elif age < 60:
            age_group = 2
        elif age < 80:
            age_group = 3
        else:
            age_group = 4

        combined_risk = int(hypertension + heart_disease + glucose_risk + (1 if bmi > 30 else 0))

        # ─── Build feature vector ─────────────────────────────────────────────
        if FEATURE_COLS:
            input_data = [[
                gender, age, hypertension, heart_disease,
                ever_married, work_type, Residence_type,
                avg_glucose, bmi, smoking_status,
                bmi_category, glucose_risk, age_group, combined_risk
            ]]
        else:
            # Fallback: old model with only 10 features
            input_data = [[
                gender, age, hypertension, heart_disease,
                ever_married, work_type, Residence_type,
                avg_glucose, bmi, smoking_status
            ]]

        # ─── Predict ──────────────────────────────────────────────────────────
        prediction_raw = model.predict(input_data)[0]
        result = "High Risk" if prediction_raw == 1 else "Low Risk"

        # Confidence from probability
        confidence = 80  # default
        if hasattr(model, 'predict_proba'):
            proba = model.predict_proba(input_data)[0]
            confidence = int(round(max(proba) * 100))

        # ─── Store in Firebase (optional) ─────────────────────────────────────
        _save_to_firebase({
            "age": age, "gender": gender, "bmi": bmi,
            "hypertension": hypertension, "heart_disease": heart_disease,
            "smoking_status": smoking_status, "avg_glucose_level": avg_glucose,
            "result": result, "confidence": confidence
        })

        return Response({
            "prediction": result,
            "confidence": confidence,
            "bmi": round(bmi, 2),
            "risk_factors": {
                "bmi_high": bmi > 30,
                "glucose_high": avg_glucose > 140,
                "smoker": smoking_status == 1,
                "heart_disease": heart_disease == 1,
                "hypertension": hypertension == 1,
            }
        })

    except Exception as e:
        return Response({"error": str(e)}, status=400)
