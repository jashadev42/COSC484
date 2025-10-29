import os
from supabase import create_client, Client
import re

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

E164 = re.compile(r"^\+[1-9]\d{7,14}$")  # strict E.164

def is_valid_phone(phone: str) -> bool:
    return bool(E164.match(phone.strip()))

def send_otp(phone: str):
    if not is_valid_phone(phone):
        raise ValueError("Phone must be E.164, e.g., +15551234567")

    print(is_valid_phone(phone))
    if is_valid_phone(phone):
      return supabase.auth.sign_in_with_otp({
        'phone': phone,
      })

def verify_otp(phone: str, code: int):
    if not is_valid_phone(phone):
        raise ValueError("Phone must be E.164, e.g., +15551234567")
    if not code or not code.isdigit():
        raise ValueError("OTP must be numeric")

    if is_valid_phone(phone):
      return supabase.auth.verify_otp({
        'phone': phone,
        'token': code,
        'type': 'sms',
      })