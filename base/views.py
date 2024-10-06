from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login as login_user
from django.contrib import messages
from base.models import User, UserDevice
import uuid
import pyotp
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.core.mail import send_mail
from django.conf import settings


def send_otp(email, otp):
    subject = "Your OTP for Login"
    html_message = render_to_string("emails/otp.html", {"otp": otp})
    plain_message = strip_tags(html_message)
    from_email = settings.DEFAULT_FROM_EMAIL
    to = email
    try:
        send_mail(
            subject,
            plain_message,
            from_email,
            [to],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Failed to send OTP: {str(e)}")
        return False


def redirect_user(request, user):
    login_user(request, user)
    user = User.objects.get(email=user.email)
    if user.role == "principal":
        response = redirect("/principal/")
    elif user.role == "department_coordinator":
        response = redirect("/department_coordinator/")
    elif user.role == "program_coordinator":
        response = redirect("/program_coordinator/")
    elif user.role == "student":
        response = redirect("/student/")
    elif user.role == "training_officer":
        response = redirect("/training_officer/")
    else:
        response = redirect("/")
    return response


# Create your views here.


def login(request):
    if request.method == "POST":
        email = request.POST["email"]
        password = request.POST["password"]
        user = authenticate(request, email=email, password=password)
        if user is not None:
            device_id = request.COOKIES.get("device_id")
            if not device_id:
                device_id = str(uuid.uuid4())
            device, created = UserDevice.objects.get_or_create(
                user=user, device_id=device_id
            )
            if not device.is_verified:
                totp = pyotp.TOTP(pyotp.random_base32())
                otp = totp.now()
                send_otp(user.email, otp)
                request.session["otp_secret"] = totp.secret
                request.session["user_id"] = str(user.pk)
                print(type(device.device_id))
                request.session["device_id"] = str(device.device_id)
                return redirect("verify_otp")
            else:
                response = redirect_user(request, user)
                return response
        else:
            # Invalid credentials
            messages.error(request, "Invalid email or password.")
    return render(request, "base/login.html")


def verify_otp(request):
    if request.method == "POST":
        otp = request.POST["otp"]
        otp_secret = request.session.get("otp_secret")
        user_id = request.session.get("user_id")
        device_id = request.session.get("device_id")
        if otp_secret and user_id and device_id:
            totp = pyotp.TOTP(otp_secret)
            if totp.verify(otp):
                user = User.objects.get(id=user_id)
                device = UserDevice.objects.get(user=user, device_id=device_id)
                device.is_verified = True
                device.save()
                response = redirect_user(request, user)
                response.set_cookie("device_id", device_id)
                return response
            else:
                messages.error(request, "Invalid otp")
    return render(request, "base/verify_otp.html")
