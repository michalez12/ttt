from sqlalchemy import Column, Integer, String, Boolean, DateTime
from ..database import Base
from .base import TimestampMixin


class User(Base, TimestampMixin):
    __tablename__ = "uzytkownicy"

    id = Column(Integer, primary_key=True, index=True)

    # Logowanie
    username = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    api_token = Column(String(64), unique=True, nullable=False, index=True)

    # Dane firmy
    firma_nazwa = Column(String(255))
    firma_nip = Column(String(10), index=True)
    firma_rachunek = Column(String(34))  # własny IBAN firmy do eksportu

    # KSeF
    ksef_token = Column(String(500))

    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    last_login = Column(DateTime(timezone=True))
