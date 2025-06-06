import asyncio
import smtplib
from email.message import EmailMessage
from config import settings

async def send_reset_email(to_email: str, token: str):
    reset_link = f"{settings.FRONTEND_URL}/reset-password.html?token={token}"
    msg = EmailMessage()
    msg["Subject"] = "Your ChatApp Password Reset"
    msg["From"] = settings.EMAIL_FROM
    msg["To"] = to_email
    msg.set_content(
        f"Click the link below to reset your password:\n\n"
        f"{reset_link}\n\n"
    )

    def _send():
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as smtp:
            smtp.starttls()
            smtp.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            smtp.send_message(msg)

    # run the blocking SMTP send in a thread
    await asyncio.to_thread(_send)
