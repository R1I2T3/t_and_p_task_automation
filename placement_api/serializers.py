from rest_framework import serializers
from student.models import Student
from .models import (
    CompanyRegistration,
    Offers,
    placementNotice,
    jobApplication,
    jobAcceptance,
)


class CompanyRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyRegistration
        fields = "__all__"


class OffersSerializer(serializers.ModelSerializer):
    company = (
        CompanyRegistrationSerializer()
    )  # Nested serialization for related company

    class Meta:
        model = Offers
        fields = "__all__"


class PlacementNoticeSerializer(serializers.ModelSerializer):
    company = (
        CompanyRegistrationSerializer()
    )  # Nested serialization for related company
    offers = OffersSerializer(many=True, read_only=True)
    company_offers = serializers.SerializerMethodField()

    class Meta:
        model = placementNotice
        fields = "__all__"

    def get_company_offers(self, obj):
        # Get all offers associated with the company
        offers = obj.company.company_offers.all()
        return OffersSerializer(offers, many=True).data


class JobApplicationSerializer(serializers.ModelSerializer):
    student = serializers.PrimaryKeyRelatedField(queryset=Student.objects.all())
    company = serializers.PrimaryKeyRelatedField(
        queryset=CompanyRegistration.objects.all()
    )

    class Meta:
        model = jobApplication
        fields = "__all__"


class JobAcceptanceSerializer(serializers.ModelSerializer):
    student = serializers.PrimaryKeyRelatedField(queryset=Student.objects.all())
    company = (
        CompanyRegistrationSerializer()
    )  # Nested serialization for related company

    class Meta:
        model = jobAcceptance
        fields = "__all__"
