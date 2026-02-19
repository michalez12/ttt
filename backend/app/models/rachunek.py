from sqlalchemy import Column, Integer, String, Boolean, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base
from .base import TimestampMixin

class RachunekBankowy(Base, TimestampMixin):
    __tablename__ = "rachunki_bankowe"
    
    id = Column(Integer, primary_key=True, index=True)
    kontrahent_id = Column(Integer, ForeignKey("kontrahenci.id"), nullable=False)
    
    numer_rachunku = Column(String(28), nullable=False)  # Bez PL
    iban = Column(String(28), nullable=False)  # Z prefiksem PL
    nazwa_banku = Column(String(255))
    
    status_biala_lista = Column(String(20), default="PENDING")  # PENDING/ZWERYFIKOWANY/NIEZWERYFIKOWANY/NIEZNALEZIONY
    request_id = Column(String(100))  # ID weryfikacji z API MF
    data_weryfikacji = Column(DateTime(timezone=True))
    wazne_do = Column(Date)  # data_weryfikacji + 30 dni
    
    is_default = Column(Boolean, default=True)
    
    # Relationships
    kontrahent = relationship("Kontrahent", back_populates="rachunki")
    faktury = relationship("Faktura", back_populates="rachunek")
