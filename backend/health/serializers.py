# serializers not required for ML prediction API
from rest_framework import serializers

class HealthInputSerializer(serializers.Serializer):

    full_name = serializers.CharField()
    age = serializers.IntegerField()
    gender = serializers.CharField()

    height = serializers.FloatField()
    weight = serializers.FloatField()

    activity_level = serializers.CharField()
    sleep_hours = serializers.CharField()
    stress_level = serializers.CharField()

    is_smoker = serializers.BooleanField()
    drinks_alcohol = serializers.BooleanField()

    has_heart_history = serializers.BooleanField()
    has_hypertension = serializers.BooleanField()
    has_diabetes_history = serializers.BooleanField()
    has_cholesterol = serializers.BooleanField()

    chest_pain = serializers.CharField()
    shortness_breath = serializers.CharField()