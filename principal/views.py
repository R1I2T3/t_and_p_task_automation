from django.shortcuts import render
import json


# Create your views here.
def TnPStats(request):
    return render(request, "principal/index.html")


def login(request):
    return render(request, "principal/login.html")


def internship(request):
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


# def login(request):
#     template = loader.get_template("login.html")
#     return HttpResponse(template.render())
