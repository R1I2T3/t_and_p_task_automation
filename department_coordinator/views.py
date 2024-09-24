from django.shortcuts import render

# Create your views here.

def index(request):
    return render(request, "department_coordinator/index.html")

def stats(request):
    return render(request, "department_coordinator/stats.html")

def attendance(request):
    return render(request, "department_coordinator/attendance.html")