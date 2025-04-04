import numpy as np


def categorize(
    academic_attendance, academic_performance, training_attendance, training_performance
):
    # Check for null values (None or NaN)
    if (
        academic_attendance is None
        or academic_performance is None
        or training_attendance is None
        or training_performance is None
        or np.isnan(academic_attendance)
        or np.isnan(academic_performance)
        or np.isnan(training_attendance)
        or np.isnan(training_performance)
    ):
        return "Category_NA"  # Category for null values

    # Category assignments
    if (
        academic_performance >= 7.84
        and academic_attendance >= 75
        and training_attendance >= 75
        and training_performance >= 75
    ):
        return "Category_1"
    elif (
        academic_performance >= 6.77
        and academic_attendance >= 75
        and training_attendance >= 65
        and training_performance >= 65
    ):
        return "Category_2"
    elif (
        academic_performance < 6.77
        and academic_attendance >= 75
        and training_attendance < 65
        and training_performance < 65
    ):
        return "Category_3"
    else:
        return "Category_4"
