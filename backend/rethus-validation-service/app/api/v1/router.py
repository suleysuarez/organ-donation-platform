"""Agregador de routers de la API v1."""
from fastapi import APIRouter

from .endpoints import medico

api_router = APIRouter()
api_router.include_router(medico.router)
