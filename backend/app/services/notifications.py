from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from twilio.rest import Client
import os
from dotenv import load_dotenv

from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parents[2]   # backend folder
load_dotenv(BASE_DIR / ".env", override=True)

print("Current Folder:", os.getcwd())

print("ENV FILE:", BASE_DIR / ".env")
print("SID:", os.getenv("TWILIO_ACCOUNT_SID"))
print("TOKEN:", os.getenv("TWILIO_AUTH_TOKEN"))
print("FROM:", os.getenv("TWILIO_WHATSAPP_NUMBER"))
print("SID:", os.getenv("TWILIO_ACCOUNT_SID"))
print("TOKEN:", os.getenv("TWILIO_AUTH_TOKEN"))
print("FROM:", os.getenv("TWILIO_WHATSAPP_NUMBER"))

load_dotenv()

# ===== EMAIL SETUP =====
email_conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_USERNAME"),
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,      # pehle MAIL_TLS tha
    MAIL_SSL_TLS=False,
)

# ===== TWILIO SETUP (WhatsApp + Call) =====
twilio_client = Client(
    os.getenv("TWILIO_ACCOUNT_SID"),
    os.getenv("TWILIO_AUTH_TOKEN")
)

# ===== EMAIL भेजो =====
async def send_email(to_email: str, subject: str, body: str):
    """Manager/Admin को email भेजो"""
    try:
        message = MessageSchema(
            subject=subject,
            recipients=[to_email],
            body=body,
            subtype="html"
        )
        fm = FastMail(email_conf)
        await fm.send_message(message)
        print(f"✅ Email sent to {to_email}")
    except Exception as e:
        print(f"❌ Email error: {e}")

# ===== WhatsApp भेजो =====
def send_whatsapp(phone: str, message: str):
    try:
        print("Sending WhatsApp...")
        print("FROM:", os.getenv("TWILIO_WHATSAPP_NUMBER"))
        print("TO:", f"whatsapp:{phone}")

        msg = twilio_client.messages.create(
            from_=os.getenv("TWILIO_WHATSAPP_NUMBER"),
            to=f"whatsapp:{phone}",
            body=message
        )

        print("✅ SID:", msg.sid)
        return msg.sid

    except Exception as e:
        print("❌ WhatsApp Error:")
        print(e)
        return None

# ===== CALL करो =====
def make_call(phone: str, message: str):
    """Manager/Admin को call करो"""
    try:
        call = twilio_client.calls.create(
            to=phone,
            from_=os.getenv("TWILIO_PHONE_NUMBER"),  # Twilio number
            url="https://yourdomain.com/voice-message"  # TwiML URL
        )
        print(f"✅ Call made to {phone}")
        return call.sid
    except Exception as e:
        print(f"❌ Call error: {e}")
        return None

# ===== ANOMALY ALERT (सब notification एक साथ) =====
async def send_anomaly_alert(
    manager_email: str,
    manager_phone: str,
    product_id: str,
    anomaly_type: str,
    severity: str,
    value: float,
    expected_value: float
):
    """जब anomaly detect हो तो manager को notify करो"""
    
    # Message template
    alert_message = f"""
    ⚠️ ANOMALY DETECTED ⚠️
    
    Product: {product_id}
    Type: {anomaly_type}
    Severity: {severity}
    
    Expected: {expected_value}
    Actual: {value}
    
    Please check immediately!
    """
    
    # Email भेजो
    await send_email(
        to_email=manager_email,
        subject=f"⚠️ {severity} Anomaly on {product_id}",
        body=alert_message
    )
    
    # WhatsApp भेजो
    send_whatsapp(
        phone=manager_phone,
        message=alert_message
    )
    
    # High severity हो तो call भी करो
    if severity == "HIGH":
        make_call(
            phone=manager_phone,
            message=f"High severity anomaly on product {product_id}"
        )