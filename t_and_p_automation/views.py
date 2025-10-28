from django.contrib.auth.decorators import login_required
from base.views import redirect_user
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response as JSONResponse
from base.models import User, FacultyResponsibility
from django.contrib.auth import logout
from student.models import Student
from django.views.static import serve
from django.shortcuts import render

def serve_static(request, path, document_root=""):
    return serve(request, path, document_root, show_indexes=True)


@api_view(["GET"])
def my_protected_view(request): 
    current_user = User.objects.get(email=request.user.email)
    if current_user.role == "faculty":
        faculty = FacultyResponsibility.objects.get(user=current_user)
        return JSONResponse(
            {
                "role": "faculty",
                "email": current_user.email,
                "department": faculty.department,
                "program": faculty.program,
            }
        )
    if current_user.role == "student":
        student = Student.objects.get(user=current_user)
        return JSONResponse(
            {
                "role": "student",
                "email": current_user.email,
                "department": student.department,
                "academic_year": student.academic_year,
            }
        )
    return JSONResponse({"role": current_user.role, "email": current_user.email})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_api(request):
    logout(request)
    return JSONResponse({"message": "Logged out successfully."})

@login_required
def index(request):
    return render(request, "index.html")