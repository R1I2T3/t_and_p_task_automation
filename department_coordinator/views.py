from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .utils import validate_file, importExcelAndReturnJSON
from student.models import (
    Student,
    AcademicAttendanceSemester,
    AcademicPerformanceSemester,
    TrainingAttendanceSemester,
    TrainingPerformanceSemester,
)
from .models import DepartmentCoordinator
from django.db.models import Avg, FloatField
from django.db.models.functions import Cast
import os
import json


INTERNSHIP_JSON_PATH = os.path.join("static", "Data", "intern_data.json")
JSON_FILE_PATH_ALUMNI = os.path.join("static", "Data", "alumni_data_2024.json")
JSON_FILE_PATH_PLACEMENT = os.path.join("static", "Data", "placement_data.json")


@login_required
def index(request):
    if request.user.role != "department_coordinator":
        return redirect("/")
    department_coordinator = DepartmentCoordinator.objects.get(user=request.user)
    students = Student.objects.select_related("user").all()
    context = {}
    context["total_students"] = len(
        students.filter(department=department_coordinator.department)
    )
    context["fe_count"] = len(
        students.filter(
            academic_year="FE", department=department_coordinator.department
        )
    )
    context["te_count"] = len(
        students.filter(
            academic_year="TE", department=department_coordinator.department
        )
    )
    context["be_count"] = len(
        students.filter(
            academic_year="BE", department=department_coordinator.department
        )
    )
    context["se_count"] = len(
        students.filter(
            academic_year="SE", department=department_coordinator.department
        )
    )
    context["department_students"] = students.filter(
        department=department_coordinator.department
    )
    if request.GET.get("year"):
        context["department_students"] = context["department_students"].filter(
            academic_year=request.GET.get("year")
        )
    return render(request, "department_coordinator/index.html", context)


@login_required
def stats(request):
    if request.user.role != "department_coordinator":
        return redirect("/")
    department_coordinator = DepartmentCoordinator.objects.get(user=request.user)
    average_academic_attendance = (
        AcademicAttendanceSemester.objects.select_related("student")
        .filter(student__department=department_coordinator.department)
        .values("student__academic_year")
        .annotate(avg_attendance=Avg(Cast("attendance", FloatField())))
        .order_by("student__academic_year")
    )
    average_academic_performance = (
        AcademicPerformanceSemester.objects.select_related("student")
        .filter(student__department=department_coordinator.department)
        .values("student__academic_year")
        .annotate(avg_performance=Avg(Cast("performance", FloatField())))
        .order_by("student__academic_year")
    )
    average_training_attendance = (
        TrainingAttendanceSemester.objects.select_related("student")
        .filter(student__department=department_coordinator.department)
        .values("student__academic_year")
        .annotate(avg_attendance=Avg(Cast("training_attendance", FloatField())))
        .order_by("student__academic_year")
    )
    average_training_performance = (
        TrainingPerformanceSemester.objects.select_related("student")
        .filter(student__department=department_coordinator.department)
        .values("student__academic_year")
        .annotate(avg_performance=Avg(Cast("training_performance", FloatField())))
        .order_by("student__academic_year")
    )
    average_academic_performance_dict = {}
    average_academic_attendance_dict = {}
    average_training_performance_dict = {}
    average_training_attendance_dict = {}
    for entry in average_academic_attendance:
        average_academic_attendance_dict[entry["student__academic_year"]] = round(
            entry["avg_attendance"], 2
        )
    for entry in average_academic_performance:
        average_academic_performance_dict[entry["student__academic_year"]] = round(
            entry["avg_performance"], 2
        )
    for entry in average_training_attendance:
        average_training_attendance_dict[entry["student__academic_year"]] = round(
            entry["avg_attendance"], 2
        )
    for entry in average_training_performance:
        average_training_performance_dict[entry["student__academic_year"]] = round(
            entry["avg_performance"], 2
        )
    internship_data = {}
    placement_data = {}
    try:
        with open(INTERNSHIP_JSON_PATH, "r") as f:
            internship_data_from_json = json.load(f)
            branch_data = internship_data_from_json[0]["branch_data"]
            internship_data["it_branches"] = {
                k: v for k, v in branch_data.items() if k.startswith("IT")
            }
            stipend_data = internship_data_from_json[0]["stipend_per_branch"]
            internship_data["it_stipends"] = {
                k: v for k, v in stipend_data.items() if k.startswith("IT")
            }
        with open(JSON_FILE_PATH_PLACEMENT, "r") as f:
            placement_data_from_json = json.load(f)
            branch_data_placement = placement_data_from_json[0]["branch_comparison"][
                "2023"
            ]
            placement_data["2023"] = {
                k: v for k, v in branch_data_placement.items() if k.startswith("IT")
            }
            branch_data_placement = placement_data_from_json[0]["branch_comparison"][
                "2024"
            ]
            placement_data["2024"] = {
                k: v for k, v in branch_data_placement.items() if k.startswith("IT")
            }
    except Exception as e:
        internship_data = {}
        placement_data = {}
        print(e)
    return render(
        request,
        "department_coordinator/stats.html",
        {
            "average_academic_attendance": json.dumps(average_academic_attendance_dict),
            "average_academic_performance": json.dumps(
                average_academic_performance_dict
            ),
            "average_training_attendance": json.dumps(average_training_attendance_dict),
            "average_training_performance": json.dumps(
                average_training_performance_dict
            ),
            "internship_data": json.dumps(internship_data),
            "placement_data": json.dumps(placement_data),
        },
    )


@login_required
def attendance(request):
    if request.user.role != "department_coordinator":
        return redirect("/")
    if request.method == "POST":
        try:
            if request.POST.get("formType") == "attendanceForm":
                if not validate_file(request.FILES.get("file_attendance")):
                    messages.error(request, "Invalid file type")
                df = importExcelAndReturnJSON(request.FILES.get("file_attendance"))
                for i in df:
                    student = Student.objects.get(uid=i["uid"])
                    AcademicAttendanceSemester.objects.update_or_create(
                        defaults={
                            "attendance": i["attendance"],
                            "semester": i["semester"],
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
                    AcademicPerformanceSemester.objects.update_or_create(
                        student=student,
                        defaults={
                            "performance": i["performance"],
                            "semester": i["semester"],
                        },
                        semester=i["semester"],
                    )
                messages.success(request, "Data imported successfully")
        except Exception as e:
            print(e)
            messages.error(request, "Something went wrong")
    return render(request, "department_coordinator/attendance.html")
