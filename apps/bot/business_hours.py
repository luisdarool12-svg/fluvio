"""
Horarios de operación por negocio (multi-tenant).

La fuente de verdad es businesses.prompt_form_data.hours, que escribe el
System Prompt Builder del dashboard:
    [{"day": "lunes", "open": false, "from": "13:00", "to": "22:00"}, ...]

Si el negocio aún no configuró horarios, se usa _LEGACY_DEFAULT (el horario
del piloto Dublé) para no cambiar el comportamiento en producción.
"""
import unicodedata
from typing import Optional

DAYS_ES = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"]

# weekday() de Python: lunes=0 … domingo=6. None = cerrado.
_LEGACY_DEFAULT: dict[int, Optional[tuple[int, int]]] = {
    0: None,
    1: (14 * 60, 23 * 60),
    2: (14 * 60, 23 * 60),
    3: (14 * 60, 23 * 60),
    4: (14 * 60, 23 * 60),
    5: (14 * 60, 23 * 60),
    6: (14 * 60, 18 * 60),
}

_DAY_INDEX = {
    "lunes": 0, "martes": 1, "miercoles": 2, "jueves": 3,
    "viernes": 4, "sabado": 5, "domingo": 6,
}


def _sin_acentos(texto: str) -> str:
    nfd = unicodedata.normalize("NFD", texto)
    return "".join(c for c in nfd if unicodedata.category(c) != "Mn")


def _a_minutos(hhmm: str) -> Optional[int]:
    try:
        hh, mm = str(hhmm).split(":")
        return int(hh) * 60 + int(mm)
    except (ValueError, AttributeError):
        return None


def weekly_hours(business: dict) -> dict[int, Optional[tuple[int, int]]]:
    """
    Mapa weekday → (apertura_min, cierre_min) o None si ese día cierra.
    Los días que el formulario no lista se consideran cerrados.
    """
    form = business.get("prompt_form_data") or {}
    hours = form.get("hours") or []

    parsed: dict[int, Optional[tuple[int, int]]] = {}
    for h in hours:
        day_key = _sin_acentos(str(h.get("day", "")).strip().lower())
        wd = _DAY_INDEX.get(day_key)
        if wd is None:
            continue
        if not h.get("open"):
            parsed[wd] = None
            continue
        inicio = _a_minutos(h.get("from", ""))
        fin = _a_minutos(h.get("to", ""))
        if inicio is None or fin is None:
            continue
        parsed[wd] = (inicio, fin)

    if not parsed:
        return dict(_LEGACY_DEFAULT)
    return {wd: parsed.get(wd) for wd in range(7)}


def closed_weekdays(business: dict) -> set[int]:
    return {wd for wd, rango in weekly_hours(business).items() if rango is None}


def rango_str(rango: tuple[int, int]) -> str:
    inicio, fin = rango
    return f"{inicio // 60:02d}:{inicio % 60:02d} a {fin // 60:02d}:{fin % 60:02d}"


def dias_abiertos_str(business: dict) -> str:
    abiertos = [DAYS_ES[wd] for wd in range(7) if weekly_hours(business).get(wd)]
    return ", ".join(abiertos) if abiertos else "ningún día configurado"
