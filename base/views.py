from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login as login_user
from django.contrib import messages
from base.models import User
# Create your views here.


def login(request):
    if request.method == "POST":
        email = request.POST["email"]
        password = request.POST["password"]
        user = authenticate(request, email=email, password=password)
        if user is not None:
            # If user is authenticated, log them in
            login_user(request, user)
            user = User.objects.get(email=user.email)
            print(user.role)
            if user.role == "principal":
                return redirect("/principal/")
            elif user.role == "department_coordinator":
                return redirect("/department_coordinator/")
            elif user.role == "program_coordinator":
                return redirect("/program_coordinator/")
            elif user.role == "student":
                return redirect("/student/")
            elif user.role == "training_officer":
                return redirect("/training_officer/")
            return redirect("/")
        else:
            # Invalid credentials
            messages.error(request, "Invalid email or password.")
    return render(request, "base/login.html")
