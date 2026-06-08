"""Interacciones de scraping con la Consulta de Ciudadanos en RETHUS (SISPRO).

Qué hace:
  - navegar_y_captcha(page): carga la consulta pública y devuelve el captcha en base64.
  - enviar_consulta(page, ...): completa el formulario, dispara la verificación y
    clasifica el resultado (maneja el alert JS de captcha incorrecto).
  - interpretar_resultado(texto): función PURA que clasifica el texto de la zona de
    resultados en EstadoValidacion + DatosMedico. Es la pieza testeable sin navegador.

Selectores CONFIRMADOS contra el portal (ASP.NET WebForms, ids `ctl00$cntContenido$...`).
Página: web.sispro.gov.co/THS/Cliente/ConsultasPublicas/ConsultaPublicaDeTHxIdentificacion.aspx

⚠️ Calibración pendiente: el texto exacto de los estados AUTORIZADO / NO_ENCONTRADO
(tras un captcha válido) debe confirmarse en QA resolviendo un captcha real. El captcha
incorrecto SÍ está confirmado (alert "Verifique el Número de Confirmación").
"""
from __future__ import annotations

import asyncio
import base64
from typing import Any

from playwright.async_api import TimeoutError as PlaywrightTimeoutError

from ..core.config import settings
from ..exceptions import PortalError
from ..schemas.medico import DatosMedico, EstadoValidacion

# --- Selectores del DOM (confirmados contra la página viva) ------------------------
SELECTORS: dict[str, str] = {
    "tipo_doc": "#ctl00_cntContenido_ddlTipoIdentificacion",
    "num_doc": "#ctl00_cntContenido_txtNumeroIdentificacion",
    "primer_nombre": "#ctl00_cntContenido_txtPrimerNombre",
    "primer_apellido": "#ctl00_cntContenido_txtPrimerApellido",
    "captcha_img": "#imgCaptcha",
    "captcha_input": "#ctl00_cntContenido_txtCatpchaConfirmation",
    "submit": "#ctl00_cntContenido_btnVerificarIdentificacion",
    # Panel de contenido (acota el parseo para evitar el texto estático del encabezado).
    "content": "#ctl00_cntContenido",
}

# El captcha incorrecto se notifica con un alert JS de validación (no hay postback).
_DIALOG_CAPTCHA = ("confirmaci", "confirmaci", "imagen", "número de confirm", "numero de confirm")

# Palabras clave específicas de la ZONA DE RESULTADOS (no del encabezado estático).
_KW_NO_ENCONTRADO = (
    "no se encontr",
    "no se hallaron",
    "no existe registro",
    "no aparece",
    "ningún resultado",
    "no registra informaci",
)
_KW_AUTORIZADO = (
    "autorizado para ejercer",
    "se encuentra registrad",
    "habilitado para ejercer",
    "registro vigente",
)


def interpretar_resultado(texto: str) -> tuple[EstadoValidacion, DatosMedico | None]:
    """Clasifica el texto de la zona de resultados. Función pura (testeable).

    Orden: no encontrado > autorizado > (desconocido => error de portal).
    El captcha incorrecto NO pasa por aquí: se detecta antes vía el alert JS.
    """
    t = (texto or "").lower()

    if any(k in t for k in _KW_NO_ENCONTRADO):
        return EstadoValidacion.NO_ENCONTRADO, None

    if any(k in t for k in _KW_AUTORIZADO):
        sancionado = "sanci" in t and not any(
            x in t for x in ("no registra sanci", "sin sanci", "no presenta sanci")
        )
        datos = DatosMedico(
            autorizado_para_ejercer=True,
            sanciones="Registra sanciones" if sancionado else "Sin sanciones registradas",
        )
        return EstadoValidacion.AUTORIZADO, datos

    # Contenido no reconocido => el HTML cambió o estado inesperado.
    return EstadoValidacion.ERROR_PORTAL, None


async def navegar_y_captcha(page: Any) -> str:
    """Carga la consulta pública y devuelve el captcha como PNG base64."""
    try:
        await page.goto(settings.rethus_consulta_url, wait_until="domcontentloaded")
        await page.wait_for_selector(SELECTORS["captcha_img"])
        # Esperar a que la imagen del captcha esté realmente cargada (no en blanco).
        await page.wait_for_function(
            "() => { const i = document.querySelector('#imgCaptcha');"
            " return i && i.complete && i.naturalWidth > 0; }"
        )
        img = page.locator(SELECTORS["captcha_img"]).first
        png = await img.screenshot()
        return base64.b64encode(png).decode("ascii")
    except Exception as exc:  # noqa: BLE001
        raise PortalError(f"No se pudo cargar la consulta/captcha: {exc}") from exc


async def enviar_consulta(
    page: Any,
    tipo_documento: str,
    numero_documento: str,
    primer_nombre: str | None,
    primer_apellido: str | None,
    captcha_texto: str,
) -> tuple[EstadoValidacion, DatosMedico | None]:
    """Completa el formulario, dispara la verificación y devuelve el resultado parseado."""
    try:
        await page.select_option(SELECTORS["tipo_doc"], tipo_documento)
        await page.fill(SELECTORS["num_doc"], numero_documento)
        if primer_nombre:
            await page.fill(SELECTORS["primer_nombre"], primer_nombre)
        if primer_apellido:
            await page.fill(SELECTORS["primer_apellido"], primer_apellido)
        await page.fill(SELECTORS["captcha_input"], captcha_texto)

        # Un captcha inválido dispara un alert JS de validación (sin postback). Capturamos
        # el mensaje con un handler persistente y lo descartamos para no bloquear la página.
        dialogos: list[str] = []

        def _on_dialog(dialog: Any) -> None:
            dialogos.append(dialog.message or "")
            asyncio.create_task(dialog.dismiss())

        page.on("dialog", _on_dialog)
        try:
            await page.click(SELECTORS["submit"])
            try:
                await page.wait_for_load_state("networkidle", timeout=10000)
            except PlaywrightTimeoutError:
                pass
        finally:
            page.remove_listener("dialog", _on_dialog)

        if dialogos:
            mensaje = dialogos[0].lower()
            if any(k in mensaje for k in _DIALOG_CAPTCHA):
                return EstadoValidacion.CAPTCHA_INCORRECTO, None
            raise PortalError(f"Validación del portal: {dialogos[0]}")

        contenido = await page.inner_text(SELECTORS["content"])
    except PortalError:
        raise
    except Exception as exc:  # noqa: BLE001
        raise PortalError(f"Fallo al enviar la consulta: {exc}") from exc

    return interpretar_resultado(contenido)
