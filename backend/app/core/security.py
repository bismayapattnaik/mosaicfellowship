import hashlib
import hmac
import os
import base64
from cryptography.fernet import Fernet
from app.core.config import get_settings


def get_fernet() -> Fernet:
    settings = get_settings()
    key = settings.ENCRYPTION_KEY
    if not key:
        key = base64.urlsafe_b64encode(settings.SECRET_KEY.encode().ljust(32, b"\0")[:32]).decode()
    return Fernet(key)


def encrypt_value(plaintext: str) -> str:
    f = get_fernet()
    return f.encrypt(plaintext.encode()).decode()


def decrypt_value(ciphertext: str) -> str:
    f = get_fernet()
    return f.decrypt(ciphertext.encode()).decode()


def generate_session_token() -> str:
    return hashlib.sha256(os.urandom(64)).hexdigest()


def hash_ip(ip: str) -> str:
    settings = get_settings()
    return hmac.HMAC(settings.SECRET_KEY.encode(), ip.encode(), hashlib.sha256).hexdigest()
