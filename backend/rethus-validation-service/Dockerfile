# Imagen oficial de Playwright (trae Chromium + dependencias del SO ya instaladas).
FROM mcr.microsoft.com/playwright/python:v1.48.0-jammy

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

EXPOSE 8000

# Un solo worker: el session_store es en memoria (ver README, caveat de concurrencia).
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
