from django.shortcuts import render,redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .utils import validate_file,importExcelAndReturnJSON
from student.models import Student,AcademicAttendanceSemester,AcademicPerformanceSemester
@login_required
def index(request):
    print(request.user)
    student=Student.objects.get(uid='22-ITA50-26')
    print(AcademicPerformanceSemester.objects.get(student=student).performance)
    return render(request, "department_coordinator/index.html")
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
                if request.POST['attendanceFile'] == "excel":
                    if not validate_file(request.FILES.get('file_attendance')):
                        messages.error(request, "Invalid file type")
                    df=importExcelAndReturnJSON(request.FILES.get('file_attendance'))
                    for i in df:
                        student=Student.objects.get(uid=i['uid'])
                        AcademicAttendanceSemester.objects.create(student=student,attendance=i['attendance'],semester=i['semester'])
                    messages.success(request, "Data imported successfully")
                elif request.POST['attendanceFile'] == "pdf":
                    print("This is pdf file")
                else:
                    messages.error(request, "Invalid file type")
            else:
                if request.POST['marksFile'] == "excel":
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
