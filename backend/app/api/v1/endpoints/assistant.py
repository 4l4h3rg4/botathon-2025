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
    session_service=session_service,
    auto_create_session=True
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
