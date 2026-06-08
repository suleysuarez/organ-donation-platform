"""Gestor del navegador Playwright (qué hace: mantiene una única instancia de
Chromium para todo el proceso y crea contextos aislados por sesión).
"""
from __future__ import annotations

from typing import Any

from playwright.async_api import async_playwright


class BrowserManager:
    def __init__(self, headless: bool) -> None:
        self._headless = headless
        self._pw: Any = None
        self._browser: Any = None

    async def iniciar(self) -> None:
        self._pw = await async_playwright().start()
        self._browser = await self._pw.chromium.launch(headless=self._headless)

    async def nuevo_context_page(self, nav_timeout_ms: int) -> tuple[Any, Any]:
        if self._browser is None:
            raise RuntimeError("BrowserManager no iniciado: llama a iniciar() primero.")
        context = await self._browser.new_context()
        page = await context.new_page()
        page.set_default_timeout(nav_timeout_ms)
        return context, page

    async def cerrar(self) -> None:
        if self._browser is not None:
            await self._browser.close()
            self._browser = None
        if self._pw is not None:
            await self._pw.stop()
            self._pw = None
