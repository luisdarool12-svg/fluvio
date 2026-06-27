from datetime import datetime, date, timedelta
from zoneinfo import ZoneInfo

TZ = ZoneInfo("America/Mexico_City")

_DAYS_ES   = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"]
_SHORT_ES  = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"]
_MONTHS_ES = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
]


def _current_date_context() -> str:
    now = datetime.now(TZ)
    # weekday(): Mon=0 … Sun=6  →  _DAYS_ES[0]=lunes … _DAYS_ES[6]=domingo
    day_name = _DAYS_ES[now.weekday()]
    month_name = _MONTHS_ES[now.month - 1]
    return (
        f"Hoy es {day_name} {now.day} de {month_name} de {now.year} "
        f"({now.strftime('%d/%m/%Y')})."
    )


def _fecha_relativa_context(today: date) -> str:
    """
    Pre-compute 'este/próximo [día]' tables so Claude reads exact dates
    instead of deriving them from the calendar (which caused off-by-one errors
    when today is the same weekday the customer mentions).
    """
    # _DAYS_ES indexed by weekday(): Mon=0 … Sun=6
    lines = [
        "RESOLUCIÓN DE FECHAS RELATIVAS (úsalas directamente — no calcules):",
        f"  hoy           → {today.strftime('%d/%m/%Y')}",
        f"  mañana        → {(today + timedelta(days=1)).strftime('%d/%m/%Y')}",
        f"  pasado mañana → {(today + timedelta(days=2)).strftime('%d/%m/%Y')}",
        "",
        "  «este [día]» = primer [día] desde hoy (inclusivo, puede ser hoy mismo):",
    ]
    for wd in range(7):
        days_until = (wd - today.weekday()) % 7
        d = today + timedelta(days=days_until)
        closed = "  ← CERRADO, avísale al cliente" if wd == 0 else ""
        today_mark = " (HOY)" if d == today else ""
        lines.append(
            f"    este {_DAYS_ES[wd]:<12} → {d.strftime('%d/%m/%Y')}{today_mark}{closed}"
        )

    lines += [
        "",
        "  «el próximo [día]» = siempre la semana SIGUIENTE a «este [día]»:",
    ]
    for wd in range(7):
        days_until = (wd - today.weekday()) % 7
        proximo = today + timedelta(days=days_until + 7)
        closed = "  ← CERRADO, avísale al cliente" if wd == 0 else ""
        lines.append(
            f"    el próximo {_DAYS_ES[wd]:<8} → {proximo.strftime('%d/%m/%Y')}{closed}"
        )

    return "\n".join(lines)


def _calendar_context(days: int = 60) -> str:
    today = datetime.now(TZ).date()
    entries = []
    for i in range(days + 1):
        d = today + timedelta(days=i)
        short = _SHORT_ES[d.weekday()]
        closed = " CERRADO" if d.weekday() == 0 else ""
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

    today = datetime.now(TZ).date()
    dynamic_header = (
        f"FECHA ACTUAL: {_current_date_context()} "
        f"Usa esta fecha como referencia para calcular fechas relativas.\n\n"
        f"{_fecha_relativa_context(today)}\n\n"
        f"CALENDARIO DE LOS PRÓXIMOS 60 DÍAS (úsalo para confirmar cualquier fecha "
        f"o encontrar la disponibilidad del restaurante):\n"
        f"{_calendar_context()}"
    )

    return f"{dynamic_header}\n\n{static_prompt}"
