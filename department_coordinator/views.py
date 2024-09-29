from django.shortcuts import render,redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .utils import validate_file,importExcelAndReturnJSON
from student.models import Student,AcademicAttendanceSemester,AcademicPerformanceSemester
from .models import DepartmentCoordinator
@login_required
def index(request):
    if request.user.role != "department_coordinator":
        return redirect("/")
    department_coordinator=DepartmentCoordinator.objects.get(user=request.user)
    students=Student.objects.select_related('user').all()
    context={}
    context['total_students'] = len(students)
    context['fe_count'] = len(students.filter(academic_year="FE"))
    context['te_count'] = len(students.filter(academic_year="TE"))
    context['be_count'] = len(students.filter(academic_year="BE"))
    context['se_count'] = len(students.filter(academic_year="SE"))
    context['department_students'] = students.filter(department=department_coordinator.department)
    print(context['department_students'])
    return render(request, "department_coordinator/index.html",context)
@login_required
def stats(request):
    return render(request, "department_coordinator/stats.html")



@login_required
def attendance(request):
    if request.user.role != "department_coordinator":
        return redirect("/")
    if request.method == "POST":
        try:
            if request.POST.get('formType')=="attendanceForm":
                if not validate_file(request.FILES.get('file_attendance')):
                    messages.error(request, "Invalid file type")
                df=importExcelAndReturnJSON(request.FILES.get('file_attendance'))
                for i in df:
                    student=Student.objects.get(uid=i['uid'])
                    AcademicAttendanceSemester.objects.create(student=student,attendance=i['attendance'],semester=i['semester'])
                messages.success(request, "Data imported successfully")
            else:
                if not validate_file(request.FILES.get('file_performance')):
                    messages.error(request, "Invalid file type")
                    return render(request, "department_coordinator/attendance.html")
                df=importExcelAndReturnJSON(request.FILES.get('file_performance'))
                for i in df:
                    student=Student.objects.get(uid=i['uid'])
                    AcademicPerformanceSemester.objects.create(student=student,performance=i['performance'],semester=i['semester'])
                messages.success(request, "Data imported successfully")
        except Exception as e:
            print(e)
            messages.error(request, "Something went wrong")
    return render(request, "department_coordinator/attendance.html")
