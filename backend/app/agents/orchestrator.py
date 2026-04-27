from google.adk.agents import LlmAgent
from app.agents.db_agent import db_agent
from app.agents.email_agent import email_agent

orchestrator = LlmAgent(
    name="asistente_coordinador",
    model="gemini-2.5-flash",
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
    ]
)
