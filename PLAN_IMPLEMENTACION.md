# 📋 Plan de Implementación — Botathon 2025

> **Estado actual:** El proyecto está completo en código pero la base de datos Supabase fue eliminada. Este documento cubre todo lo necesario para volver a levantarlo y mejorarlo.

---

## Índice

1. [Recrear la Base de Datos](#1-recrear-la-base-de-datos)
2. [Configurar Variables de Entorno](#2-configurar-variables-de-entorno)
3. [Cargar Datos de Ejemplo](#3-cargar-datos-de-ejemplo)
4. [Fixes de Seguridad y Bugs](#4-fixes-de-seguridad-y-bugs)
5. [Optimizaciones de Base de Datos](#5-optimizaciones-de-base-de-datos)
6. [Arquitectura Multi-Agente con Google ADK](#6-arquitectura-multi-agente-con-google-adk)
7. [Integración en el Frontend](#7-integración-en-el-frontend)
8. [Roadmap de Ejecución](#8-roadmap-de-ejecución)

---

## 1. Recrear la Base de Datos

### 1.1 Crear nuevo proyecto en Supabase

1. Ir a [supabase.com](https://supabase.com) → **New Project**
2. Elegir nombre: `botathon-2025`
3. Contraseña fuerte (guardarla → es el `SUPABASE_PASSWORD`)
4. Región: `South America (São Paulo)` o la más cercana disponible
5. Esperar ~2 minutos

### 1.2 Obtener credenciales

Una vez creado, ir a **Settings → API**:

| Variable | Dónde encontrarla |
|----------|-------------------|
| `SUPABASE_URL` | Project URL (ej: `https://abc123.supabase.co`) |
| `SUPABASE_KEY` | `anon` `public` key |
| `SUPABASE_HOST` | Settings → Database → Host |
| `SUPABASE_USER` | Siempre `postgres` |
| `SUPABASE_PASSWORD` | La que pusiste al crear el proyecto |

### 1.3 Ejecutar la migración SQL

Ir a **SQL Editor** en el dashboard de Supabase y ejecutar el siguiente SQL completo:

```sql
-- ============================================================
-- BOTATHON 2025 — Schema inicial
-- Ejecutar en: Supabase → SQL Editor
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Función reutilizable para updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -------------------------------------------------
-- TABLA: skills
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS skills (
    id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE
);

-- -------------------------------------------------
-- TABLA: campaigns
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS campaigns (
    id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    year INT  NOT NULL DEFAULT EXTRACT(YEAR FROM NOW())
);

-- -------------------------------------------------
-- TABLA: users (Coordinadores y admins)
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name     TEXT,
    role          TEXT NOT NULL DEFAULT 'coordinator'
                      CHECK (role IN ('admin', 'coordinator', 'viewer')),
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- -------------------------------------------------
-- TABLA: volunteers
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS volunteers (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name           TEXT NOT NULL,
    email          TEXT UNIQUE,
    phone          TEXT,
    region         TEXT,
    city           TEXT,
    availability   TEXT,
    volunteer_type TEXT DEFAULT 'general',
    status         TEXT DEFAULT 'Activo'
                       CHECK (status IN ('Activo', 'Inactivo', 'Pendiente')),
    notes          TEXT,
    -- Campo generado para busqueda full-text
    search_vector  TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('spanish',
            coalesce(name, '') || ' ' ||
            coalesce(email, '') || ' ' ||
            coalesce(region, '') || ' ' ||
            coalesce(city, '')
        )
    ) STORED,
    created_at     TIMESTAMPTZ DEFAULT NOW(),
    updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER volunteers_updated_at
    BEFORE UPDATE ON volunteers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- -------------------------------------------------
-- TABLAS: relaciones Many-to-Many
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS volunteer_skills (
    volunteer_id UUID REFERENCES volunteers(id) ON DELETE CASCADE,
    skill_id     UUID REFERENCES skills(id) ON DELETE CASCADE,
    PRIMARY KEY (volunteer_id, skill_id)
);

CREATE TABLE IF NOT EXISTS volunteer_campaigns (
    volunteer_id UUID REFERENCES volunteers(id) ON DELETE CASCADE,
    campaign_id  UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    PRIMARY KEY (volunteer_id, campaign_id)
);

-- -------------------------------------------------
-- TABLA: segments
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS segments (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name       TEXT,
    filters    JSONB NOT NULL DEFAULT '{}',
    count      INT DEFAULT 0,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------
-- TABLA: tasks (Cola para Blue Prism)
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS tasks (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type          TEXT NOT NULL,
    status        TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    payload       JSONB DEFAULT '{}',
    result        JSONB DEFAULT '{}',
    error_message TEXT,
    bot_id        TEXT,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- -------------------------------------------------
-- TABLA: logs
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS logs (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source     TEXT NOT NULL CHECK (source IN ('SYSTEM', 'USER', 'API', 'BOT', 'AGENT')),
    level      TEXT NOT NULL CHECK (level IN ('INFO', 'WARNING', 'ERROR', 'CRITICAL')),
    message    TEXT NOT NULL,
    details    JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------
-- TABLA: notifications
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
    title      TEXT NOT NULL,
    message    TEXT,
    read       BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------
-- TABLA: configurations (Config del sistema)
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS configurations (
    key        TEXT PRIMARY KEY,
    value      TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Valores por defecto
INSERT INTO configurations (key, value) VALUES
    ('gmail_email', ''),
    ('gmail_token', ''),
    ('max_emails_per_batch', '50'),
    ('bot_poll_interval_seconds', '30')
ON CONFLICT (key) DO NOTHING;

-- -------------------------------------------------
-- INDICES DE RENDIMIENTO
-- -------------------------------------------------
-- Full-text search (GIN es el indice correcto para busqueda de texto)
CREATE INDEX IF NOT EXISTS idx_volunteers_fts
    ON volunteers USING GIN(search_vector);

CREATE INDEX IF NOT EXISTS idx_volunteers_region       ON volunteers(region);
CREATE INDEX IF NOT EXISTS idx_volunteers_status       ON volunteers(status);
CREATE INDEX IF NOT EXISTS idx_volunteers_availability ON volunteers(availability);
CREATE INDEX IF NOT EXISTS idx_tasks_status_created    ON tasks(status, created_at);
CREATE INDEX IF NOT EXISTS idx_logs_created_at         ON logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_level              ON logs(level);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);

-- -------------------------------------------------
-- FUNCION RPC: metricas por region
-- (Reemplaza el COUNT en Python — mucho mas eficiente)
-- -------------------------------------------------
CREATE OR REPLACE FUNCTION get_volunteer_metrics_by_region()
RETURNS TABLE(region TEXT, total BIGINT, activos BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT
        v.region,
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE v.status = 'Activo') AS activos
    FROM volunteers v
    GROUP BY v.region
    ORDER BY total DESC;
END;
$$ LANGUAGE plpgsql;

-- -------------------------------------------------
-- FUNCION RPC: busqueda full-text de voluntarios
-- -------------------------------------------------
CREATE OR REPLACE FUNCTION buscar_voluntarios(termino TEXT)
RETURNS SETOF volunteers AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM volunteers
    WHERE search_vector @@ plainto_tsquery('spanish', termino)
    ORDER BY ts_rank(search_vector, plainto_tsquery('spanish', termino)) DESC;
END;
$$ LANGUAGE plpgsql;

-- -------------------------------------------------
-- ROW LEVEL SECURITY
-- El backend usa service_role → bypasea RLS automaticamente.
-- RLS protege el acceso directo con anon key (ej: desde el browser).
-- -------------------------------------------------
ALTER TABLE users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers     ENABLE ROW LEVEL SECURITY;
ALTER TABLE segments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks          ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications  ENABLE ROW LEVEL SECURITY;
ALTER TABLE configurations ENABLE ROW LEVEL SECURITY;
```

> **Despues de ejecutar el schema**, pegar tambien el contenido de `backend/inserts.sql` para cargar los datos de ejemplo.

---

## 2. Configurar Variables de Entorno

### `backend/.env`

```bash
# === Supabase ===
SUPABASE_URL=https://TU_PROJECT_ID.supabase.co
SUPABASE_KEY=eyJ...TU_ANON_KEY...
SUPABASE_USER=postgres
SUPABASE_PASSWORD=TU_PASSWORD_DEL_PROYECTO
SUPABASE_HOST=db.TU_PROJECT_ID.supabase.co
SUPABASE_PORT=5432
SUPABASE_DB=postgres

# === JWT ===
# Generar con: python3 -c "import secrets; print(secrets.token_hex(32))"
SECRET_KEY=GENERA_UNO_ALEATORIO_AQUI

# === Blue Prism ===
BLUE_PRISM_API_KEY=GENERA_UNO_ALEATORIO_AQUI

# === Google Gemini (para los agentes) ===
GOOGLE_API_KEY=TU_API_KEY_DE_AI_STUDIO

# === CORS ===
ALLOWED_ORIGINS=http://localhost:3000,https://tu-dominio.vercel.app
```

### `.env` (raiz — para Docker y Next.js)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
SUPABASE_URL=https://TU_PROJECT_ID.supabase.co
SUPABASE_KEY=eyJ...TU_ANON_KEY...
SECRET_KEY=LA_MISMA_QUE_EN_BACKEND
```

> **Como conseguir la Google API Key:**
> Ir a [aistudio.google.com](https://aistudio.google.com) → "Get API Key" → "Create API key". Es gratuita en el tier basico.

---

## 3. Cargar Datos de Ejemplo

```bash
# Opcion A: desde el SQL Editor de Supabase
# Pegar el contenido de backend/inserts.sql

# Opcion B: script Python
cd backend
source .venv/bin/activate
python create_sample_data.py
python create_admin.py   # Crear usuario admin inicial
```

---

## 4. Fixes de Seguridad y Bugs

### 4.1 `backend/app/core/config.py` — SECRET_KEY sin default

```python
# ANTES (inseguro — si no hay .env, usa "changeme")
SECRET_KEY: str = "changeme"

# DESPUES (falla al arrancar si no esta configurado)
SECRET_KEY: str
```

### 4.2 `backend/app/main.py` — CORS restringido

```python
import os
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
CORS(app, resources={r"/api/*": {"origins": ALLOWED_ORIGINS}})
```

### 4.3 `lib/api.ts` — URL dinamica

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
```

### 4.4 `.gitignore` — remover script de debug

```bash
echo "debug_db_connection.py" >> .gitignore
```

---

## 5. Optimizaciones de Base de Datos

Ya incluidas en el SQL del paso 1. Resumen:

| Optimizacion | Que hace | Por que importa |
|-------------|----------|-----------------|
| `tsvector` + indice GIN | Busqueda full-text sobre nombre/email/region | x10 mas rapido que ILIKE |
| RPC `get_volunteer_metrics_by_region` | GROUP BY en la DB | Evita traer miles de filas a Python |
| Indice `idx_tasks_status_created` | Sobre status + fecha | Los bots consultan esto cada 30s |
| RLS con `service_role` | Solo el backend puede escribir/leer | Protege el acceso directo al SDK del browser |

**Cambios en el backend para aprovechar las RPCs:**

```python
# metrics.py — ANTES (trae todos los datos a Python)
response = supabase.table("volunteers").select("region").execute()
# ... loop en Python para contar

# metrics.py — DESPUES (la DB hace el GROUP BY)
response = supabase.rpc("get_volunteer_metrics_by_region").execute()
return jsonify(response.data)
```

```python
# volunteers.py — ANTES
query = query.or_(f"full_name.ilike.%{search}%,email.ilike.%{search}%")

# volunteers.py — DESPUES (usa indice GIN)
response = supabase.rpc("buscar_voluntarios", {"termino": search}).execute()
```

---

## 6. Arquitectura Multi-Agente con Google ADK

### Por que multi-agente?

El modulo `/asistente` necesita:
1. **Consultar la DB** (buscar voluntarios, crear segmentos, obtener metricas)
2. **Enviar correos** (redactar, personalizar, registrar el envio)
3. **En el futuro:** generar reportes, gestionar bots, actualizar campanas

Con agentes especializados, cada uno tiene un rol claro y agregar uno nuevo no toca a los existentes.

### Instalacion

```bash
cd backend
pip install google-adk
echo "google-adk>=0.1.0" >> requirements.txt
```

Agregar `GOOGLE_API_KEY` al `backend/.env`.

### Estructura de archivos a crear

```
backend/
└── app/
    └── agents/
        ├── __init__.py
        ├── db_agent.py        # Agente especialista en base de datos
        ├── email_agent.py     # Agente especialista en correos
        └── orchestrator.py    # Orquestador principal
```

### `backend/app/agents/db_agent.py`

```python
"""
Agente especializado en operaciones de base de datos.
Lee, crea, actualiza y busca en Supabase.
"""
from google.adk.agents import LlmAgent
from google.adk.tools import FunctionTool
from app.core.client import supabase


def buscar_voluntarios(
    region: str = None,
    skill: str = None,
    disponibilidad: str = None,
    estado: str = "Activo",
    texto_libre: str = None,
    limite: int = 20
) -> dict:
    """
    Busca voluntarios en la base de datos con los criterios dados.

    Args:
        region: Region geografica (ej: "Biobio", "Metropolitana")
        skill: Habilidad especifica (ej: "Primeros Auxilios", "Cocina")
        disponibilidad: Disponibilidad horaria (ej: "Lunes a Viernes", "Mananas")
        estado: Estado del voluntario. Por defecto "Activo"
        texto_libre: Busqueda por nombre o email (usa full-text search)
        limite: Numero maximo de resultados. Por defecto 20.
    """
    if texto_libre:
        resp = supabase.rpc("buscar_voluntarios", {"termino": texto_libre}).execute()
        data = resp.data
    else:
        q = supabase.table("volunteers").select("*, skills(*), campaigns(*)")
        if region:
            q = q.ilike("region", f"%{region}%")
        if disponibilidad:
            q = q.ilike("availability", f"%{disponibilidad}%")
        if estado:
            q = q.eq("status", estado)
        resp = q.limit(limite).execute()
        data = resp.data

    if skill and data:
        data = [
            v for v in data
            if any(skill.lower() in s["name"].lower() for s in v.get("skills", []))
        ]

    return {
        "total": len(data),
        "voluntarios": [
            {
                "id": v["id"],
                "nombre": v["name"],
                "email": v["email"],
                "region": v.get("region"),
                "disponibilidad": v.get("availability"),
                "estado": v.get("status"),
                "habilidades": [s["name"] for s in v.get("skills", [])],
                "campanas": [c["name"] for c in v.get("campaigns", [])]
            }
            for v in data
        ]
    }


def obtener_metricas_generales() -> dict:
    """Retorna metricas generales: total voluntarios, por region."""
    total_resp = supabase.table("volunteers").select("id", count="exact", head=True).execute()
    regiones_resp = supabase.rpc("get_volunteer_metrics_by_region").execute()
    return {
        "total_voluntarios": total_resp.count,
        "por_region": regiones_resp.data
    }


def crear_segmento(nombre: str, filtros: dict) -> dict:
    """
    Guarda un segmento de voluntarios en la DB para usarlo despues.

    Args:
        nombre: Nombre descriptivo (ej: "Voluntarios Biobio Primeros Auxilios")
        filtros: Dict con los criterios (region, skill, disponibilidad, etc.)
    """
    resp = supabase.table("segments").insert({
        "name": nombre,
        "filters": filtros,
        "count": 0
    }).execute()
    return {"id": resp.data[0]["id"], "nombre": nombre, "filtros": filtros}


def obtener_campanas() -> dict:
    """Retorna todas las campanas registradas."""
    resp = supabase.table("campaigns").select("*").execute()
    return {"campanas": resp.data}


db_agent = LlmAgent(
    name="agente_base_de_datos",
    model="gemini-2.0-flash",
    description=(
        "Especialista en consultar y gestionar la base de datos de voluntarios. "
        "Puede buscar voluntarios por region, habilidad o disponibilidad, "
        "obtener metricas, crear segmentos y listar campanas."
    ),
    instruction=(
        "Eres un especialista en base de datos de voluntarios. "
        "Usa siempre los filtros mas especificos posibles. "
        "Presenta los resultados con nombre, region y habilidades. "
        "Si hay muchos resultados, sugiere refinar la busqueda."
    ),
    tools=[
        FunctionTool(buscar_voluntarios),
        FunctionTool(obtener_metricas_generales),
        FunctionTool(crear_segmento),
        FunctionTool(obtener_campanas),
    ]
)
```

### `backend/app/agents/email_agent.py`

```python
"""
Agente especializado en comunicaciones por correo electronico.
Redacta, previsualiza y envia correos a voluntarios.
"""
from google.adk.agents import LlmAgent
from google.adk.tools import FunctionTool
from app.core.client import supabase
from app.services.email_service import send_email


def previsualizar_correos(
    volunteer_ids: list,
    asunto: str,
    mensaje_template: str
) -> dict:
    """
    Vista previa de los correos antes de enviarlos (muestra 3 ejemplos).

    Args:
        volunteer_ids: Lista de IDs de voluntarios
        asunto: Asunto del correo
        mensaje_template: Plantilla con {{nombre}}, {{region}}, {{disponibilidad}}
    """
    previews = []
    for vol_id in volunteer_ids[:3]:
        vol = supabase.table("volunteers").select("*").eq("id", vol_id).single().execute().data
        if not vol:
            continue
        mensaje = mensaje_template \
            .replace("{{nombre}}", vol.get("name", "Voluntario")) \
            .replace("{{region}}", vol.get("region", "")) \
            .replace("{{disponibilidad}}", vol.get("availability", ""))
        previews.append({
            "nombre": vol["name"],
            "email": vol["email"],
            "mensaje_preview": mensaje
        })
    return {
        "total_destinatarios": len(volunteer_ids),
        "previews": previews,
        "nota": f"Mostrando {len(previews)} de {len(volunteer_ids)} destinatarios"
    }


def enviar_correos(
    volunteer_ids: list,
    asunto: str,
    mensaje_template: str
) -> dict:
    """
    Envia correos personalizados a los voluntarios de la lista.

    Args:
        volunteer_ids: Lista de IDs de voluntarios
        asunto: Asunto del correo
        mensaje_template: Cuerpo con {{nombre}}, {{region}}, {{disponibilidad}}
    """
    enviados = 0
    errores = []

    for vol_id in volunteer_ids:
        try:
            vol = supabase.table("volunteers").select("*").eq("id", vol_id).single().execute().data
            if not vol or not vol.get("email"):
                continue
            mensaje = mensaje_template \
                .replace("{{nombre}}", vol.get("name", "Voluntario")) \
                .replace("{{region}}", vol.get("region", "")) \
                .replace("{{disponibilidad}}", vol.get("availability", ""))
            send_email(vol["email"], asunto, mensaje)
            enviados += 1
        except Exception as e:
            errores.append(f"{vol_id}: {str(e)}")

    supabase.table("logs").insert({
        "source": "AGENT",
        "level": "INFO",
        "message": f"Agente IA envio {enviados} correos. Asunto: {asunto}",
        "details": {"volunteer_ids": volunteer_ids, "enviados": enviados, "errores": errores}
    }).execute()

    return {"enviados": enviados, "total": len(volunteer_ids), "errores": errores or None}


def obtener_plantillas() -> dict:
    """Retorna plantillas de correo predefinidas."""
    return {
        "plantillas": [
            {
                "nombre": "Invitacion a campana",
                "template": (
                    "Hola {{nombre}},\n\n"
                    "Te escribimos para invitarte a participar en nuestra proxima campana "
                    "en {{region}}. Sabemos que tienes disponibilidad {{disponibilidad}}, "
                    "por lo que creemos que seras un gran aporte.\n\n"
                    "¿Puedes confirmarnos tu disponibilidad?\n\n"
                    "El equipo de Coordinacion"
                )
            },
            {
                "nombre": "Recordatorio",
                "template": (
                    "Hola {{nombre}},\n\n"
                    "Te recordamos que tienes una actividad proxima en {{region}}.\n\n"
                    "El equipo de Coordinacion"
                )
            }
        ]
    }


email_agent = LlmAgent(
    name="agente_correos",
    model="gemini-2.0-flash",
    description=(
        "Especialista en comunicaciones por correo. "
        "Redacta y envia correos personalizados a voluntarios."
    ),
    instruction=(
        "Eres un especialista en comunicaciones. "
        "SIEMPRE muestra previsualizar antes de enviar y pide confirmacion. "
        "Personaliza los mensajes para que sean calidos y directos."
    ),
    tools=[
        FunctionTool(previsualizar_correos),
        FunctionTool(enviar_correos),
        FunctionTool(obtener_plantillas),
    ]
)
```

### `backend/app/agents/orchestrator.py`

```python
"""
Orquestador principal del asistente.
Delega a los agentes especializados segun la tarea.
Para agregar un nuevo agente: importarlo y sumarlo a sub_agents.
"""
from google.adk.agents import LlmAgent
from app.agents.db_agent import db_agent
from app.agents.email_agent import email_agent

orchestrator = LlmAgent(
    name="asistente_coordinador",
    model="gemini-2.0-flash",
    description="Asistente principal para coordinadores de campanas de voluntarios.",
    instruction="""
Eres el asistente de coordinacion de campanas de voluntarios. Ayudas a los coordinadores
a identificar los mejores voluntarios para cada campana y a comunicarse con ellos.

Flujo recomendado:
1. Cuando pidan voluntarios → delega al agente_base_de_datos
2. Cuando quieran enviar correos → PRIMERO previsualizar, LUEGO confirmar y enviar
3. Mantener el contexto entre turnos (recordar los IDs de voluntarios encontrados)

Siempre habla en espanol. Se proactivo: si encontraste voluntarios, ofrece los correos.
Confirma antes de acciones irreversibles.
""",
    sub_agents=[
        db_agent,
        email_agent,
        # Agregar nuevos agentes aqui (no tocar nada mas):
        # report_agent,
        # analytics_agent,
        # bot_management_agent,
    ]
)
```

### `backend/app/api/v1/endpoints/assistant.py`

```python
from flask import Blueprint, request, jsonify
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types
from app.agents.orchestrator import orchestrator
from app.core.security import require_role

assistant_bp = Blueprint("assistant", __name__)
session_service = InMemorySessionService()
runner = Runner(
    agent=orchestrator,
    app_name="botathon_assistant",
    session_service=session_service
)

@assistant_bp.route("/chat", methods=["POST"])
@require_role("coordinator")
def chat():
    data = request.json
    message = data.get("message", "").strip()
    session_id = data.get("session_id", "default")

    if not message:
        return jsonify({"error": "El mensaje no puede estar vacio"}), 400

    try:
        try:
            session_service.get_session(
                app_name="botathon_assistant",
                user_id="coordinator",
                session_id=session_id
            )
        except Exception:
            session_service.create_session(
                app_name="botathon_assistant",
                user_id="coordinator",
                session_id=session_id
            )

        content = types.Content(role="user", parts=[types.Part(text=message)])
        response_text = ""

        for event in runner.run(
            user_id="coordinator",
            session_id=session_id,
            new_message=content
        ):
            if event.is_final_response() and event.content:
                for part in event.content.parts:
                    if part.text:
                        response_text += part.text

        return jsonify({"response": response_text, "session_id": session_id})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
```

### Registrar en `backend/app/api/v1/router.py`

```python
from app.api.v1.endpoints.assistant import assistant_bp
# ...
api_bp.register_blueprint(assistant_bp, url_prefix='/assistant')
```

---

## 7. Integracion en el Frontend

Conectar la pagina `/asistente` al endpoint `/api/v1/assistant/chat`:

```typescript
// app/asistente/page.tsx
"use client"
import { useState, useRef } from "react"

export default function AsistentePage() {
    const [messages, setMessages] = useState([
        { role: "assistant", text: "Hola! Puedo buscar voluntarios y enviarles correos. Como empezamos?" }
    ])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const sessionId = useRef(crypto.randomUUID())

    async function sendMessage() {
        if (!input.trim() || loading) return
        const userMsg = input.trim()
        setInput("")
        setMessages(prev => [...prev, { role: "user", text: userMsg }])
        setLoading(true)

        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/assistant/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ message: userMsg, session_id: sessionId.current })
            })
            const data = await res.json()
            setMessages(prev => [...prev, { role: "assistant", text: data.response }])
        } catch {
            setMessages(prev => [...prev, {
                role: "assistant",
                text: "Hubo un error. Por favor, intenta nuevamente."
            }])
        } finally {
            setLoading(false)
        }
    }

    // ... renderizar los mensajes y el input
}
```

---

## 8. Roadmap de Ejecucion

### Fase 1 — Levantar el proyecto (1-2 horas)

- [ ] Crear proyecto Supabase
- [ ] Ejecutar SQL del schema (paso 1.3)
- [ ] Cargar `backend/inserts.sql` con datos de ejemplo
- [ ] Configurar `backend/.env`
- [ ] Configurar `.env` en la raiz
- [ ] `pip install -r requirements.txt && python -m app.main` (verificar backend)
- [ ] `pnpm dev` (verificar frontend en localhost:3000)

### Fase 2 — Security fixes (30 min)

- [ ] Fix `SECRET_KEY` sin default en `config.py`
- [ ] Fix CORS con `ALLOWED_ORIGINS` en `main.py`
- [ ] Fix `API_BASE_URL` dinamica en `lib/api.ts`
- [ ] Agregar `debug_db_connection.py` al `.gitignore`

### Fase 3 — Optimizaciones de DB (1 hora)

- [ ] Reemplazar `ILIKE` con RPC `buscar_voluntarios` en `volunteers.py`
- [ ] Reemplazar metricas en Python con RPC en `metrics.py`

### Fase 4 — Agentes IA (2-3 horas)

- [ ] `pip install google-adk`
- [ ] Agregar `GOOGLE_API_KEY` al `backend/.env`
- [ ] Crear `backend/app/agents/__init__.py`
- [ ] Crear `backend/app/agents/db_agent.py`
- [ ] Crear `backend/app/agents/email_agent.py`
- [ ] Crear `backend/app/agents/orchestrator.py`
- [ ] Crear `backend/app/api/v1/endpoints/assistant.py`
- [ ] Registrar `assistant_bp` en `router.py`
- [ ] Conectar frontend `/asistente` al endpoint

### Fase 5 — Produccion (cuando llegue)

- [ ] Reemplazar Gmail API por SendGrid o Resend
- [ ] Rate limiting en `/auth/login`
- [ ] Reemplazar `InMemorySessionService` por Redis
- [ ] Variables de entorno en Vercel para produccion
- [ ] Activar `NEXT_TELEMETRY_DISABLED=1` en Dockerfile

---

## Diagrama Final de Arquitectura

```
FRONTEND (Next.js :3000)
  /login  /voluntarios  /asistente  /comunicaciones  /logs
        |
        | JWT Bearer Token
        v
BACKEND (Flask :8000)
  /api/v1/auth          -> Autenticacion JWT
  /api/v1/voluntarios   -> CRUD voluntarios
  /api/v1/metrics       -> Metricas via RPC Supabase
  /api/v1/segmentation  -> Segmentos guardados
  /api/v1/communications -> Envio de correos
  /api/v1/bots          -> Cola de tareas Blue Prism
  /api/v1/assistant     -> Chat con agentes IA
        |
        |--- GOOGLE ADK (Multi-Agente) ---|
        |    [Orquestador]               |
        |        |-- [Agente DB]    -> Supabase
        |        |-- [Agente Email] -> Gmail API
        |        `-- [Agente X]     -> futuro
        |----------------------------------------|
        |
        | Supabase Python SDK
        v
SUPABASE (PostgreSQL)
  Tablas: volunteers / skills / campaigns / users
          segments / tasks / logs / notifications / configurations
  Indices: GIN full-text, region, status, tasks, logs
  RPCs: get_volunteer_metrics_by_region / buscar_voluntarios
  RLS: solo service_role tiene acceso completo
        ^
        | X-API-Key
BLUE PRISM BOTS (externos)
```
