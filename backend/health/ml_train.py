import pandas as pd
import joblib
import numpy as np
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, VotingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, roc_auc_score
from sklearn.preprocessing import StandardScaler
import os

# ─── 1. LOAD DATASET ────────────────────────────────────────────────────────
df = pd.read_csv("data/test.csv")
print(f"Loaded {len(df)} rows, {df.shape[1]} columns")

# ─── 2. DROP UNWANTED COLUMNS ────────────────────────────────────────────────
df.drop(columns=['id'], inplace=True)

# ─── 3. HANDLE MISSING VALUES ────────────────────────────────────────────────
numeric_cols = ['age', 'avg_glucose_level', 'bmi']
for col in numeric_cols:
    df[col] = df[col].fillna(df[col].median())  # use median (more robust than mean)

categorical_cols = ['gender', 'ever_married', 'work_type', 'Residence_type', 'smoking_status']
for col in categorical_cols:
    df[col] = df[col].fillna(df[col].mode()[0])

# ─── 4. FEATURE ENGINEERING ──────────────────────────────────────────────────
# BMI category: 0=underweight, 1=normal, 2=overweight, 3=obese
# np.digitize is NaN-safe and avoids Categorical issues
df['bmi_category'] = np.digitize(df['bmi'].fillna(22), bins=[18.5, 25, 30]).astype(int)

# Glucose risk flag
df['glucose_risk'] = (df['avg_glucose_level'] > 140).astype(int)

# Age group: 0=<30, 1=30-45, 2=45-60, 3=60-80, 4=80+
df['age_group'] = np.digitize(df['age'].fillna(30), bins=[30, 45, 60, 80]).astype(int)

# Combined risk score (0-4)
df['combined_risk'] = (
    (df['hypertension'] == 1).astype(int) +
    (df['heart_disease'] == 1).astype(int) +
    (df['avg_glucose_level'] > 140).astype(int) +
    (df['bmi'] > 30).astype(int)
)

# ─── 6. ENCODE CATEGORICAL COLUMNS ──────────────────────────────────────────
encoders = {}
for col in categorical_cols:
    enc = LabelEncoder()
    df[col] = enc.fit_transform(df[col])
    encoders[col] = enc

# ─── 7. CREATE RISK LABEL ─────────────────────────────────────────────────────
df['risk'] = (
    (df['hypertension'] == 1) |
    (df['heart_disease'] == 1) |
    (df['avg_glucose_level'] > 140) |
    (df['bmi'] > 30)
).astype(int)

# Drop original stroke column if present (it's the raw target we don't want to use directly)
if 'stroke' in df.columns:
    df.drop(columns=['stroke'], inplace=True)

# ─── 8. FEATURES & TARGET ────────────────────────────────────────────────────
FEATURE_COLS = [
    'gender', 'age', 'hypertension', 'heart_disease',
    'ever_married', 'work_type', 'Residence_type',
    'avg_glucose_level', 'bmi', 'smoking_status',
    'bmi_category', 'glucose_risk', 'age_group', 'combined_risk'
]

X = df[FEATURE_COLS]
y = df['risk']

print(f"Class distribution:\n{y.value_counts()}")
print(f"Risk rate: {y.mean():.1%}")

# ─── 9. TRAIN/TEST SPLIT ─────────────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# ─── 10. ENSEMBLE MODEL ──────────────────────────────────────────────────────
rf = RandomForestClassifier(
    n_estimators=300,
    max_depth=8,
    min_samples_leaf=4,
    class_weight='balanced',
    random_state=42,
    n_jobs=-1
)

gb = GradientBoostingClassifier(
    n_estimators=200,
    learning_rate=0.08,
    max_depth=5,
    subsample=0.85,
    random_state=42
)

lr = LogisticRegression(
    max_iter=1000,
    class_weight='balanced',
    random_state=42,
    C=0.5
)

ensemble = VotingClassifier(
    estimators=[('rf', rf), ('gb', gb), ('lr', lr)],
    voting='soft',
    weights=[3, 2, 1]
)

ensemble.fit(X_train, y_train)

# ─── 11. EVALUATION ──────────────────────────────────────────────────────────
y_pred = ensemble.predict(X_test)
y_proba = ensemble.predict_proba(X_test)[:, 1]
cv_scores = cross_val_score(ensemble, X, y, cv=5, scoring='roc_auc')

print("\n--- Model Evaluation -------------------------------------------")
print(classification_report(y_test, y_pred))
print(f"ROC-AUC:              {roc_auc_score(y_test, y_proba):.4f}")
print(f"Cross-val ROC-AUC:    {cv_scores.mean():.4f} +/- {cv_scores.std():.4f}")

# ─── 12. SAVE MODEL + METADATA ───────────────────────────────────────────────
model_data = {
    'model': ensemble,
    'feature_cols': FEATURE_COLS,
}

joblib.dump(model_data, "health/risk_model.pkl")
print("[OK] Ensemble model (RF + GB + LR) saved to health/risk_model.pkl")
print(f"Features used ({len(FEATURE_COLS)}): {FEATURE_COLS}")
