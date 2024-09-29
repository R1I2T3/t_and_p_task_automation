import csv
# from openpyxl import load_workbook
import pandas as pd

ALLOWED_EXTENSIONS = {"csv","pdf"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def validate_file(file):
    filename = file.name
    file_extension = filename.rsplit(".", 1)[1].lower()
    return True if file_extension == "csv" else False


def importExcelAndReturnJSON(file):
    df = pd.read_csv(file)
    ld = len(df)
    require_data = []
    for i in range(ld):
        require_data.append(df.iloc[i].to_dict())
    return require_data

def importPDFAndReturnJSON(file):
    pass