"""Store en memoria de sesiones de scraping vivas (qué hace: mantiene el navegador
abierto entre /iniciar y /validar, con expiración por TTL).

Caveat: al ser en memoria, el microservicio debe correr con un solo worker.
Para escalar haría falta un store externo (p.ej. Redis) o serializar la sesión.
"""
from __future__ import annotations

import asyncio
import time
import uuid
from dataclasses import dataclass
from typing import Any


@dataclass
class SesionScraping:
    """Una sesión Playwright viva asociada a un session_id."""

    session_id: str
    context: Any  # playwright BrowserContext
    page: Any     # playwright Page
    created_at: float


class SessionStore:
    def __init__(self, ttl_seconds: int) -> None:
        self._ttl = ttl_seconds
        self._data: dict[str, SesionScraping] = {}
        self._lock = asyncio.Lock()

    def ttl(self) -> int:
        return self._ttl

    async def crear(self, context: Any, page: Any) -> SesionScraping:
        sid = uuid.uuid4().hex
        sesion = SesionScraping(sid, context, page, time.time())
        async with self._lock:
            self._data[sid] = sesion
        return sesion

    async def obtener(self, session_id: str) -> SesionScraping | None:
        """Devuelve la sesión viva o None si no existe / venció (cerrándola)."""
        async with self._lock:
            sesion = self._data.get(session_id)
            if sesion is None:
                return None
            if time.time() - sesion.created_at > self._ttl:
                self._data.pop(session_id, None)
                vencida = sesion
                sesion = None
        if sesion is None:
            await self._cerrar(vencida)
            return None
        return sesion

    async def eliminar(self, session_id: str) -> None:
        async with self._lock:
            sesion = self._data.pop(session_id, None)
        if sesion is not None:
            await self._cerrar(sesion)

    async def limpiar_vencidas(self) -> None:
        ahora = time.time()
        vencidas: list[SesionScraping] = []
        async with self._lock:
            for sid in list(self._data.keys()):
                sesion = self._data[sid]
                if ahora - sesion.created_at > self._ttl:
                    vencidas.append(self._data.pop(sid))
        for sesion in vencidas:
            await self._cerrar(sesion)

    async def cerrar_todas(self) -> None:
        async with self._lock:
            sesiones = list(self._data.values())
            self._data.clear()
        for sesion in sesiones:
            await self._cerrar(sesion)

    @staticmethod
    async def _cerrar(sesion: SesionScraping) -> None:
        try:
            await sesion.context.close()
        except Exception:  # noqa: BLE001 - cierre best-effort
            pass
