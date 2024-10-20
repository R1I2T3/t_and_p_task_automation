from django.shortcuts import render, redirect
from principal.views import handle_uploaded_file
from principal.views import process_trainig_data, JSON_FILE_PATH_TRAINING
from principal.forms import UploadExcelForm
import json
from django.contrib.auth.decorators import login_required
import os


# Create your views here.
@login_required
def TnPStats(request):
    if request.user.role != "training_officer":
        return redirect("/")
    if request.method == "POST":
        if "file" in request.FILES:
            file_path = handle_uploaded_file(request.FILES["file"])
            process_trainig_data(file_path)
            return redirect("/training_officer")
        else:
            return render(request, "internship.html", {"error": "No file uploaded!"})
    else:
        form = UploadExcelForm()
    try:
        with open(JSON_FILE_PATH_TRAINING, "r") as file:
            data = json.load(file)[0]
            avg_attendance_phase_1_2 = data.get("avg_attendance_phase_1_2")
            cleaned_scores_technical = data.get("cleaned_scores_technical")
            mock_test_marks = data.get("mock_test_marks")
    except FileNotFoundError:
        avg_attendance_phase_1_2 = {}

    context = {
        "avg_attendance_phase_1_2": json.dumps(avg_attendance_phase_1_2),
        "cleaned_scores_technical": json.dumps(cleaned_scores_technical),
        "mock_test_marks": json.dumps(mock_test_marks),
    }

    return render(request, "training_officer/index.html", context)


@login_required
def training2023(request):
    if request.user.role != "training_officer":
        return redirect("/")
    try:
        with open(os.path.join("static", "Data", "data_2023.json"), "r") as file:
            data = json.load(file)[0]
            avg_attendance_phase1 = data.get("avg_attendance_phase1", 0)
            avg_attendance_phase2 = data.get("avg_attendance_phase2", 0)
            mock_test_marks = data.get("Mock Test Marks", [])
            Technical_Score = data.get("Technical_Score", [])
    except FileNotFoundError:
        avg_attendance_phase1 = avg_attendance_phase2 = 0
        mock_test_marks = []
        Technical_Score = []

    context = {
        "avg_attendance_phase1": json.dumps(avg_attendance_phase1),
        "avg_attendance_phase2": json.dumps(avg_attendance_phase2),
        "mock_test_marks": json.dumps(mock_test_marks),
        "Technical_Score": json.dumps(Technical_Score),
    }

    return render(request, "training_officer/training2023.html", context)
