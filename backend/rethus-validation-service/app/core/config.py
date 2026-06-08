"""Configuración del microservicio (qué hace: centraliza settings leídos de .env).

Autor: equipo organ-donation-platform. Carga variables de entorno con pydantic-settings.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    # URL de la "Consulta de Ciudadanos en RETHUS" (pública, sin login). Confirmada contra el portal.
    rethus_consulta_url: str = (
        "https://web.sispro.gov.co/THS/Cliente/ConsultasPublicas/"
        "ConsultaPublicaDeTHxIdentificacion.aspx"
    )
    # Tiempo de vida de una sesión de scraping viva (segundos) entre /iniciar y /validar.
    session_ttl_seconds: int = 180
    # Navegador headless (poner en false para depurar visualmente el flujo).
    playwright_headless: bool = True
    # Timeout de navegación/espera de selectores (ms).
    nav_timeout_ms: int = 30000


settings = Settings()
