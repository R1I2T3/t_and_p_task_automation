from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login as login_user
from django.contrib import messages
from base.models import User, UserDevice, PasswordResetOTP
import uuid
import pyotp
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.hashers import make_password


def send_otp(email, otp, subject="OTP Verification"):
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
                print("I am here")
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


def password_reset_request(request):
    if request.method == "POST":
        email = request.POST.get("email")
        try:
            user = User.objects.get(email=email)
            otp_obj = PasswordResetOTP.generate_otp_secret(user)
            totp = pyotp.TOTP(otp_obj.otp_secret, interval=600)
            otp = totp.now()
            send_otp(user.email, otp, subject="Password Reset OTP")
            request.session["email"] = email
            messages.success(request, "An OTP has been sent to your email.")
            return redirect("password_reset_verify_otp")
        except User.DoesNotExist:
            messages.error(request, "No user found with this email address.")

    return render(request, "base/password_reset_request.html")


def password_reset_verify_otp(request):
    if request.method == "POST":
        email = request.session.get("email")
        otp = request.POST.get("otp")
        try:
            user = User.objects.get(email=email)
            otp_obj = PasswordResetOTP.objects.filter(user=user).latest("created_at")
            if otp_obj.verify_otp(otp):
                request.session["reset_user_id"] = str(user.id)
                return redirect("password_reset_confirm")
            else:
                messages.error(request, "Invalid or expired OTP.")
        except (User.DoesNotExist, PasswordResetOTP.DoesNotExist):
            messages.error(request, "Invalid email or OTP.")
    return render(request, "base/password_reset_verify_otp.html")


def password_reset_confirm(request):
    user_id = request.session.get("reset_user_id")
    if not user_id:
        return redirect("password_reset_request")
    user = User.objects.get(id=user_id)
    if request.method == "POST":
        password = request.POST.get("password")
        confirm_password = request.POST.get("confirm_password")
        if password == confirm_password:
            user.set_password(password)
            user.save()
            del request.session["reset_user_id"]
            PasswordResetOTP.objects.filter(user=user).delete()
            messages.success(request, "Your password has been reset successfully.")
            return redirect("login")
        else:
            messages.error(request, "Passwords do not match.")
    return render(request, "base/password_reset_confirm.html")
