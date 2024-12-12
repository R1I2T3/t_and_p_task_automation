from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Forms
from .serializers import FormsSerializer
from .models import FormField, Forms, Options
from rest_framework import status
from uuid import uuid4


class SingleForm(APIView):
    def get(self, request, pk):
        form = Forms.objects.prefetch_related("formfield_set__options_set").get(id=pk)
        serializer = FormsSerializer(form)
        print(serializer.data)
        return Response(serializer.data)

    def post(self, request, pk):
        form = Forms.objects.prefetch_related("formfield_set__options_set").get(id=pk)
        print(form)
        return Response(
            {"message": "Form submitted successfully!"}, status=status.HTTP_201_CREATED
        )


class FormList(APIView):

    def post(self, request):
        # Extract form data
        form_data = request.data.get("form", {})
        fields_data = request.data.get("fields", [])
        if not form_data:
            return Response(
                {"error": "Form data is required"}, status=status.HTTP_400_BAD_REQUEST
            )
        try:
            form = Forms.objects.create(
                purpose=form_data.get("purpose"),
                last_date=form_data.get("last_date"),
                id=uuid4(),
            )
            for field in fields_data:
                form_field = FormField.objects.create(
                    id=uuid4(),
                    field_name=field.get("name"),
                    field_label=field.get("label"),
                    field_placeholder=field.get("placeholder", ""),
                    field_type=field.get("type"),
                    form=form,
                )

                options = field.get("options", [])
                if options[0].get("value") != "":
                    for option_value in options:
                        Options.objects.create(
                            value=option_value.get("value"),
                            field=form_field,
                            id=uuid4(),
                        )

            return Response(
                {"message": "Form and fields created successfully!"},
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            print(e)
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
