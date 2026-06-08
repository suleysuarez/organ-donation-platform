"""Lanzador de desarrollo (qué hace: arranca uvicorn fijando el event loop correcto
en Windows ANTES de crear el loop, para que Playwright pueda lanzar el navegador).

Uso:  python run.py
En Windows NO uses `uvicorn ... --reload` con Playwright: el modo reload crea el
event loop (Selector) en un subproceso y rompe el lanzamiento del navegador.
"""
from __future__ import annotations

import asyncio
import sys

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

import uvicorn  # noqa: E402  (debe importarse después de fijar la política)

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8000,
        workers=1,
        reload=False,
    )
