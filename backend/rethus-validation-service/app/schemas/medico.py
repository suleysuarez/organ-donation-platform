"""Esquemas (DTOs) de entrada/salida del microservicio RETHUS.

Qué hace: define el contrato público de la API con Pydantic.
"""
from enum import Enum

from pydantic import BaseModel, Field


class TipoDocumento(str, Enum):
    """Tipos de documento que ofrece la consulta pública de RETHUS (confirmado)."""

    CC = "CC"  # Cédula de ciudadanía
    CE = "CE"  # Cédula de extranjería
    PT = "PT"  # Permiso por protección temporal
    TI = "TI"  # Tarjeta de identidad


class EstadoValidacion(str, Enum):
    """Resultado de la validación de un médico contra RETHUS."""

    AUTORIZADO = "AUTORIZADO"            # Inscrito y autorizado para ejercer
    NO_ENCONTRADO = "NO_ENCONTRADO"      # No aparece en el registro
    CAPTCHA_INCORRECTO = "CAPTCHA_INCORRECTO"
    SESION_EXPIRADA = "SESION_EXPIRADA"  # session_id inválido o vencido
    ERROR_PORTAL = "ERROR_PORTAL"        # Fallo del portal de SISPRO


class IniciarResponse(BaseModel):
    """Respuesta del paso 1: entrega el captcha y el identificador de sesión."""

    session_id: str
    captcha_imagen_base64: str = Field(
        description="PNG del captcha codificado en base64 (sin prefijo data:)."
    )
    expira_en_segundos: int


class ValidarMedicoRequest(BaseModel):
    """Cuerpo del paso 2: datos del médico + texto del captcha resuelto."""

    session_id: str
    tipo_documento: TipoDocumento
    numero_documento: str = Field(min_length=3, max_length=20)
    primer_nombre: str | None = Field(
        default=None, description="Primer nombre (opcional en el portal)."
    )
    primer_apellido: str | None = Field(
        default=None, description="Primer apellido (opcional en el portal)."
    )
    captcha_texto: str = Field(min_length=1, max_length=12)


class DatosMedico(BaseModel):
    """Datos extraídos del registro RETHUS cuando el médico existe."""

    nombre_completo: str | None = None
    profesion_perfil: str | None = None
    fecha_registro: str | None = None
    autorizado_para_ejercer: bool | None = None
    sanciones: str | None = None


class ValidarMedicoResponse(BaseModel):
    """Respuesta final de la validación."""

    encontrado: bool
    estado: EstadoValidacion
    datos: DatosMedico | None = None
    mensaje: str
