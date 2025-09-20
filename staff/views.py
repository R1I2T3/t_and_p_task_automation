from rest_framework import generics
from .models import CompanyRegistration
from .serializers import FormDataSerializer


class CompanyListCreateView(generics.ListCreateAPIView):
    queryset = CompanyRegistration.objects.all()
    serializer_class = FormDataSerializer


class CompanyDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FormDataSerializer
    lookup_field = "id"

    def get_object(self):
        name = self.kwargs.get("name")
        batch = self.kwargs.get("batch")
        return CompanyRegistration.objects.get(name=name, batch=batch)


class CompanyByBatchView(generics.ListAPIView):
    serializer_class = FormDataSerializer

    def get_queryset(self):
        batch = self.kwargs.get("batch")
        return CompanyRegistration.objects.filter(batch=batch)
