"""Punto de entrada de la app FastAPI del microservicio RETHUS.

Qué hace: arma la aplicación, gestiona el ciclo de vida de Playwright (lifespan)
y registra los manejadores de error. `create_app` permite inyectar un servicio
falso en tests para no levantar un navegador real.
"""
from __future__ import annotations

import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI

from .api.v1.router import api_router
from .core.config import settings
from .scraper.browser import BrowserManager
from .services.rethus_service import RethusService
from .session.session_store import SessionStore

_LIMPIEZA_INTERVALO_S = 30


def create_app(rethus_service: RethusService | None = None) -> FastAPI:
    """Crea la app. Si se pasa `rethus_service`, se omite el arranque de Playwright
    (útil para tests con un servicio mockeado)."""

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        if rethus_service is not None:
            app.state.rethus_service = rethus_service
            yield
            return

        browser = BrowserManager(headless=settings.playwright_headless)
        await browser.iniciar()
        store = SessionStore(ttl_seconds=settings.session_ttl_seconds)
        app.state.rethus_service = RethusService(browser, store, settings.nav_timeout_ms)

        stop = asyncio.Event()

        async def _limpieza_periodica() -> None:
            while not stop.is_set():
                try:
                    await asyncio.wait_for(stop.wait(), timeout=_LIMPIEZA_INTERVALO_S)
                except asyncio.TimeoutError:
                    await store.limpiar_vencidas()

        tarea = asyncio.create_task(_limpieza_periodica())
        try:
            yield
        finally:
            stop.set()
            tarea.cancel()
            await store.cerrar_todas()
            await browser.cerrar()

    app = FastAPI(
        title="RETHUS Validation Service",
        description="Microservicio que valida médicos contra el registro RETHUS de SISPRO.",
        version="0.1.0",
        lifespan=lifespan,
    )
    app.include_router(api_router)

    @app.get("/health", tags=["infra"])
    async def health() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()
