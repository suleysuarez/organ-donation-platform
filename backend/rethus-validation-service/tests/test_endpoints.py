"""Tests de contrato de los endpoints con un servicio mockeado (sin Playwright)."""
import pytest
from fastapi.testclient import TestClient

from app.main import create_app
from app.schemas.medico import (
    DatosMedico,
    EstadoValidacion,
    IniciarResponse,
    ValidarMedicoResponse,
)


class FakeRethusService:
    """Doble de prueba: responde según el numero_documento recibido."""

    async def iniciar_sesion(self) -> IniciarResponse:
        return IniciarResponse(
            session_id="sid-test",
            captcha_imagen_base64="ZmFrZS1wbmc=",  # "fake-png"
            expira_en_segundos=180,
        )

    async def validar(self, req) -> ValidarMedicoResponse:
        if req.session_id == "expirada":
            return ValidarMedicoResponse(
                encontrado=False, estado=EstadoValidacion.SESION_EXPIRADA, mensaje="x"
            )
        if req.numero_documento == "111":
            return ValidarMedicoResponse(
                encontrado=True,
                estado=EstadoValidacion.AUTORIZADO,
                datos=DatosMedico(autorizado_para_ejercer=True, sanciones="Sin sanciones registradas"),
                mensaje="ok",
            )
        return ValidarMedicoResponse(
            encontrado=False, estado=EstadoValidacion.NO_ENCONTRADO, mensaje="no"
        )


@pytest.fixture()
def client():
    app = create_app(rethus_service=FakeRethusService())
    with TestClient(app) as c:  # entra al lifespan → setea app.state.rethus_service
        yield c


def test_health(client: TestClient):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_iniciar_devuelve_captcha(client: TestClient):
    r = client.post("/validar-medico/iniciar")
    assert r.status_code == 200
    body = r.json()
    assert body["session_id"] == "sid-test"
    assert body["captcha_imagen_base64"]
    assert body["expira_en_segundos"] == 180


def test_validar_autorizado(client: TestClient):
    r = client.post(
        "/validar-medico",
        json={
            "session_id": "sid-test",
            "tipo_documento": "CC",
            "numero_documento": "111",
            "primer_apellido": "PEREZ",
            "captcha_texto": "1234",
        },
    )
    assert r.status_code == 200
    body = r.json()
    assert body["encontrado"] is True
    assert body["estado"] == "AUTORIZADO"
    assert body["datos"]["autorizado_para_ejercer"] is True


def test_validar_no_encontrado(client: TestClient):
    r = client.post(
        "/validar-medico",
        json={
            "session_id": "sid-test",
            "tipo_documento": "CC",
            "numero_documento": "999",
            "captcha_texto": "1234",
        },
    )
    assert r.status_code == 200
    assert r.json()["estado"] == "NO_ENCONTRADO"


def test_validar_sesion_expirada(client: TestClient):
    r = client.post(
        "/validar-medico",
        json={
            "session_id": "expirada",
            "tipo_documento": "CC",
            "numero_documento": "111",
            "captcha_texto": "1234",
        },
    )
    assert r.status_code == 200
    assert r.json()["estado"] == "SESION_EXPIRADA"


def test_validacion_payload_invalido(client: TestClient):
    # Falta captcha_texto y numero_documento demasiado corto.
    r = client.post(
        "/validar-medico",
        json={"session_id": "sid-test", "tipo_documento": "CC", "numero_documento": "1"},
    )
    assert r.status_code == 422
