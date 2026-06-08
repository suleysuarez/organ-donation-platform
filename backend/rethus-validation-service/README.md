# RETHUS Validation Service

Microservicio **FastAPI** que valida si un médico está inscrito y autorizado para ejercer en
Colombia, consultando el registro **RETHUS** del portal público de **SISPRO** mediante web scraping
con **Playwright**.

> Forma parte de la plataforma de gestión de donación de órganos. Resuelve la verificación de
> médicos que estaba PENDIENTE en el diseño de la base de datos.

## Por qué 2 pasos (captcha humano en el flujo)

La consulta pública de RETHUS es ASP.NET WebForms (ViewState + sesión por cookies) y exige un
**captcha de imagen**. La decisión del equipo es que **el propio médico resuelva su captcha** al
registrarse. Eso obliga a mantener viva la sesión del navegador entre dos llamadas:

1. `POST /validar-medico/iniciar` → abre la sesión, devuelve `session_id` + `captcha_imagen_base64`.
2. `POST /validar-medico` → recibe `session_id` + documento + `captcha_texto`, consulta y responde.

### Contrato

**Paso 1 — iniciar**
```http
POST /validar-medico/iniciar
→ 200 { "session_id": "...", "captcha_imagen_base64": "<png base64>", "expira_en_segundos": 180 }
```

**Paso 2 — validar**
```http
POST /validar-medico
{
  "session_id": "...",
  "tipo_documento": "CC",          // CC, CE, PT, TI (los que ofrece la consulta pública)
  "numero_documento": "12345678",
  "primer_nombre": "JUAN",         // opcional
  "primer_apellido": "PEREZ",      // opcional
  "captcha_texto": "1234"
}
→ 200 {
  "encontrado": true,
  "estado": "AUTORIZADO",          // AUTORIZADO | NO_ENCONTRADO | CAPTCHA_INCORRECTO | SESION_EXPIRADA | ERROR_PORTAL
  "datos": { "nombre_completo": null, "profesion_perfil": null,
             "fecha_registro": null, "autorizado_para_ejercer": true,
             "sanciones": "Sin sanciones registradas" },
  "mensaje": "..."
}
```
Si el estado es `CAPTCHA_INCORRECTO` o `SESION_EXPIRADA`, el cliente repite el paso 1.

## Estructura (por capas)

```
app/
  main.py            # FastAPI + lifespan (Playwright) + create_app() factory
  core/config.py     # Settings (.env)
  api/v1/            # router + endpoints/medico.py
  schemas/medico.py  # DTOs Pydantic (enums + request/response)
  services/          # rethus_service.py (orquestación)
  scraper/           # browser.py (Playwright) + rethus_scraper.py (interacciones + parser puro)
  session/           # session_store.py (sesiones vivas con TTL)
  exceptions.py
tests/               # endpoints (servicio mockeado) + parser puro
```

## Ejecutar

```bash
cd backend/rethus-validation-service
python -m venv .venv && source .venv/Scripts/activate   # Windows Git Bash
pip install -r requirements.txt
playwright install chromium
cp .env.example .env
uvicorn app.main:app --reload --workers 1
# Swagger: http://localhost:8000/docs
```

Para depurar el scraping viendo el navegador: `PLAYWRIGHT_HEADLESS=false` en `.env`.

## Tests

```bash
pytest
```
Los tests **no** abren navegador: usan un servicio mockeado (endpoints) y prueban el parser puro.

## Estado de validación contra el portal real

- ✅ **URL pública confirmada:** `…/THS/Cliente/ConsultasPublicas/ConsultaPublicaDeTHxIdentificacion.aspx`
  (consulta de ciudadanos, **sin login** — distinta de "Consultar mi información", que pide contraseña).
- ✅ **Selectores confirmados** contra el DOM (ids `ctl00$cntContenido$...`) en `SELECTORS`.
- ✅ **Captcha:** se obtiene como imagen (`#imgCaptcha`) y el **captcha incorrecto** se detecta vía el
  alert JS de validación ("Verifique el Número de Confirmación") → `CAPTCHA_INCORRECTO`. Probado en vivo.

### ⚠️ Pendiente / caveats
- **Calibrar AUTORIZADO / NO_ENCONTRADO.** El texto exacto de la zona de resultados (tras un captcha
  válido) no se pudo observar automáticamente (el captcha lo resuelve un humano). El parser
  `interpretar_resultado` usa keywords razonables; **confírmalas en QA** resolviendo un captcha real con
  un documento existente y otro inexistente, y ajusta `_KW_AUTORIZADO` / `_KW_NO_ENCONTRADO`.
- **Concurrencia.** El `session_store` es en memoria → ejecutar con **un solo worker**. Para escalar:
  store externo (Redis) o sesiones serializadas.
- **Fragilidad/ToS.** Es scraping de un portal gubernamental: puede romperse si cambian el HTML. Uso
  respetuoso (1 sesión por acción del usuario, el médico resuelve su propio captcha, con rate limiting).

## Integración

El `auth-service` (Java) puede llamar a `/validar-medico` durante el registro del médico y mapear el
resultado a `auth.medical_professional_profiles.verification_status` (ver `database/schema.sql`).
Este microservicio solo valida y responde; no toca la base de datos.
