from django.shortcuts import render, redirect
from principal.views import handle_uploaded_file
from principal.views import process_trainig_data, JSON_FILE_PATH_TRAINING
from principal.forms import UploadExcelForm
import json
from django.contrib.auth.decorators import login_required


# Create your views here.
@login_required
def TnPStats(request):
    if request.user.role != "training_officer":
        return redirect("/")
    if request.method == "POST":
        if "file" in request.FILES:
            file_path = handle_uploaded_file(request.FILES["file"])
            process_trainig_data(file_path)
            return redirect("/principal/")
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
