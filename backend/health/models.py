from django.db import models

class HealthProfile(models.Model):
    GENDER_CHOICES = [('M', 'Male'), ('F', 'Female'), ('O', 'Other')]
    ACTIVITY_CHOICES = [
        ('Sedentary', 'Sedentary (little or no exercise)'),
        ('Lightly Active', 'Lightly Active (exercise 1-3 days/week)'),
        ('Moderately Active', 'Moderately Active (exercise 3-5 days/week)'),
        ('Very Active', 'Very Active (exercise 6-7 days/week)'),
    ]

    firebase_uid = models.CharField(max_length=128, unique=True, db_index=True)
    full_name = models.CharField(max_length=255)
    age = models.IntegerField()
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    height = models.FloatField(help_text="Height in cm")
    weight = models.FloatField(help_text="Weight in kg")
    is_smoker = models.BooleanField(default=False)
    activity_level = models.CharField(max_length=20, choices=ACTIVITY_CHOICES)
    has_diabetes_history = models.BooleanField(default=False)
    has_heart_history = models.BooleanField(default=False)
    
    # Calculated fields (can be stored or computed)
    risk_score = models.FloatField(default=0.0)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.full_name

class FamilyMember(models.Model):
    parent_profile = models.ForeignKey(HealthProfile, on_delete=models.CASCADE, related_name='family_members')
    full_name = models.CharField(max_length=255)
    relationship = models.CharField(max_length=50) # e.g., Father, Mother, Sibling
    age = models.IntegerField()
    height = models.FloatField()
    weight = models.FloatField()
    risk_score = models.FloatField(default=0.0)

    def __str__(self):
        return f"{self.full_name} ({self.relationship})"
