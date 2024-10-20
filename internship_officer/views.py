from django.shortcuts import render, redirect
from principal.views import handle_uploaded_file
from principal.views import (
    process_internship_excel,
    INTERNSHIP_JSON_PATH,
    INTERNSHIP_JSON_PATH_2022,
)
import json
from principal.forms import UploadExcelForm
from django.contrib.auth.decorators import login_required


@login_required
def internship(request):
    if request.user.role != "internship_officer":
        return redirect("/")
    if request.method == "POST":
        if "file" in request.FILES:
            file_path = handle_uploaded_file(request.FILES["file"])
            process_internship_excel(file_path)
            return redirect("/internship_officer/")
        else:
            return render(request, "index.html", {"error": "No file uploaded!"})
    else:
        form = UploadExcelForm()
    try:
        with open(INTERNSHIP_JSON_PATH, "r") as file:
            data = json.load(file)
    except FileNotFoundError:
        data = {
            "branch_data": {},
            "stipend_data": {},
            "Compqnies_Offering_Internship": {},
        }

    branch_data = [
        {"label": branch, "value": value}
        for branch, value in data[0]["branch_data"].items()  # type: ignore
    ]

    # Extracting stipend data and calculating total stipend
    stipend_amounts = list(data[0]["stipend_data"].values())
    total_stipend = sum(stipend_amounts)

    # Calculate the percentage of each stipend
    stipend_data = [
        {"label": f"Rs {amount}", "value": (amount / total_stipend) * 100}
        for value, amount in data[0]["stipend_data"].items()
    ]

    # Students securing internship data - Placeholder
    students_securing_internship_data = [
        {
            "label": "Internships Secured",
            "value": sum(data[0]["Compqnies_Offering_Internship"].values()),
        }
    ]
    stipend_per_branch_data = [
        {"label": branch, "value": amount}
        for branch, amount in data[0]["stipend_per_branch"].items()
    ]
    # Internship opportunities data
    internship_opportunities_data = [
        {"label": company, "value": count}
        for company, count in data[0]["Compqnies_Offering_Internship"].items()
    ]

    # Prepare internship bar labels
    internship_bar_labels = list(data[0]["Compqnies_Offering_Internship"].keys())
    internship_bar_data = list(data[0]["Compqnies_Offering_Internship"].values())
    context = {
        "branch_data": json.dumps({"fields": branch_data}),
        "stipend_data": json.dumps({"fields": stipend_data}),
        "students_securing_internship_data": json.dumps(
            {"fields": students_securing_internship_data}
        ),
        "stipend_per_branch": json.dumps({"fields": stipend_per_branch_data}),
        "internship_opportunities_data": json.dumps(
            {"fields": internship_opportunities_data}
        ),
        "internship_bar_labels": json.dumps(internship_bar_labels),
        "internship_bar_data": json.dumps(internship_bar_data),
    }
    return render(request, "internship_officer/index.html", context)


@login_required
def internship_2022(request):
    if request.user.role != "internship_officer":
        return redirect("/")
    try:
        with open(INTERNSHIP_JSON_PATH_2022, "r") as file:
            data = json.load(file)
    except FileNotFoundError:
        data = {
            "branch_data": {},
            "stipend_data": {},
            "Compqnies_Offering_Internship": {},
        }
    print(data)
    branch_data = [
        {"label": branch, "value": value}
        for branch, value in data[0]["branch_data"].items()  # type: ignore
    ]
    stipend_amounts = list(data[0]["stipend_per_branch"].values())
    total_stipend = sum(stipend_amounts)

    # Calculate the percentage of each stipend
    stipend_data = [
        {"label": f"Rs {amount}", "value": (amount / total_stipend) * 100}
        for value, amount in data[0]["stipend_per_branch"].items()
    ]

    # Students securing internship data - Placeholder
    students_securing_internship_data = [
        {
            "label": "Internships Secured",
            "value": sum(data[0]["Companies_Offering_Internship"].values()),
        }
    ]
    stipend_per_branch_data = [
        {"label": branch, "value": amount}
        for branch, amount in data[0]["stipend_per_branch"].items()
    ]
    # Internship opportunities data
    internship_opportunities_data = [
        {"label": company, "value": count}
        for company, count in data[0]["Companies_Offering_Internship"].items()
    ]

    # Prepare internship bar labels
    internship_bar_labels = list(data[0]["Companies_Offering_Internship"].keys())
    internship_bar_data = list(data[0]["Companies_Offering_Internship"].values())

    # Create the context dictionary
    context = {
        "branch_data": json.dumps({"fields": branch_data}),
        "stipend_data": json.dumps({"fields": stipend_data}),
        "students_securing_internship_data": json.dumps(
            {"fields": students_securing_internship_data}
        ),
        "stipend_per_branch": json.dumps({"fields": stipend_per_branch_data}),
        "internship_opportunities_data": json.dumps(
            {"fields": internship_opportunities_data}
        ),
        "internship_bar_labels": json.dumps(internship_bar_labels),
        "internship_bar_data": json.dumps(internship_bar_data),
    }
    return render(request, "internship_officer/internship_2022.html", context)
