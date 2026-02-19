from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from ..database import Base
from .base import TimestampMixin

class Kontrahent(Base, TimestampMixin):
    __tablename__ = "kontrahenci"
    
    id = Column(Integer, primary_key=True, index=True)
    nip = Column(String(10), unique=True, nullable=False, index=True)
    nazwa = Column(String(255), nullable=False)
    adres = Column(String(500))
    email = Column(String(255))
    telefon = Column(String(50))
    
    status_vat = Column(String(20))  # CZYNNY/ZWOLNIONY/WYKRESLONY
    data_ostatniej_weryfikacji = Column(DateTime(timezone=True))
    
    # Relationships
    rachunki = relationship("RachunekBankowy", back_populates="kontrahent")
    faktury = relationship("Faktura", back_populates="kontrahent")
