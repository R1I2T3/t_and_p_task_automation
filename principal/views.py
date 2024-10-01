from django.shortcuts import render, redirect
import json
from django.contrib.auth.decorators import login_required
import os
from django.conf import settings

# Create your views here.
@login_required
def TnPStats(request):
    if request.user.role != "principal":
        return redirect("/")
    filePath = os.path.join(settings.BASE_DIR, "static/Data/training_data.json")
    try:
        with open(filePath, "r") as file:
            data = json.load(file)
            Student_consent_for_Trainning_Institute = data.get(
                "Student_consent_for_Trainning_Institute",
            )
            Test_score = data.get("Test_score", {})
    except Exception as e:
        print(f"Error reading JSON file: {e}")
        Student_consent_for_Trainning_Institute = {}
        Test_score = {}

    context = {
        "Student_consent_for_Trainning_Institute": json.dumps(
            Student_consent_for_Trainning_Institute
        ),
        "Test_score": json.dumps(Test_score),
    }

    return render(request, "principal/index.html", context)



@login_required
def internship(request):
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

@login_required
def placement(request):
    if request.user.role != "principal":
        return redirect("/")
    json_file_path = os.path.join(settings.BASE_DIR, "static/Data/alumni_data_2024.json")
    json_file_path_placement = os.path.join(settings.BASE_DIR, "static/Data/placement_data.json")
    try:
        with open(json_file_path, "r") as file:
            data = json.load(file)
            consent_graph = data.get("Consent_graph")  # Extract only "Consent_graph"
            consent_counts_by_branch = data.get("consent_counts_by_branch")
            print(consent_counts_by_branch)
            top_10_employers = data.get("top_10_employers")
            placement_distribution_by_branch = data.get(
                "placement_distribution_by_branch"
            )
            average_salary_by_branch = data.get("average_salary_by_branch")

        with open(json_file_path_placement, "r") as file:
            placement_data = json.load(file)
            Total_placements_comparison = placement_data.get(
                "Total_placements_comparison"
            )
            branch_comparison = placement_data.get("branch_comparison")

    except Exception as e:
        print(f"Error reading JSON file: {e}")
        consent_graph = {}

    context = {
        "consent_graph": json.dumps(consent_graph),
        "consent_counts_by_branch": json.dumps(consent_counts_by_branch),
        "top_10_employers": json.dumps(top_10_employers),
        "placement_distribution_by_branch": json.dumps(
            placement_distribution_by_branch
        ),
        "average_salary_by_branch": json.dumps(average_salary_by_branch),
        "Total_placements_comparison": json.dumps(Total_placements_comparison),
        "branch_comparison": json.dumps(branch_comparison),
    }  

    return render(request, "principal/placement.html", context)
