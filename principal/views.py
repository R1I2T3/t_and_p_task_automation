from django.shortcuts import render, redirect
import json
from django.contrib.auth.decorators import login_required


# Create your views here.
@login_required
def TnPStats(request):
    if request.user.role != "principal":
        return redirect("/")
    return render(request, "principal/index.html")


@login_required
def internship(request):
    # print(request.user.role)
    if request.user.role != "principal":
        return redirect("/")
    branch_data = {
        "fields": [
            {"label": "Computer Science", "value": 45},
            {"label": "Information Technology", "value": 45},
            {"label": "AI/ML", "value": 10},
        ],
    }

    stipend_data = {
        "fields": [
            {"label": ">Rs 5000", "value": 40},
            {"label": ">Rs 2500", "value": 50},
            {"label": ">Rs 10000", "value": 10},
        ],
    }

    students_securing_internship_data = {
        "fields": [
            {"label": "2022", "value": 40},
            {"label": "2023", "value": 50},
            {"label": "2024", "value": 10},
        ],
    }

    internship_opportunities_data = {
        "fields": [
            {"label": "SWE", "value": 15},
            {"label": "App Developer", "value": 60},
            {"label": "SQL", "value": 25},
        ],
    }

    internship_bar_labels = ["Facebook", "Amazon", "Netflix", "Google"]

    context = {
        "branch_data": json.dumps(branch_data),
        "stipend_data": json.dumps(stipend_data),
        "students_securing_internship_data": json.dumps(
            students_securing_internship_data
        ),
        "internship_opportunities_data": json.dumps(internship_opportunities_data),
        "internship_bar_labels": json.dumps(internship_bar_labels),
    }
    return render(request, "principal/internship.html", context)
