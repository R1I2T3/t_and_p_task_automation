from celery import shared_task
from django.core.mail import EmailMessage
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from .models import Notification
import logging
import os

logger = logging.getLogger(__name__)


@shared_task
def send_notification_email(notification_id):
    """
    Send email notifications to all recipients of a notification.
    This task is triggered when a new notification is created.
    Supports file attachments.
    """
    try:
        # Get the notification
        notification = Notification.objects.prefetch_related('recipients').get(id=notification_id)
        
        # Get all recipients
        recipients = notification.recipients.all()
        
        if not recipients:
            logger.warning(f"No recipients found for notification {notification_id}")
            return {"status": "no_recipients"}
        
        # Prepare email details
        subject = f"New Notification: {notification.title}"
        from_email = settings.EMAIL_HOST_USER
        
        # Render HTML email template
        html_message = render_to_string(
            'emails/notification.html',
            {
                'title': notification.title,
                'message': notification.message,
                'type_notification': notification.type_notification,
                'created_at': notification.created_at,
            }
        )
        plain_message = strip_tags(html_message)
        
        # Send email to each recipient
        sent_count = 0
        failed_count = 0
        
        for recipient in recipients:
            try:
                # Create email message with attachment support
                email = EmailMessage(
                    subject=subject,
                    body=plain_message,
                    from_email=from_email,
                    to=[recipient.email],
                )
                
                # Add HTML alternative
                email.content_subtype = 'html'
                email.body = html_message
                
                # Attach file if present
                if notification.files:
                    try:
                        # Get the file path
                        file_path = notification.files.path
                        file_name = os.path.basename(file_path)
                        
                        # Read and attach the file
                        with open(file_path, 'rb') as f:
                            file_content = f.read()
                            email.attach(file_name, file_content)
                        
                        logger.info(f"Attached file: {file_name}")
                    except Exception as e:
                        logger.error(f"Failed to attach file: {str(e)}")
                        # Continue sending email even if attachment fails
                
                # Send the email
                email.send(fail_silently=False)
                
                sent_count += 1
                logger.info(f"Notification email sent successfully to {recipient.email}")
            except Exception as e:
                failed_count += 1
                logger.error(f"Failed to send notification email to {recipient.email}: {str(e)}")
        
        return {
            "status": "completed",
            "sent": sent_count,
            "failed": failed_count,
            "total_recipients": len(recipients)
        }
    
    except Notification.DoesNotExist:
        logger.error(f"Notification with id {notification_id} does not exist")
        return {"status": "error", "message": "Notification not found"}
    except Exception as e:
        logger.error(f"Error sending notification emails: {str(e)}")
        return {"status": "error", "message": str(e)}