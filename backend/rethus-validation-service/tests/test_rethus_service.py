"""Tests de la función pura de parseo del resultado del portal (sin navegador)."""
from app.scraper.rethus_scraper import interpretar_resultado
from app.schemas.medico import EstadoValidacion


# Nota: el captcha incorrecto NO pasa por interpretar_resultado; se detecta antes
# vía el alert JS de validación en rethus_scraper.enviar_consulta.


def test_no_encontrado():
    html = "<div>No se encontró información para el documento consultado.</div>"
    estado, datos = interpretar_resultado(html)
    assert estado == EstadoValidacion.NO_ENCONTRADO
    assert datos is None


def test_autorizado_sin_sanciones():
    html = (
        "<table><tr><td>Profesión: Medicina</td>"
        "<td>Autorizado para ejercer</td>"
        "<td>No registra sanciones</td></tr></table>"
    )
    estado, datos = interpretar_resultado(html)
    assert estado == EstadoValidacion.AUTORIZADO
    assert datos is not None
    assert datos.autorizado_para_ejercer is True
    assert datos.sanciones == "Sin sanciones registradas"


def test_contenido_desconocido_es_error_portal():
    estado, datos = interpretar_resultado("<html><body>página rara</body></html>")
    assert estado == EstadoValidacion.ERROR_PORTAL
    assert datos is None


def test_texto_vacio_es_error_portal():
    estado, _ = interpretar_resultado("")
    assert estado == EstadoValidacion.ERROR_PORTAL
