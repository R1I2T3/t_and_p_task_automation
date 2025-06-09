from django.urls import path
from . import views

urlpatterns = [
    path("consent/<str:year>/", views.statistic, name="statistic_by_year"),
    path("consent/", views.statistic, name="statistic"),
    path(
        "filter/<str:department>/<str:year>/",
        views.filter_by_department,
        name="filter_by_department_by_year",
    ),
    path(
        "filter/<str:department>/",
        views.filter_by_department,
        name="filter_by_department",
    ),
    path(
        "unique-departments/<str:year>/",
        views.get_unique_departments,
        name="unique_departments_by_year",
    ),
    path(
        "unique-departments/", views.get_unique_departments, name="unique_departments"
    ),
    path(
        "get_category_data/<str:year>/",
        views.get_category,
        name="get_category_data_by_year",
    ),
    path("get_category_data/", views.get_category, name="get_category_data"),
    path(
        "get_category_data_by_department/<str:department>/<str:year>/",
        views.get_category_by_department,
        name="get_category_data_by_department_by_year",
    ),
    path(
        "get_category_data_by_department/<str:department>/",
        views.get_category_by_department,
        name="get_category_data_by_department",
    ),
    path(
        "get_top_companies_with_offers/<int:year>/",
        views.get_top_companies_with_offers,
        name="get_top_companies_with_offers_by_year",
    ),
    path(
        "get_top_companies_with_offers/",
        views.get_top_companies_with_offers,
        name="get_top_companies_with_offers",
    ),
    path("get_all_companies/", views.get_all_companies, name="get_all_companies"),
    path(
        "get_offers_by_department/<str:department>/<int:year>/",
        views.get_offers_by_department,
        name="get_offers_by_department_by_year",
    ),
    path(
        "get_offers_by_department/<str:department>/",
        views.get_offers_by_department,
        name="get_offers_by_department",
    ),
    path("consolidated/", views.consolidated, name="consolidated"),
    path("calculate_category/", views.calculateCategory, name="calculate_category"),
    path('category-rules/create/', views.create_category_rule, name='create-category-rule'),
    path('category-rules/list/', views.list_category_rules, name='list-category-rules'),
    path('students/by-category/<str:category>/<str:batch>/', views.students_by_category, name='students_by_category'),
]
