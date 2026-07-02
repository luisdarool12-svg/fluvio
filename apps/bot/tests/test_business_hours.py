"""Tests de business_hours.py y de validate_reservation por tenant."""
import sys
from datetime import datetime, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import agent
from business_hours import closed_weekdays, weekly_hours


def _biz(hours: list) -> dict:
    return {"id": "biz-1", "prompt_form_data": {"hours": hours}}


def test_parsea_horario_del_builder():
    # Arrange
    biz = _biz([
        {"day": "lunes", "open": False, "from": "", "to": ""},
        {"day": "miércoles", "open": True, "from": "09:30", "to": "21:00"},
    ])

    # Act
    horario = weekly_hours(biz)

    # Assert
    assert horario[0] is None                      # lunes cerrado
    assert horario[2] == (9 * 60 + 30, 21 * 60)    # miércoles 09:30–21:00
    assert horario[5] is None                      # sábado no listado = cerrado


def test_sin_horario_configurado_usa_default_legado():
    horario = weekly_hours({"prompt_form_data": {}})

    assert horario[0] is None            # lunes cerrado (comportamiento Dublé)
    assert horario[1] == (14 * 60, 23 * 60)
    assert horario[6] == (14 * 60, 18 * 60)


def test_closed_weekdays_respeta_config():
    biz = _biz([
        {"day": "domingo", "open": False},
        {"day": "lunes", "open": True, "from": "10:00", "to": "20:00"},
    ])

    assert closed_weekdays(biz) == {1, 2, 3, 4, 5, 6}


def _proximo_dia(weekday: int) -> str:
    """Próxima fecha (DD/MM/YYYY) que caiga en el weekday dado."""
    hoy = datetime.now(agent.TZ).date()
    delta = (weekday - hoy.weekday()) % 7 or 7
    return (hoy + timedelta(days=delta)).strftime("%d/%m/%Y")


def test_validate_reservation_acepta_dia_abierto_del_tenant():
    # Un restaurante que SÍ abre lunes (a diferencia de Dublé)
    biz = _biz([{"day": "lunes", "open": True, "from": "10:00", "to": "20:00"}])

    reserva = {"fecha": _proximo_dia(0), "hora": "12:00"}
    resultado = agent.validate_reservation(reserva, biz)

    assert not resultado.startswith("ERROR")


def test_validate_reservation_rechaza_dia_cerrado_del_tenant():
    biz = _biz([
        {"day": "martes", "open": False},
        {"day": "viernes", "open": True, "from": "10:00", "to": "20:00"},
    ])

    reserva = {"fecha": _proximo_dia(1), "hora": "12:00"}
    resultado = agent.validate_reservation(reserva, biz)

    assert resultado.startswith("ERROR")
    assert "martes" in resultado


def test_validate_reservation_rechaza_fuera_de_horario():
    biz = _biz([{"day": "viernes", "open": True, "from": "13:00", "to": "22:00"}])

    reserva = {"fecha": _proximo_dia(4), "hora": "23:30"}
    resultado = agent.validate_reservation(reserva, biz)

    assert resultado.startswith("ERROR")
    assert "13:00 a 22:00" in resultado
