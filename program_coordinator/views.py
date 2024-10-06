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
from django.db.models import Count, Avg
import json


# Create your views here.
@login_required
def index(request):
    if request.user.role != "program_coordinator":
        return redirect("/")
    program_coordinator = ProgramCoordinator.objects.get(user=request.user)
    result = (
        TrainingAttendanceSemester.objects.filter(program=program_coordinator)
        .values("student__department", "student__academic_year")
        .annotate(
            total_by_department=Count("student__department"),
            total_by_year=Count("student__academic_year"),
            avg_attendance_by_department=Avg("training_attendance"),
        )
    )
    branch_avg_performance = (
        TrainingPerformanceSemester.objects.filter(program=program_coordinator)
        .values("student__department")
        .annotate(avg_performance=Avg("training_performance"))
    )
    students_by_department = {}
    students_by_year = {}
    branch_avg_attendance = {}
    for entry in result:
        department = entry["student__department"]
        year = entry["student__academic_year"]
        students_by_department[department] = entry["total_by_department"]
        students_by_year[year] = entry["total_by_year"]
        branch_avg_attendance[department] = entry["avg_attendance_by_department"]
    branch_performance_dict = {
        entry["student__department"]: entry["avg_performance"]
        for entry in branch_avg_performance
    }
    context = {
        "department_count": json.dumps(students_by_department),
        "year_count": json.dumps(students_by_year),
        "department_avg_attendance": json.dumps(branch_avg_attendance),
        "department_avg_performance": json.dumps(branch_performance_dict),
    }
    return render(request, "program_coordinator/index.html", context)


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
