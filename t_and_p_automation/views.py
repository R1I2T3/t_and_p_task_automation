from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from base.views import redirect_user
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt


@login_required
def index(request):
    response = redirect_user(request, request.user)
    return response


@api_view(["GET"])
def my_protected_view(request):
    user = request.user
    return Response({"message": f"Hello, {user.email}"})
