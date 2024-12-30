def is_student_eligible(criteria, student):
    if (
        criteria.min_tenth_marks
        and (student.tenth_marks or 0) < criteria.min_tenth_marks
    ):
        return False
    if (
        criteria.min_higher_secondary_marks
        and (student.higher_secondary_marks or 0) < criteria.min_higher_secondary_marks
    ):
        return False
    if criteria.min_cgpa and criteria.min_cgpa > student.cgpa:
        return False
    if criteria.min_attendance and criteria.min_attendance > student.attendance:
        return False

    # Boolean checks
    if criteria.is_kt is not None and criteria.is_kt != student.is_kt:

        return False
    if criteria.is_backLog is not None and criteria.is_backLog != student.is_backLog:
        return False

    # Domain and department check
    if criteria.domain and criteria.domain.lower() != student.domain.lower():
        return False
    if (
        criteria.Departments
        and criteria.Departments != "all"
        and student.domain not in criteria.Departments.split(",")
    ):
        return False

    return True
