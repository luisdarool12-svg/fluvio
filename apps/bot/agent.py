import os
import anthropic
from supabase import create_client

ANTHROPIC_API_KEY = os.environ["ANTHROPIC_API_KEY"]
SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

claude = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)


def get_business_id_by_phone(phone_number_id: str) -> str | None:
    """Resuelve el business_id a partir del phone_number_id de WhatsApp."""
    db = create_client(SUPABASE_URL, SUPABASE_KEY)
    result = db.table("businesses").select("id").eq("telefono_whatsapp", phone_number_id).eq("activo", True).execute()
    if result.data:
        return result.data[0]["id"]
    return None


async def handle_message(business_phone_number_id: str, customer_phone: str, text: str) -> str:
    """
    Procesa el mensaje del cliente con Claude y devuelve la respuesta.
    """
    business_id = get_business_id_by_phone(business_phone_number_id)
    if not business_id:
        return "Lo sentimos, este número no está configurado. Por favor contáctanos directamente."

    system_prompt = """Eres un asistente de reservaciones para un restaurante.
Ayudas a los clientes a hacer, consultar y cancelar reservaciones.
Responde siempre en español, de forma amable y concisa.
Si el cliente quiere hacer una reservación, pide: nombre, fecha, hora y número de personas.
Si el cliente quiere cancelar o consultar, pide su nombre o número de teléfono."""

    response = claude.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=512,
        system=system_prompt,
        messages=[{"role": "user", "content": text}],
    )

    return response.content[0].text
