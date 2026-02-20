from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    Numeric,
    Boolean,
    ForeignKey,
    Text,
)
from sqlalchemy.orm import relationship

from ..database import Base
from .eksport import faktury_eksporty  # tabela pośrednia faktura <-> eksport


class Faktura(Base):
    __tablename__ = "faktury"

    id = Column(Integer, primary_key=True, index=True)

    numer_ksef = Column(String, index=True, nullable=True)
    numer_faktury = Column(String, index=True, nullable=False)

    kontrahent_id = Column(
        Integer,
        ForeignKey("kontrahenci.id"),
        nullable=False,
    )
    rachunek_id = Column(
        Integer,
        ForeignKey("rachunki_bankowe.id"),
        nullable=True,
    )

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
    faktura_oryginalna_id = Column(
        Integer,
        ForeignKey("faktury.id"),
        nullable=True,
    )

    # relacje podstawowe
    kontrahent = relationship(
        "Kontrahent",
        back_populates="faktury",
    )
    rachunek = relationship(
        "RachunekBankowy",
        back_populates="faktury",
    )

    # relacja samodo siebie – korekty
    faktura_oryginalna = relationship(
        "Faktura",
        remote_side=[id],
        backref="korekty",
    )

    # relacja wiele-do-wielu do eksportów bankowych przez tabelę faktury_eksporty
    eksporty = relationship(
        "EksportBank",
        secondary=faktury_eksporty,
        back_populates="faktury",
        lazy="selectin",
    )
