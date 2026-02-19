from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import engine, Base
from .api import (
    ksef,
    faktury,
    eksport,
    kontrahenci,
    rachunki,
    profile,
    auth,
    sync,  # <-- nowy router
)

# Tworzenie tabel
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="KSeF Bank Manager",
    description="System do synchronizacji faktur z KSeF i generowania przelewów bankowych",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(ksef.router)
app.include_router(faktury.router)
app.include_router(eksport.router)
app.include_router(kontrahenci.router)
app.include_router(rachunki.router)
app.include_router(profile.router)
app.include_router(auth.router)
app.include_router(sync.router)  # <-- /sync/purchases

@app.get("/")
async def root():
    return {
        "message": "KSeF Bank Manager API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
