from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import secrets
import bcrypt

from ..database import get_db
from ..models import User

router = APIRouter(prefix="/api/auth", tags=["Auth"])


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    token: str
    username: str
    email: str
    firma_nazwa: Optional[str] = None
    firma_nip: Optional[str] = None


class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    firma_nazwa: Optional[str] = None
    firma_nip: Optional[str] = None


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode('utf-8'),
        hashed_password.encode('utf-8')
    )


def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')


def generate_api_token() -> str:
    return secrets.token_hex(32)


@router.post("/login", response_model=LoginResponse)
async def login(
    credentials: LoginRequest,
    db: Session = Depends(get_db),
):
    """
    Logowanie - weryfikuje hasło bcrypt, zwraca API token.
    """
    user = (
        db.query(User)
        .filter(User.username == credentials.username)
        .filter(User.is_active == True)
        .first()
    )

    if not user:
        raise HTTPException(status_code=401, detail="Nieprawidłowe dane logowania")

    if not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Nieprawidłowe dane logowania")

    return LoginResponse(
        token=user.api_token,
        username=user.username,
        email=user.email,
        firma_nazwa=user.firma_nazwa,
        firma_nip=user.firma_nip,
    )


@router.post("/register")
async def register(
    data: RegisterRequest,
    db: Session = Depends(get_db),
):
    """
    Rejestracja nowego użytkownika.
    """
    # Sprawdź czy username lub email już istnieje
    existing = (
        db.query(User)
        .filter(
            (User.username == data.username) |
            (User.email == data.email)
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Użytkownik z takim username lub email już istnieje"
        )

    user = User(
        username=data.username,
        email=data.email,
        hashed_password=get_password_hash(data.password),
        api_token=generate_api_token(),
        firma_nazwa=data.firma_nazwa,
        firma_nip=data.firma_nip,
        is_active=True,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "success": True,
        "message": "Konto utworzone pomyślnie",
        "username": user.username,
        "email": user.email,
    }


@router.post("/hash-password")
async def hash_password_endpoint(password: str):
    """
    Pomocniczy endpoint do generowania hasha hasła.
    Użyj do stworzenia pierwszego użytkownika.
    """
    return {"hashed_password": get_password_hash(password)}


@router.post("/create-first-user")
async def create_first_user(
    db: Session = Depends(get_db),
):
    """
    Tworzy pierwszego użytkownika admin/admin123 jeśli baza jest pusta.
    USUŃ ten endpoint na produkcji!
    """
    count = db.query(User).count()
    if count > 0:
        raise HTTPException(
            status_code=400,
            detail="Użytkownicy już istnieją w bazie"
        )

    user = User(
        username="admin",
        email="admin@ksef.local",
        hashed_password=get_password_hash("admin123"),
        api_token=generate_api_token(),
        firma_nazwa="Moja Firma",
        firma_nip="",
        is_active=True,
    )

    db.add(user)
    db.commit()

    return {
        "success": True,
        "message": "Użytkownik admin utworzony",
        "username": "admin",
        "password": "admin123",
        "token": user.api_token,
    }
