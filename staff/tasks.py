import io
import zipfile
import openpyxl
from celery import shared_task
from django.core.files.base import ContentFile
from django.template.loader import render_to_string
from django.utils.text import slugify
from django.shortcuts import get_object_or_404
from django.core.files.storage import default_storage
from weasyprint import HTML
from .models import CompanyRegistration
from student.models import StudentPlacementAppliedCompany

@shared_task
def generate_excel_export_task(company_id):
    company = get_object_or_404(CompanyRegistration, id=company_id)

    applications = StudentPlacementAppliedCompany.objects.filter(
        company=company, interested=True
    ).select_related('student__department')

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Registered Students"
    columns = [
        'UID', 'First Name', 'Last Name', 'Personal Email', 'Contact',
        'Department', '10th Grade %', '12th Grade %', 'CGPA',
        'Active KT', 'DSE Student'
    ]
    ws.append(columns)

    for app in applications:
        student = app.student
        row = [
            student.uid, student.first_name, student.last_name,
            student.personal_email, student.contact,
            student.department.name if student.department else 'N/A',
            student.tenth_grade, student.higher_secondary_grade,
            student.cgpa, "Yes" if student.is_kt else "No",
            "Yes" if student.is_dse_student else "No",
        ]
        ws.append(row)
    buffer = io.BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    filename = f"exports/excel/{slugify(company.name)}_students.xlsx"
    file_path = default_storage.save(filename, ContentFile(buffer.read()))
    return {"file_url": default_storage.url(file_path)}


@shared_task
def generate_resume_zip_task(company_id):
    company = get_object_or_404(CompanyRegistration, id=company_id)

    applications = StudentPlacementAppliedCompany.objects.filter(
        company=company, interested=True
    ).select_related(
        'student__resume'
    ).prefetch_related(
        'student__resume__contacts', 'student__resume__skills',
        'student__resume__work_experiences', 'student__resume__projects',
        'student__resume__educations',
    )

    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
        for app in applications:
            student = app.student
            if not hasattr(student, 'resume'):
                continue

            resume = student.resume
            context = {
                'student': student, 'resume': resume,
                'contacts': resume.contacts.all(), 'skills': resume.skills.all(),
                'work_exps': resume.work_experiences.all(), 'projects': resume.projects.all(),
                'education': resume.educations.all(),
            }
            html_string = render_to_string('resumes/resume_template.html', context)
            pdf_file = HTML(string=html_string).write_pdf()
            filename = f"{student.uid}_{student.first_name}.pdf"
            zf.writestr(filename, pdf_file)

    zip_buffer.seek(0)
    filename = f"exports/resumes/{slugify(company.name)}_resumes.zip"
    file_path = default_storage.save(filename, ContentFile(zip_buffer.read()))
    return {"file_url": default_storage.url(file_path)}