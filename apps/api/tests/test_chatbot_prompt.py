"""
Tests de build_system_prompt (routers/chatbot.py): el generador del
system prompt del bot a partir del formulario del System Prompt Builder.
Función pura — sin Supabase ni Claude.
"""
from routers.chatbot import build_system_prompt


def _form_completo() -> dict:
    return {
        "restaurant_name": "Dublé Bistró",
        "bot_name": "Duble Bot",
        "cuisine_type": "bistró francés",
        "address": "Av. Principal 123",
        "neighborhood": "Centro",
        "city": "León",
        "phone": "+52 477 000 0000",
        "tone": "casual",
        "language": "spanish",
        "response_length": "concise",
        "hours": [
            {"day": "lunes", "open": False, "from": "", "to": ""},
            {"day": "martes", "open": True, "from": "13:00", "to": "22:00"},
        ],
        "menu_mode": "manual",
        "menu_categories": [
            {
                "name": "Entradas",
                "items": [
                    {"name": "Sopa de cebolla", "price": 120, "description": "Clásica francesa", "tags": ["recommended"]},
                    {"name": "Plato 86", "available": False, "price": 999},
                ],
            },
        ],
        "accepts_reservations": True,
        "reservation_max_people": 8,
        "reservation_advance_hours": 3,
        "events": [
            {"name": "Noche de jazz", "active": True, "date_start": "2026-06-20", "description": "Música en vivo"},
            {"name": "Evento pasado", "active": False, "description": "No debe salir"},
        ],
        "escalation_rules": {"customer_requests_human": True, "large_group": True, "large_group_threshold": 6},
        "escalation_message": "Te conecto con el equipo.",
        "show_prices": True,
    }


def test_prompt_completo_incluye_identidad_y_secciones():
    prompt = build_system_prompt(_form_completo())

    assert "Eres Duble Bot, el asistente virtual de Dublé Bistró" in prompt
    assert "bistró francés" in prompt
    assert "Av. Principal 123, Centro, León" in prompt
    # Tono y reglas de comunicación
    assert "casual usando tú" in prompt
    assert "Español" in prompt
    assert "2-3 líneas máximo" in prompt


def test_horarios_marcan_dias_cerrados():
    prompt = build_system_prompt(_form_completo())

    assert "- Lunes: Cerrado" in prompt
    assert "- Martes: 13:00 – 22:00" in prompt


def test_menu_manual_filtra_no_disponibles_y_marca_tags():
    prompt = build_system_prompt(_form_completo())

    assert "**ENTRADAS**" in prompt
    assert "Sopa de cebolla ⭐ — Clásica francesa $120" in prompt
    assert "Plato 86" not in prompt  # available=False no debe aparecer


def test_reservaciones_aceptadas_incluyen_limites():
    prompt = build_system_prompt(_form_completo())

    assert "Sí aceptamos reservaciones" in prompt
    assert "Máximo 8 personas" in prompt
    assert "Anticipación mínima: 3 horas" in prompt


def test_solo_eventos_activos_aparecen():
    prompt = build_system_prompt(_form_completo())

    assert "Noche de jazz" in prompt
    assert "2026-06-20" in prompt
    assert "Evento pasado" not in prompt


def test_escalacion_usa_reglas_y_mensaje_configurados():
    prompt = build_system_prompt(_form_completo())

    assert "El cliente pide explícitamente hablar con una persona" in prompt
    assert "Grupos grandes (más de 6 personas)" in prompt
    assert 'envía exactamente este mensaje: "Te conecto con el equipo."' in prompt


def test_show_prices_false_prohibe_mencionar_precios():
    form = {**_form_completo(), "show_prices": False}

    prompt = build_system_prompt(form)

    assert "No menciones precios" in prompt


def test_form_vacio_usa_defaults_seguros():
    prompt = build_system_prompt({})

    assert "el asistente virtual de el restaurante" in prompt
    assert "Menú no especificado." in prompt
    assert "No aceptamos reservaciones en este momento" in prompt
    assert "Sin eventos o promociones vigentes" in prompt
    assert "- Cuando el cliente solicite hablar con una persona" in prompt
    # Nunca debe colarse un placeholder de formato sin resolver
    assert "{" not in prompt.replace("{}", "")
