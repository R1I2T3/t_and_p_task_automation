from django.db import models


# Model to store attendance data for a student
class AttendanceData(models.Model):
    batch = models.CharField(max_length=100)
    late = models.IntegerField()
    name = models.CharField(max_length=100)
    present = models.IntegerField()
    program_name = models.CharField(max_length=100)
    session = models.CharField(max_length=100)
    timestamp = models.DateTimeField()
    uid = models.CharField(max_length=100)
    year = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.batch} - {self.session}"


# Model to store the overall attendance statistics for a batch/session
class BatchAttendance(models.Model):
    batch = models.CharField(max_length=100)
    session = models.CharField(max_length=100)
    total_students = models.IntegerField()
    total_present = models.IntegerField()
    total_absent = models.IntegerField()
    total_late = models.IntegerField()
    program_name = models.CharField(max_length=100)
    year = models.CharField(max_length=100)

    class Meta:
        unique_together = (
            "batch",
            "session",
            "program_name",
            "year",
        )  # To handle duplicate entries

    def __str__(self):
        return f"{self.batch} - {self.session} - {self.program_name}"


# Model to store attendance and performance data for a program/branch/division
class Program1(models.Model):
    Branch_Div = models.CharField(max_length=100)
    Year = models.IntegerField()
    training_attendance = models.FloatField()
    training_performance = models.FloatField()

    def __str__(self):
        return self.Branch_Div


# Revised model to store simple attendance records (student presence/absence) for a session
class SimpleAttendanceData(models.Model):
    uid = models.IntegerField()
    name = models.CharField(max_length=255)
    batch = models.CharField(max_length=255)
    session = models.CharField(max_length=255)
    present = models.CharField(max_length=10)  # 'Present' or 'Absent'

    def __str__(self):
        return f"{self.uid} - {self.name}"


# Model to store comprehensive attendance record for a program/year, including multiple sessions
class AttendanceRecord(models.Model):
    program_name = models.CharField(max_length=100)
    year = models.CharField(max_length=10)
    num_sessions = models.IntegerField()
    num_days = models.IntegerField()
    dates = models.JSONField()  # Stores a list of dates
    file_headers = models.JSONField(default=list)  # Default empty list
    student_data = models.JSONField(default=list)  # Default empty list

    def __str__(self):
        return f"Attendance record for {self.program_name} - {self.year}"
