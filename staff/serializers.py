from rest_framework import serializers
from .models import CompanyRegistration, Notice, JobOffer


class NoticeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notice
        fields = "__all__"


class JobOfferSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobOffer
        fields = ["role", "salary", "skills"]


class FormDataSerializer(serializers.ModelSerializer):
    notice = NoticeSerializer()
    job_offers = JobOfferSerializer(many=True)

    class Meta:
        model = CompanyRegistration
        fields = [
            "id",
            "name",
            "batch",
            "min_tenth_marks",
            "min_higher_secondary_marks",
            "min_cgpa",
            "accepted_kt",
            "domain",
            "departments",
            "is_aedp_or_pli",
            "is_aedp_or_ojt",
            "selected_departments",
            "notice",
            "job_offers",
        ]
        extra_kwargs = {"id": {"read_only": True}}

    def create(self, validated_data):
        notice_data = validated_data.pop("notice")
        job_offers_data = validated_data.pop("job_offers")
        notice = Notice.objects.create(**notice_data)
        form = CompanyRegistration.objects.create(notice=notice, **validated_data)
        for job_data in job_offers_data:
            JobOffer.objects.create(form=form, **job_data)
        return form

    def update(self, instance, validated_data):
        notice_data = validated_data.pop("notice", None)
        if notice_data:
            for attr, value in notice_data.items():
                setattr(instance.notice, attr, value)
            instance.notice.save()
        job_offers_data = validated_data.pop("job_offers", None)
        if job_offers_data is not None:
            instance.job_offers.all().delete()
            for job_data in job_offers_data:
                JobOffer.objects.create(form=instance, **job_data)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance
