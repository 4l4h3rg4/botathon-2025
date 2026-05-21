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
    model="gemini-2.5-flash",
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
