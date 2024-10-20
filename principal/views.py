from django.shortcuts import render, redirect
import json
import os
from .forms import UploadExcelForm
import pandas as pd
from django.contrib.auth.decorators import login_required

INTERNSHIP_JSON_PATH = os.path.join("static", "Data", "intern_data_24.json")
JSON_FILE_PATH_ALUMNI = os.path.join("static", "Data", "alumni_data_2024.json")
JSON_FILE_PATH_PLACEMENT = os.path.join("static", "Data", "placement_data.json")
JSON_FILE_PATH_TRAINING = os.path.join("static", "Data", "training_data.json")
ALUMNI2023 = os.path.join("uploads", "alumni2023.xlsx")
JSON_FILE_PATH_CONSENT_2022 = os.path.join("static", "Data", "consent_graph_22.json")
INTERNSHIP_JSON_PATH_2022 = os.path.join("static", "Data", "intern_data_22.json")


def process_trainig_data(file_path):
    res = {}
    df = pd.read_excel(
        file_path, sheet_name="As per ISO", header=[1, 2, 3, 4, 5]
    )  # Read the excel file
    df.columns = flatten_columns(df.columns)
    cleaned_scores_aptitude = pd.to_numeric(
        df[
            "Academic (6)_Sem 5_ACT Aptitude Score                         (01/10/2022)             _Marks          Obtain"
        ],
        errors="coerce",
    ).dropna()
    res["cleaned_scores_aptitude"] = list(cleaned_scores_aptitude)
    cleaned_scores_technical = pd.to_numeric(
        df[
            "Academic (6)_Sem 5_ACT Technical Score                        (01/10/2022)                 _Marks Obtain"
        ],
        errors="coerce",
    ).dropna()
    res["cleaned_scores_technical"] = list(cleaned_scores_technical)
    avg_phase_1_present = df[
        "Academic (6)_Sem 5_ACT Phase-1 Attendance                                               _Total No Sessions Present (30)"
    ].mean()
    avg_phase_2_present = df[
        "Academic (6)_Sem 6_ACT Phase-2 Attendance                                     _Total No Sessions Present (20)"
    ].mean()
    phases = ["Phase-1", "Phase-2"]
    avg_attendance = [avg_phase_1_present, avg_phase_2_present]
    res["avg_attendance_phase_1_2"] = dict(zip(phases, avg_attendance))
    res["Coding Club Attendance"] = list(
        pd.to_numeric(
            df["Academic (6)_Sem 6_Coding Club_Attendance Percentage"]
        ).dropna()
    )

    res["mock_test_marks"] = list(
        df[
            "Academic (6)_Sem 6_ACT                     Mock Test Marks                                    "
        ].dropna()
    )
    intern_data = pd.DataFrame([res])  # Convert the dict to a pandas DataFrame
    intern_data.to_json(JSON_FILE_PATH_TRAINING, orient="records", indent=4)
    return res


@login_required
def TnPStats(request):
    if request.user.role != "principal":
        return redirect("/")
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

    return render(request, "principal/index.html", context)


def flatten_columns(columns):
    flat_columns = []
    for col in columns:
        flat_columns.append("_".join([str(c) for c in col if "Unnamed" not in str(c)]))
    return flat_columns


def handle_uploaded_file(f):
    upload_dir = "uploads"
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)

    file_path = os.path.join(upload_dir, f.name)
    with open(file_path, "wb+") as destination:
        for chunk in f.chunks():
            destination.write(chunk)
    return file_path


