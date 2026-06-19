# Explicación del modelo de datos — Plataforma de Donación de Órganos

> Documento explicativo a nivel **Entidad-Relación (MER conceptual)**, no del DDL.
> Objetivo: entender *qué representa cada tabla en el mundo real* y *por qué está
> separada así* (su granularidad). Complementa a [`schema.sql`](schema.sql).

## La idea en una frase

El sistema gira en torno a tres "actores" del mundo real —**usuarios**, **donantes** y
**receptores**— y a un **proceso de donación** que los conecta y al que se le hace
**seguimiento en el tiempo**. Cada tabla representa *un tipo de cosa del mundo real*
(una entidad), y las relaciones son las "líneas" que las unen.

Dos conceptos previos:

- **Entidad:** un sustantivo del que queremos guardar información (un usuario, un donante, un proceso).
- **Granularidad:** "¿qué representa **una fila** de esta tabla?". Es la pregunta más importante
  del diseño. Si una fila = una persona, el grano es "por persona"; si una fila = un cambio de
  estado, el grano es "por evento". Mezclar granos en una misma tabla es el error clásico que evitamos.

---

## Las entidades, una por una

### 1. `users` — grano: **una cuenta de acceso**
Una fila = una persona que puede iniciar sesión. Guarda lo mínimo para autenticar: correo,
contraseña (cifrada) y su **rol** (médico, donante o receptor).

*¿Por qué no meter aquí también los datos del médico o del donante?* Porque no todos los
usuarios son iguales. Un donante no tiene "número de registro RETHUS", y un médico no necesita
"tipo de sangre". Si pusiéramos todo junto, la mitad de las columnas estarían vacías según el rol.
Por eso `users` solo tiene lo común a **todos**, y los datos específicos van en tablas aparte.

### 2. `medical_professional_profiles` — grano: **un médico**
Una fila = el perfil profesional de **un** médico. Aquí van sus datos (documento, número RETHUS,
certificado, estado de verificación).

Se relaciona con `users` **1 a 1**: cada médico es exactamente un usuario, y cada usuario-médico
tiene un solo perfil. Es como el carnet profesional que se "engancha" a la cuenta.

### 3. `donors` — grano: **un donante**
Una fila = una persona donante. Datos personales + clínicos básicos (tipo de sangre, notas, foto).

Tiene una línea hacia `users` que dice **"registrado por"**: cada donante fue dado de alta por un
médico. Un médico registra muchos donantes → relación **1 a muchos** (1 médico : N donantes).

### 4. `donor_organs` — grano: **un órgano ofrecido por un donante**
La tabla que más suele costar entender. Una fila **no** es un donante: es
**"este donante ofrece este órgano"**.

*¿Por qué una tabla solo para esto?* Porque un donante puede ofrecer **varios** órganos (riñón,
hígado, córneas…). Si los metiéramos en `donors`, tendríamos que inventar columnas como
`organo_1`, `organo_2`, `organo_3`… algo rígido: ¿qué pasa si alguien ofrece 5? Separándolo, un
donante con 3 órganos simplemente tiene **3 filas** aquí. Esto es **normalización**: una relación
"muchos" se modela con su propia tabla. Relación: **1 donante : N órganos**.

### 5. `recipients` — grano: **un receptor (paciente)**
Una fila = un paciente que **necesita** un órgano. Igual que `donors`, pero del otro lado: en vez
de "qué ofrece", guarda "qué necesita" (`organ_needed`) y con qué **urgencia**. También tiene su
"registrado por" hacia `users`.

### 6. `donation_processes` — grano: **un caso/proceso de donación**
El corazón del sistema. Una fila = **un proceso** que puede vincular a un donante y/o a un receptor,
y que tiene un **estado actual** (registrado, en evaluación, en espera, match encontrado, completado,
cancelado…).

Es el "expediente" o la "carpeta del caso". El donante y el receptor son **opcionales** a propósito:
a veces se abre un proceso teniendo solo al donante, y el receptor aparece después (o al revés).

### 7. `process_status_history` — grano: **un cambio de estado**
La clave de la **trazabilidad** (historias HU-09 y HU-10). Una fila **no** es un proceso: es
**"el proceso X pasó del estado A al estado B, tal día, hecho por tal médico, con esta observación
clínica"**.

*¿Por qué no guardar solo el estado actual en `donation_processes` y ya?* Porque la auditoría médica
querrá el **historial completo**: cuándo entró en evaluación, quién lo aprobó, qué se observó en cada
paso. `donation_processes` guarda **dónde está ahora**; `process_status_history` guarda **todo el
camino recorrido**. Cada paso = una fila. Relación: **1 proceso : N cambios de estado**.

Es un patrón clásico: **"estado actual + bitácora de eventos"**. El "ahora" se lee rápido de una
tabla; la "película completa" se reconstruye de la otra.

### 8. `process_documents` — grano: **un archivo adjunto a un proceso**
Una fila = un documento clínico subido a un caso. **Detalle importante de diseño:** aquí NO
guardamos la imagen/PDF en sí, solo la **ruta al archivo** (`file_path`) que vive en la carpeta
`uploads/` del backend. La base de datos guarda *dónde está* el archivo, no el archivo. Esto
mantiene la DB liviana y rápida. Relación: **1 proceso : N documentos**.

---

## El mapa de relaciones (cardinalidades)

Leído como frases del mundo real:

- Un **usuario** puede tener un **perfil de médico** → **1 : 1**
- Un **médico** registra muchos **donantes** y muchos **receptores** → **1 : N**
- Un **donante** ofrece muchos **órganos** → **1 : N**
- Un **proceso** involucra (opcionalmente) un donante y un receptor → **N : 1** hacia cada uno
- Un **proceso** acumula muchos **cambios de estado** y muchos **documentos** → **1 : N**

```
users ─1:1─ medical_professional_profiles
  │
  ├─1:N→ donors ─1:N→ donor_organs
  │         └────────────┐
  ├─1:N→ recipients ──┐   │
  │                   ▼   ▼
  └─1:N→ donation_processes ─1:N→ process_status_history
                       └────────1:N→ process_documents
```

---

## Las 3 decisiones de diseño que conviene defender

1. **Separar identidad (`users`) de perfil (médico/donante/receptor).** Evita columnas vacías y
   permite que cada rol crezca con sus propios campos sin estorbar a los demás.
2. **Tablas "hijas" para los `muchos`** (`donor_organs`, `process_status_history`,
   `process_documents`). Cada vez que algo puede repetirse N veces, se le da su propia tabla en
   lugar de columnas numeradas. Eso es normalización y hace el modelo flexible.
3. **Estado actual + historial.** `donation_processes` dice *dónde está* el caso;
   `process_status_history` conserva *cómo llegó ahí*. Sin esto no habría trazabilidad clínica.

---

## Cierre

> "Cada tabla responde a una sola pregunta del mundo real, y las tablas con granularidad fina
> (`donor_organs`, `process_status_history`, `process_documents`) existen porque modelan relaciones
> de *uno a muchos*: separarlas nos da flexibilidad, evita datos vacíos y nos permite reconstruir el
> historial completo de cada proceso de donación."
