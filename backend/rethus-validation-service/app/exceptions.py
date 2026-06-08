"""Excepciones de dominio del microservicio RETHUS.

Qué hace: tipos de error que la capa de servicio traduce a respuestas limpias.
"""


class RethusError(Exception):
    """Error base del dominio RETHUS."""


class PortalError(RethusError):
    """El portal de SISPRO falló (timeout, cambió el HTML, caído, etc.)."""


class SesionExpirada(RethusError):
    """La sesión de scraping no existe o ya venció."""


class CaptchaIncorrecto(RethusError):
    """El texto del captcha enviado fue rechazado por el portal."""
