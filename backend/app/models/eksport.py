from sqlalchemy import Column, Integer, String, Numeric, DateTime, Text, ForeignKey, Table
from sqlalchemy.orm import relationship
from ..database import Base
from .base import TimestampMixin


# Tabela asocjacyjna faktura <-> eksport
faktury_eksporty = Table(
    "faktury_eksporty",
    Base.metadata,
    Column("faktura_id", Integer, ForeignKey("faktury.id"), primary_key=True),
    Column("eksport_id", Integer, ForeignKey("eksporty_bank.id"), primary_key=True),
)


class EksportBank(Base, TimestampMixin):
    __tablename__ = "eksporty_bank"

    id = Column(Integer, primary_key=True, index=True)
    nazwa_pliku = Column(String(255))
    data_eksportu = Column(DateTime(timezone=True))
    format = Column(String(20), default="XML")
    liczba_faktur = Column(Integer, default=0)
    laczna_kwota = Column(Numeric(14, 2))
    status = Column(String(20), default="WYGENEROWANY")
    plik_xml = Column(Text)
    sciezka_pliku = Column(String(500))

    # Relationships
    faktury = relationship("Faktura", secondary=faktury_eksporty, back_populates="eksporty")
