"""Endpoints de validación de médicos.

Qué hace: expone el flujo de 2 pasos /validar-medico/iniciar y /validar-medico.
La capa HTTP no toca Playwright: delega en RethusService (inyectado vía app.state).
"""
from fastapi import APIRouter, Depends, Request

from ....schemas.medico import (
    IniciarResponse,
    ValidarMedicoRequest,
    ValidarMedicoResponse,
)
from ....services.rethus_service import RethusService

router = APIRouter(tags=["medico"])


def get_service(request: Request) -> RethusService:
    return request.app.state.rethus_service


@router.post("/validar-medico/iniciar", response_model=IniciarResponse)
async def iniciar_validacion(
    service: RethusService = Depends(get_service),
) -> IniciarResponse:
    """Paso 1: abre sesión de scraping y devuelve el captcha (base64) a resolver."""
    return await service.iniciar_sesion()


@router.post("/validar-medico", response_model=ValidarMedicoResponse)
async def validar_medico(
    payload: ValidarMedicoRequest,
    service: RethusService = Depends(get_service),
) -> ValidarMedicoResponse:
    """Paso 2: envía documento + captcha resuelto y devuelve el resultado de RETHUS."""
    return await service.validar(payload)
