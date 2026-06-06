from datetime import datetime, date, timedelta
from zoneinfo import ZoneInfo

TZ = ZoneInfo("America/Mexico_City")

_DAYS_ES   = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"]
_SHORT_ES  = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"]
_MONTHS_ES = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
]


def _current_date_context() -> str:
    now = datetime.now(TZ)
    day_name = _DAYS_ES[now.weekday() + 1 if now.weekday() < 6 else 0]
    # weekday(): Mon=0 … Sun=6  →  Sun=0 … Sat=6 in our array
    # Use isoweekday(): Mon=1 … Sun=7
    idx = now.isoweekday() % 7  # Sun=0, Mon=1, … Sat=6
    day_name = _DAYS_ES[idx]
    month_name = _MONTHS_ES[now.month - 1]
    return (
        f"Hoy es {day_name} {now.day} de {month_name} de {now.year} "
        f"({now.strftime('%d/%m/%Y')})."
    )


def _calendar_context(days: int = 60) -> str:
    today = date.today()
    # Use Mexico City "today" to avoid UTC drift
    today = datetime.now(TZ).date()
    entries = []
    for i in range(days + 1):
        d = today + timedelta(days=i)
        idx = d.isoweekday() % 7  # Sun=0 … Sat=6
        short = _SHORT_ES[idx]
        closed = " CERRADO" if d.weekday() == 0 else ""  # Monday
        entries.append(f"{d.strftime('%d/%m/%Y')}({short}{closed})")
    return ", ".join(entries)


def get_system_prompt(business: dict) -> str:
    """
    Builds the full system prompt for the given business.
    'business' is a row from the businesses table, including bot_config JSONB.
    The static portion is stored in bot_config.system_prompt (written by the
    Chatbot panel's System Prompt Builder when the owner saves a config).
    """
    bot_config: dict = business.get("bot_config") or {}
    static_prompt: str = bot_config.get("system_prompt", "")

    dynamic_header = (
        f"FECHA ACTUAL: {_current_date_context()} "
        f"Usa esta fecha como referencia para calcular \"hoy\", \"mañana\", "
        f"\"el viernes\", \"la próxima semana\", etc.\n\n"
        f"CALENDARIO DE LOS PRÓXIMOS 60 DÍAS (úsalo para resolver referencias "
        f"como \"el próximo viernes\" o \"este sábado\"):\n"
        f"{_calendar_context()}"
    )

    return f"{static_prompt}\n\n{dynamic_header}"