def process_internship_excel(file_path):
    df = pd.read_excel(file_path, sheet_name="Register", header=[5])

    res = {}

    branch_counts = df["Branch"].value_counts()
    res["branch_data"] = dict(branch_counts)

    df["No. of offers"] = pd.to_numeric(df["No. of offers"], errors="coerce").fillna(0)

    company_offers = df.groupby("Name of Company")["No. of offers"].sum()

    company_offers = company_offers.sort_values(ascending=False).head(10)
    res["Compqnies_Offering_Internship"] = dict(company_offers)

    df["Stipend"] = pd.to_numeric(df["Stipend"], errors="coerce").fillna(0)

    res["stipend_data"] = dict(df["Stipend"].sort_values(ascending=False).head(10))

    stipend_per_branch = df.groupby("Branch")["Stipend"].sum()
    res["stipend_per_branch"] = dict(stipend_per_branch)

    intern_data = pd.DataFrame([res])  # Convert the dict to a pandas DataFrame

    intern_data.to_json(INTERNSHIP_JSON_PATH, orient="records", indent=4)

    return redirect


@login_required
def internship(request):
    if request.user.role != "principal":
        return redirect("/")
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
    return render(request, "principal/internship.html", context)


@login_required
def internship_2022(request):
    if request.user.role != "principal":
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
    return render(request, "principal/internship_2022.html", context)


def process_alumni_excel(file_path):
    df = pd.read_excel(file_path, sheet_name="Updated", header=[4, 5])
    df_2023 = pd.read_excel(ALUMNI2023)
    df.columns = flatten_columns(df.columns)
    total_placements_2023 = df_2023["Name of the Employer"].notnull().sum()
    total_placements_2024 = df["Name of the Employer"].notnull().sum()
    res = {}
    res["Total_placements_comparison"] = {
        "Total_placements_2023": total_placements_2023,
        "Total_placements_2024": total_placements_2024,
    }
    branch_placements_2023 = df_2023.groupby("BRANCH           /DIV")[
        "Name of the Employer"
    ].count()
    branch_placements_2024 = df.groupby("BRANCH/DIV")["Name of the Employer"].count()

    branch_comparison_df = pd.DataFrame(
        {"2023": branch_placements_2023, "2024": branch_placements_2024}
    ).fillna(0)

    res["branch_comparison"] = branch_comparison_df.to_dict()

    placement_data = pd.DataFrame([res])  # Convert the dict to a pandas DataFrame

    # Save as JSON
    placement_data.to_json(JSON_FILE_PATH_PLACEMENT, orient="records", indent=4)

    print("placement_data.json file genrated")
    res1 = res
    # return res
    # //////////////////////////////////////////////////////////////
    res = {}

    res["Consent_graph"] = dict(df["Consent"].value_counts())

    res["consent_counts_by_branch"] = dict(df.groupby(["BRANCH/DIV", "Consent"]).size())

    employer_counts = df["Name of the Employer"].value_counts()
    top_10_employers = employer_counts.head(10)
    res["top_10_employers"] = dict(top_10_employers)

    placed_students = df[
        df["Name of the Employer"].notnull()
        & df["Appointment Ref No. _Salary"].notnull()
    ]

    placement_distribution = dict(placed_students.groupby("BRANCH/DIV").size())
    res["placement_distribution_by_branch"] = dict(placement_distribution)

    df["Appointment Ref No._Salary"] = pd.to_numeric(
        df["Appointment Ref No. _Salary"], errors="coerce"
    )
    placed_students = df.dropna(
        subset=["Name of the Employer", "Appointment Ref No._Salary"]
    )
    average_salary_by_branch = (
        placed_students.groupby("BRANCH/DIV")["Appointment Ref No._Salary"]
        .mean()
        .astype(float)
    )
    res["average_salary_by_branch"] = dict(average_salary_by_branch)

    # with open('alumni_data_2024.json', 'w') as json_file:

    alumni_data_2024 = pd.DataFrame([res])  # Convert the dict to a pandas DataFrame

    # Save as JSON
    alumni_data_2024.to_json(JSON_FILE_PATH_ALUMNI, orient="records", indent=4)

    print("alumni_data_2024.json file genrated")
    return [res1, res]


@login_required
def placement(request):
    if request.user.role != "principal":
        return redirect("/")
    try:
        consent_2022 = {}
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
    }  # Pass only the "Consent_graph" data

    return render(request, "principal/placements.html", context)


@login_required
def training2023(request):
    if request.user.role != "principal":
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

    return render(request, "principal/training2023.html", context)
