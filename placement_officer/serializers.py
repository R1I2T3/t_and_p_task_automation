from rest_framework import serializers
from .models import CategoryRule

class CategoryRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategoryRule
        fields = [
            'category',
            'batch',
            'minimum_academic_attendance',
            'minimum_academic_performance',
            'minimum_training_attendance',
            'minimum_training_performance',
        ]