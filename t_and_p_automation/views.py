from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from base.views import redirect_user


@login_required
def index(request):
    response = redirect_user(request, request.user)
    return response
