from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .utils import validate_file, importExcelAndReturnJSON
from student.models import (
    Student,
    AcademicAttendanceSemester,
    AcademicPerformanceSemester,
)
from .models import DepartmentCoordinator
from django.conf import settings
import os
from collections import defaultdict
import json
@login_required
def index(request):
    if request.user.role != "department_coordinator":
        return redirect("/")
    department_coordinator = DepartmentCoordinator.objects.get(user=request.user)
    students = Student.objects.select_related("user").all()
    context = {}
    context["total_students"] = len(students)
    context["fe_count"] = len(students.filter(academic_year="FE"))
    context["te_count"] = len(students.filter(academic_year="TE"))
    context["be_count"] = len(students.filter(academic_year="BE"))
    context["se_count"] = len(students.filter(academic_year="SE"))
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
    df = importExcelAndReturnJSON(os.path.join(settings.BASE_DIR, "alumni2023.csv"))
    cleaned_df = list(filter(lambda x: x.get("salary") is not None, df))
    departments = list(set(
        filter(
            lambda x: x is not None,
            map(
                lambda x: (
                    x.get("BRANCH /DIV", "").split("-")[0]
                    if x.get("BRANCH /DIV")
                    else None
                ),
                cleaned_df,
            ),
        )
    ))
    department_salaries = defaultdict(float)
    salaries_range = {'>Rs 5 LPA':0, '>Rs 3.5 LPA':0, '>Rs 8 LPA':0}
    for entry in cleaned_df:
        branch_div = entry.get("BRANCH /DIV", "")
        salary = entry.get("salary", 0)

        if branch_div:
            department = branch_div.split("-")[0]
            if department in departments:
                student_salary = float(salary.split("/")[0])
                department_salaries[department] += student_salary
                if student_salary>5 and student_salary<8:
                    salaries_range['>Rs 5 LPA']+=1
                elif student_salary>=3.5 and student_salary<5:
                    salaries_range['>Rs 3.5 LPA']+=1
                else:
                    salaries_range['>Rs 8 LPA']+=1
    context = {
        "department_salaries":json.dumps(department_salaries),
        "salaries_range":json.dumps(salaries_range),
    }
    return render(request, "department_coordinator/stats.html", context)


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
                    AcademicAttendanceSemester.objects.create(
                        student=student,
                        attendance=i["attendance"],
                        semester=i["semester"],
                    )
                messages.success(request, "Data imported successfully")
            else:
                if not validate_file(request.FILES.get("file_performance")):
                    messages.error(request, "Invalid file type")
                    return render(request, "department_coordinator/attendance.html")
                df = importExcelAndReturnJSON(request.FILES.get("file_performance"))
                for i in df:
                    student = Student.objects.get(uid=i["uid"])
                    AcademicPerformanceSemester.objects.create(
                        student=student,
                        performance=i["performance"],
                        semester=i["semester"],
                    )
                messages.success(request, "Data imported successfully")
        except Exception as e:
            print(e)
            messages.error(request, "Something went wrong")
    return render(request, "department_coordinator/attendance.html")
