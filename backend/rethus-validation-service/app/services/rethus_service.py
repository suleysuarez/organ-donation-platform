"""Capa de servicio: orquesta scraper + session_store.

Qué hace: implementa la lógica de negocio de los dos pasos (iniciar / validar),
traduciendo errores de scraping a respuestas de dominio limpias.
"""
from __future__ import annotations

from ..scraper import rethus_scraper
from ..scraper.browser import BrowserManager
from ..schemas.medico import (
    EstadoValidacion,
    IniciarResponse,
    ValidarMedicoRequest,
    ValidarMedicoResponse,
)
from ..session.session_store import SessionStore

_MENSAJES = {
    EstadoValidacion.AUTORIZADO: "El profesional está inscrito y autorizado para ejercer en RETHUS.",
    EstadoValidacion.NO_ENCONTRADO: "El documento no aparece en el registro RETHUS.",
    EstadoValidacion.CAPTCHA_INCORRECTO: "Captcha incorrecto. Inicia de nuevo para obtener uno nuevo.",
    EstadoValidacion.SESION_EXPIRADA: "La sesión expiró o no existe. Inicia el proceso de nuevo.",
    EstadoValidacion.ERROR_PORTAL: "No se pudo interpretar la respuesta del portal de SISPRO.",
}


class RethusService:
    def __init__(
        self,
        browser: BrowserManager,
        store: SessionStore,
        nav_timeout_ms: int,
    ) -> None:
        self._browser = browser
        self._store = store
        self._nav_timeout_ms = nav_timeout_ms

    async def iniciar_sesion(self) -> IniciarResponse:
        """Paso 1: abre una sesión de scraping y devuelve el captcha."""
        context, page = await self._browser.nuevo_context_page(self._nav_timeout_ms)
        try:
            captcha_b64 = await rethus_scraper.navegar_y_captcha(page)
        except Exception:
            await context.close()
            raise
        sesion = await self._store.crear(context, page)
        return IniciarResponse(
            session_id=sesion.session_id,
            captcha_imagen_base64=captcha_b64,
            expira_en_segundos=self._store.ttl(),
        )

    async def validar(self, req: ValidarMedicoRequest) -> ValidarMedicoResponse:
        """Paso 2: usa la sesión viva para enviar la consulta y parsear el resultado."""
        sesion = await self._store.obtener(req.session_id)
        if sesion is None:
            return self._respuesta(EstadoValidacion.SESION_EXPIRADA)

        from ..exceptions import PortalError

        try:
            estado, datos = await rethus_scraper.enviar_consulta(
                sesion.page,
                req.tipo_documento.value,
                req.numero_documento,
                req.primer_nombre,
                req.primer_apellido,
                req.captcha_texto,
            )
        except PortalError as exc:
            await self._store.eliminar(req.session_id)
            return self._respuesta(EstadoValidacion.ERROR_PORTAL, mensaje=str(exc))

        # En cualquier resultado terminal cerramos la sesión (captcha de un solo uso).
        await self._store.eliminar(req.session_id)
        return self._respuesta(estado, datos=datos)

    @staticmethod
    def _respuesta(estado, datos=None, mensaje=None) -> ValidarMedicoResponse:
        return ValidarMedicoResponse(
            encontrado=(estado == EstadoValidacion.AUTORIZADO),
            estado=estado,
            datos=datos,
            mensaje=mensaje or _MENSAJES.get(estado, ""),
        )
