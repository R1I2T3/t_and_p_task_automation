from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from department_coordinator.utils import validate_file, importExcelAndReturnJSON
from django.contrib import messages
from student.models import (
    Student,
    TrainingAttendanceSemester,
    TrainingPerformanceSemester,
)
from .models import ProgramCoordinator


# Create your views here.
@login_required
def index(request):
    if request.user.role != "program_coordinator":
        return redirect("/")
    return render(request, "program_coordinator/index.html")


@login_required
def attendance(request):
    if request.user.role != "program_coordinator":
        return redirect("/")
    program_coordinator = ProgramCoordinator.objects.get(user=request.user)
    if request.method == "POST":
        try:
            if request.POST.get("formType") == "attendanceForm":
                if not validate_file(request.FILES.get("file_attendance")):
                    messages.error(request, "Invalid file type")
                df = importExcelAndReturnJSON(request.FILES.get("file_attendance"))
                for i in df:
                    student = Student.objects.get(uid=i["uid"])
                    TrainingAttendanceSemester.objects.update_or_create(
                        defaults={
                            "training_attendance": i["attendance"],
                            "semester": i["semester"],
                            "program": program_coordinator,
                        },
                        student=student,
                    )
                messages.success(request, "Data imported successfully")
            else:
                if not validate_file(request.FILES.get("file_performance")):
                    messages.error(request, "Invalid file type")
                    return render(request, "department_coordinator/attendance.html")
                df = importExcelAndReturnJSON(request.FILES.get("file_performance"))
                for i in df:
                    student = Student.objects.get(uid=i["uid"])
                    TrainingPerformanceSemester.objects.update_or_create(
                        student=student,
                        defaults={
                            "training_performance": i["performance"],
                            "semester": i["semester"],
                            "program": program_coordinator,
                        },
                        semester=i["semester"],
                    )
                messages.success(request, "Data imported successfully")
        except Exception as e:
            print(e)
    return render(request, "program_coordinator/attendance.html")
