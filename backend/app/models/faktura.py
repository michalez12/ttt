from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Date,
    Numeric,
    Boolean,
    ForeignKey,
    Text,
)
from sqlalchemy.orm import relationship

from ..database import Base
from .eksport import faktury_eksporty


class Faktura(Base):
    __tablename__ = "faktury"

    id = Column(Integer, primary_key=True, index=True)

    numer_ksef = Column(String, index=True, nullable=True)
    numer_faktury = Column(String, index=True, nullable=False)

    kontrahent_id = Column(Integer, ForeignKey("kontrahenci.id"), nullable=False)
    rachunek_id = Column(Integer, ForeignKey("rachunki_bankowe.id"), nullable=True)

    data_wystawienia = Column(Date, nullable=True)
    termin_platnosci = Column(Date, nullable=True)

    kwota_netto = Column(Numeric(12, 2), nullable=False)
    kwota_vat = Column(Numeric(12, 2), nullable=False)
    kwota_brutto = Column(Numeric(12, 2), nullable=False)

    waluta = Column(String(3), nullable=False, default="PLN")
    forma_platnosci = Column(String, nullable=True)
    opis_platnosci = Column(Text, nullable=True)

    status = Column(String, nullable=False, default="NOWA")
    kolor = Column(String, nullable=True)
    czy_do_eksportu = Column(Boolean, nullable=False, default=False)

    xml_ksef = Column(Text, nullable=True)

    # pola związane z korektami
    numer_fa_oryginalnej = Column(String, nullable=True)
    czy_korekta = Column(Boolean, nullable=False, default=False)
    czy_rozliczona = Column(Boolean, nullable=False, default=False)  # <-- NOWE
    faktura_oryginalna_id = Column(Integer, ForeignKey("faktury.id"), nullable=True)

    # relacje podstawowe
    kontrahent = relationship("Kontrahent", back_populates="faktury")
    rachunek = relationship("RachunekBankowy", back_populates="faktury")

    # pozycje faktury
    pozycje = relationship(
        "PozycjaFaktury",
        back_populates="faktura",
        cascade="all, delete-orphan",
    )

    # relacja samo do siebie – korekty
    faktura_oryginalna = relationship(
        "Faktura",
        remote_side=[id],
        backref="korekty",
    )

    # relacja wiele-do-wielu do eksportów bankowych
    eksporty = relationship(
        "EksportBank",
        secondary=faktury_eksporty,
        back_populates="faktury",
        lazy="selectin",
    )


class PozycjaFaktury(Base):
    __tablename__ = "pozycje_faktury"

    id = Column(Integer, primary_key=True, index=True)
    faktura_id = Column(Integer, ForeignKey("faktury.id"), nullable=False)
    numer_pozycji = Column(Integer)
    nazwa = Column(String(500), nullable=False)
    indeks = Column(String(50), nullable=True)
    kod_cn = Column(String(20), nullable=True)
    gtu = Column(String(10), nullable=True)
    ilosc = Column(Float)
    jednostka = Column(String(20))
    cena_netto = Column(Float)
    rabat = Column(Float, nullable=True)
    wartosc_netto = Column(Float)
    stawka_vat = Column(String(10))
    kwota_vat = Column(Float)
    wartosc_brutto = Column(Float)

    faktura = relationship("Faktura", back_populates="pozycje")