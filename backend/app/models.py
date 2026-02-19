from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base


class EksportBank(Base):
    __tablename__ = "eksport_bank"

    id = Column(Integer, primary_key=True, index=True)
    nazwa = Column(String(100), nullable=False, unique=True)   # np. "PEKAO_XML"
    rachunek_iban = Column(String(34), nullable=False)         # PL3812403927...
    opis = Column(String(255))
    created_at = Column(DateTime, default=datetime.now)


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    api_token = Column(String(255), unique=True, index=True)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.now)
    
    # Pola firmowe
    firma_nazwa = Column(String(255), nullable=True)
    firma_nip = Column(String(20), nullable=True)
    firma_rachunek = Column(String(34), nullable=True)
# Token KSeF  ← NOWE
    ksef_token = Column(String(500), nullable=True)


class Kontrahent(Base):
    __tablename__ = "kontrahenci"
    
    id = Column(Integer, primary_key=True, index=True)
    nip = Column(String(20), unique=True, index=True, nullable=False)
    nazwa = Column(String(255), nullable=False)
    adres = Column(String(500))
    email = Column(String(100))
    telefon = Column(String(20))
    created_at = Column(DateTime, default=datetime.now)
    
    # Relacje
    rachunki = relationship("RachunekBankowy", back_populates="kontrahent")
    faktury = relationship("Faktura", back_populates="kontrahent")


class RachunekBankowy(Base):
    __tablename__ = "rachunki_bankowe"

    id = Column(Integer, primary_key=True, index=True)
    kontrahent_id = Column(Integer, ForeignKey("kontrahenci.id"), nullable=False)
    numer_rachunku = Column(String, nullable=False)
    iban = Column(String, nullable=False)
    nazwa_banku = Column(String, nullable=True)
    swift = Column(String, nullable=True)
    status_biala_lista = Column(String, nullable=True)
    data_weryfikacji = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # NOWE POLE – wyjątek dla Białej Listy (np. rachunek faktora)
    ignore_biala_lista = Column(Boolean, nullable=False, default=False)

    kontrahent = relationship("Kontrahent", back_populates="rachunki")
    faktury = relationship("Faktura", back_populates="rachunek")


class Faktura(Base):
    __tablename__ = "faktury"
    
    id = Column(Integer, primary_key=True, index=True)
    numer_ksef = Column(String(100), unique=True, index=True)
    numer_faktury = Column(String(100), nullable=False, index=True)
    
    # Powiązania
    kontrahent_id = Column(Integer, ForeignKey("kontrahenci.id"), nullable=False)
    rachunek_id = Column(Integer, ForeignKey("rachunki_bankowe.id"))
    
    # Daty
    data_wystawienia = Column(Date, nullable=False)
    termin_platnosci = Column(Date)
    data_pobrania = Column(DateTime, default=datetime.now)
    
    # Kwoty
    kwota_netto = Column(Float, nullable=False)
    kwota_vat = Column(Float, nullable=False)
    kwota_brutto = Column(Float, nullable=False)
    waluta = Column(String(3), default="PLN")
    
    # Płatność
    forma_platnosci = Column(String(20))  # 1=gotówka, 2=karta, 6=przelew, itd.
    opis_platnosci = Column(Text)
    
    # Status
    status = Column(String(20), default="NOWA")  # NOWA, WERYFIKOWANA, ZATWIERDZONA, WYEKSPORTOWANA, ZAPLACONA
    czy_do_eksportu = Column(Boolean, default=False)
    kolor = Column(String(20))  # green, yellow, orange, red
    
    # Obsługa korekt
    rodzaj_faktury = Column(String(20), default="VAT")  # VAT, KOR, ZALICZKA
    numer_fa_oryginalnej = Column(String(100), nullable=True)  # Dla korekty
    czy_korekta = Column(Boolean, default=False)
    faktura_oryginalna_id = Column(Integer, ForeignKey('faktury.id'), nullable=True)
    
    # XML
    xml_ksef = Column(Text)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    
    # Relacje
    kontrahent = relationship("Kontrahent", back_populates="faktury")
    rachunek = relationship("RachunekBankowy", back_populates="faktury")
    pozycje = relationship("PozycjaFaktury", back_populates="faktura", cascade="all, delete-orphan")
    
    # Relacja do faktury oryginalnej (dla korekt)
    faktura_oryginalna = relationship("Faktura", remote_side=[id], backref="korekty", foreign_keys=[faktura_oryginalna_id])


class PozycjaFaktury(Base):
    __tablename__ = "pozycje_faktury"
    
    id = Column(Integer, primary_key=True, index=True)
    faktura_id = Column(Integer, ForeignKey("faktury.id"), nullable=False)
    numer_pozycji = Column(Integer)
    nazwa = Column(String(500), nullable=False)
    ilosc = Column(Float)
    jednostka = Column(String(20))
    cena_netto = Column(Float)
    wartosc_netto = Column(Float)
    stawka_vat = Column(String(10))
    kwota_vat = Column(Float)
    wartosc_brutto = Column(Float)
    
    # Relacja
    faktura = relationship("Faktura", back_populates="pozycje")


class Eksport(Base):
    __tablename__ = "eksporty"
    
    id = Column(Integer, primary_key=True, index=True)
    data_eksportu = Column(DateTime, default=datetime.now)
    nazwa_pliku = Column(String(255), nullable=False)
    format = Column(String(20), default="XML")
    liczba_faktur = Column(Integer)
    laczna_kwota = Column(Float)
    status = Column(String(20), default="CREATED")
    plik_xml = Column(Text)
    sciezka_pliku = Column(String(500))
    created_at = Column(DateTime, default=datetime.now)


class KsefSession(Base):
    __tablename__ = "ksef_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    session_token = Column(String(500), unique=True)
    nip = Column(String(20), nullable=False)
    data_utworzenia = Column(DateTime, default=datetime.now)
    data_wygasniecia = Column(DateTime)
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=datetime.now)
