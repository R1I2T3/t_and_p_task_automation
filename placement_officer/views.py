from django.shortcuts import render, redirect
import json
from principal.views import (
    handle_uploaded_file,
    process_alumni_excel,
    JSON_FILE_PATH_ALUMNI,
    JSON_FILE_PATH_PLACEMENT,
    JSON_FILE_PATH_CONSENT_2022,
)
from principal.forms import UploadExcelForm


# Create your views here.
def index(request):
    if request.user.role != "placement_officer":
        return redirect("/")
    if request.method == "POST":
        if "file" in request.FILES:
            file_path = handle_uploaded_file(request.FILES["file"])
            # Process the Excel file (e.g., generate JSON)
            process_alumni_excel(file_path)
            return redirect("placements")
            # return render(request, "internship.html", {"success": "File uploaded and processed successfully!"})
        else:
            return render(request, "placements.html", {"error": "No file uploaded!"})
    else:
        form = UploadExcelForm()

    try:
        with open(JSON_FILE_PATH_ALUMNI, "r") as file:
            data = json.load(file)[0]
            consent_graph = data.get("Consent_graph")  # Extract only "Consent_graph"
            consent_counts_by_branch = data.get("consent_counts_by_branch")
            top_10_employers = data.get("top_10_employers")
            placement_distribution_by_branch = data.get(
                "placement_distribution_by_branch"
            )
            average_salary_by_branch = data.get("average_salary_by_branch")

        with open(JSON_FILE_PATH_PLACEMENT, "r") as file:
            placement_data = json.load(file)[0]
            Total_placements_comparison = placement_data.get(
                "Total_placements_comparison"
            )
            branch_comparison = placement_data.get("branch_comparison")
        consent_2022 = {}
        with open(JSON_FILE_PATH_CONSENT_2022, "r") as file:
            data = json.load(file)
            consent_2022["consent_graph_2022"] = data.get("Consent_graph")
            consent_2022["consent_counts_by_branch_2022"] = data.get(
                "consent_counts_by_branch"
            )
            print("consent_graph", consent_graph)
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
        "consent_2022": json.dumps(consent_2022),
    }
    return render(request, "placement_officer/index.html", context)
