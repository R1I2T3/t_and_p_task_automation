from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from .models import Student, AcademicAttendanceSemester, TrainingAttendanceSemester
from django.db.models import Sum
from .utils import categorize
import json


# Create your views here.
@login_required
def home(request):
    if request.user.role != "student":
        return redirect("/")
    student = Student.objects.get(user=request.user)
    academic_attendance = student.academic_attendance.all()  # type: ignore
    academic_attendance = AcademicAttendanceSemester.objects.filter(student=student)
    academic_performance = student.academic_performance.all()  # type: ignore
    training_attendance = TrainingAttendanceSemester.objects.filter(student=student)  # type: ignore
    training_performance = student.training_performance.all()  # type: ignore
    print(len(training_attendance))
    (
        academic_attendance_dict,
        academic_performance_dict,
        training_performance_dict,
        training_attendance_dict,
    ) = ({}, {}, {}, {})
    for i in academic_attendance:
        academic_attendance_dict[i.semester] = i.attendance
    for i in academic_performance:
        academic_performance_dict[i.semester] = i.performance
    for i in training_attendance:
        print(i.semester)
        training_attendance_dict[i.semester] = i.training_attendance
    for i in training_performance:
        training_performance_dict[i.semester] = i.training_performance
    context = {
        "academic_attendance": json.dumps(academic_attendance_dict),
        "academic_performance": json.dumps(academic_performance_dict),
        "training_attendance": json.dumps(training_attendance_dict),
        "training_performance": json.dumps(training_performance_dict),
    }
    return render(request, "student/sd.html", context)


def sdCE(request):
    context = {}
    return render(request, "student/sdCE.html", context)


@login_required
def sdP(request):
    if request.user.role != "student":
        return redirect("/")
    student = Student.objects.get(user=request.user)
    academic_attendance_sum = student.academic_attendance.aggregate(Sum("attendance")).get("attendance__sum")  # type: ignore

    academic_attendance = academic_attendance_sum / student.academic_attendance.count() if academic_attendance_sum is not None else None  # type: ignore

    academic_performance_sum = student.academic_performance.aggregate(Sum("performance")).get("performance__sum")  # type: ignore

    academic_performance = academic_performance_sum / student.academic_performance.count() if academic_performance_sum is not None else None  # type: ignore

    training_attendance_sum = student.training_attendance.aggregate(Sum("training_attendance")).get("training_attendance__sum")  # type: ignore
    training_attendance = training_attendance_sum / student.training_attendance.count() if training_attendance_sum is not None else None  # type: ignore

    training_performance_sum = student.training_performance.aggregate(Sum("training_performance")).get("training_performance__sum")  # type: ignore
    training_performance = training_performance_sum / student.training_performance.count() if training_performance_sum is not None else None  # type: ignore
    category = categorize(
        academic_attendance,
        academic_performance,
        training_attendance,
        training_performance,
    )
    context = {
        "uid": student.uid,
        "department": student.department,
        "academic_year": student.academic_year,
        "full_name": student.user.full_name,
        "category": category,
        "batch": student.batch,
    }
    return render(request, "student/sdP.html", context)


def sdNC(request):
    context = {}
    return render(request, "student/sdNC.html", context)


def sdGO(request):
    context = {}
    return render(request, "student/sdGO.html", context)
