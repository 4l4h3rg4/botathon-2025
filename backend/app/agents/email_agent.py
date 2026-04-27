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
    model="gemini-2.5-flash",
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
