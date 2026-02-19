from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Baza danych
    DATABASE_URL: str = "postgresql+psycopg2://ksef_user:ksef_password@db:5432/ksef_db"


    # Debug
    DEBUG: bool = False

    # KSeF
    KSEF_ENVIRONMENT: str = "prod"

    # Biała Lista MF
    MF_API_URL: str = "https://wl-api.mf.gov.pl"

    # Auth
    SECRET_KEY: str = "zmien-mnie-na-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    class Config:
        env_file = ".env"
        extra = "allow"


settings = Settings()
