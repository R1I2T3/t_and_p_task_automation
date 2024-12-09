from rest_framework import serializers
from .models import Forms, FormField, Options


class OptionsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Options
        fields = ["id", "value"]


class FormFieldSerializer(serializers.ModelSerializer):
    options = OptionsSerializer(
        many=True, source="options_set"
    )  # Fetch related options

    class Meta:
        model = FormField
        fields = [
            "id",
            "field_name",
            "field_label",
            "field_placeholder",
            "field_type",
            "options",
        ]


class FormsSerializer(serializers.ModelSerializer):
    formfields = FormFieldSerializer(
        many=True, source="formfield_set"
    )  # Fetch related fields

    class Meta:
        model = Forms
        fields = ["id", "purpose", "last_date", "created_at", "formfields"]
