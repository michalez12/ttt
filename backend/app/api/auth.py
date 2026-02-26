from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import secrets
import bcrypt

from ..database import get_db
from ..models import User
from .deps import get_current_user

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


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


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


@router.get("/me")
async def me(
    current_user: User = Depends(get_current_user),
):
    return {
        "username": current_user.username,
        "email": current_user.email,
        "firma_nazwa": current_user.firma_nazwa,
        "firma_nip": current_user.firma_nip,
    }


@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_user),
):
    return {"success": True, "message": "Wylogowano"}


@router.post("/register")
async def register(
    data: RegisterRequest,
    db: Session = Depends(get_db),
):
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


@router.post("/change-password")
async def change_password(
    data: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Nieprawidłowe obecne hasło")

    if len(data.new_password) < 6:
        raise HTTPException(status_code=400, detail="Nowe hasło musi mieć co najmniej 6 znaków")

    if data.new_password == data.current_password:
        raise HTTPException(status_code=400, detail="Nowe hasło musi być inne niż obecne")

    current_user.hashed_password = get_password_hash(data.new_password)
    db.commit()

    return {"message": "Hasło zostało zmienione"}


@router.post("/hash-password")
async def hash_password_endpoint(password: str):
    return {"hashed_password": get_password_hash(password)}


@router.post("/create-first-user")
async def create_first_user(
    db: Session = Depends(get_db),
):
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
