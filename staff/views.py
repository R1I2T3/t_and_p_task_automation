from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import CompanyRegistration
from .serializers import FormDataSerializer


class CompanyListCreateView(generics.CreateAPIView):
    queryset = CompanyRegistration.objects.all()
    serializer_class = FormDataSerializer


class CompanyDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FormDataSerializer
    lookup_field = "id"

    def get_object(self):
        company_id = self.kwargs.get("id")
        return CompanyRegistration.objects.get(id=company_id)



class CompanyByBatchView(generics.ListAPIView):
    serializer_class = FormDataSerializer

    def get_queryset(self):
        batch = self.kwargs.get("batch")
        return CompanyRegistration.objects.filter(batch=batch)


class CompanyBatchesView(APIView):
    def get(self, request, *args, **kwargs):
        batches = CompanyRegistration.objects.values_list('batch', flat=True).distinct()
        return Response(batches)
