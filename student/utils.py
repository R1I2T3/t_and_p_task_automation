import numpy as np


def categorize(
    academic_attendance,
    academic_performance,
    training_attendance,
    training_performance,
    batch,
):
    from placement_officer.models import CategoryRule

    if any(
        x is None or np.isnan(x)
        for x in [
            academic_attendance,
            academic_performance,
            training_attendance,
            training_performance,
        ]
    ):
        return "Category_NA"

    # Get all rules for the batch, ordered by category
    rules = CategoryRule.objects.filter(batch=batch).order_by("category")

    # Check each category rule in order
    for rule in rules:
        if (
            academic_attendance >= rule.minimum_academic_attendance
            and academic_performance >= rule.minimum_academic_performance
            and training_attendance >= rule.minimum_training_attendance
            and training_performance >= rule.minimum_training_performance
        ):
            return rule.category

    # If no rules match, return the lowest category
    return "Category_4"
