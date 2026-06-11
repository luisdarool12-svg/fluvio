"""
Tests del motor de scoring de no-show (modules/reservations/scoring.py).
Sin llamadas reales a Supabase: filas inyectadas o FakeDB (tests/fake_db.py).
"""
from datetime import datetime, timedelta, timezone

import pytest

from fake_db import FakeDB
from modules.reservations.scoring import calculate_no_show_score, recommended_action

AHORA = datetime(2026, 6, 10, 12, 0, tzinfo=timezone.utc)


def _reserva(creada_hace_dias: float = 0, personas: int = 4,
             conf_status: str = "pending", conf_sent: bool = False) -> dict:
    return {
        "id": "res-1",
        "created_at": (AHORA - timedelta(days=creada_hace_dias)).isoformat(),
        "personas": personas,
        "confirmation_status": conf_status,
        "confirmation_sent": conf_sent,
        "customer_id": "cust-1",
    }


# ─── recommended_action: rangos (fuente de verdad única) ─────────────────────

@pytest.mark.parametrize("score,action_type,rango", [
    (0,   "reminder_standard",            "0-30"),
    (30,  "reminder_standard",            "0-30"),
    (31,  "reminder_confirm",             "31-60"),
    (60,  "reminder_confirm",             "31-60"),
    (61,  "confirmation_required_owner",  "61-80"),
    (80,  "confirmation_required_owner",  "61-80"),
    (81,  "critical_owner_alert",         "81-100"),
    (100, "critical_owner_alert",         "81-100"),
])
def test_recommended_action_rangos(score, action_type, rango):
    accion = recommended_action(score)

    assert accion["action_type"] == action_type
    assert accion["rango"] == rango
    assert accion["label"]


# ─── calculate_no_show_score ──────────────────────────────────────────────────

def test_cliente_nuevo_grupo_chico_reserva_vieja_sin_responder():
    # +25 nuevo, +20 reserva de >14 días, +15 grupo de 2, +20 pidió confirmación sin respuesta
    score = calculate_no_show_score(
        "res-1",
        reservation=_reserva(creada_hace_dias=15, personas=2, conf_sent=True),
        customer={"visitas": 0, "no_show_history": 0},
        now=AHORA,
    )

    assert score == 80


def test_confirmacion_activa_resta_25():
    base = dict(creada_hace_dias=15, personas=2)
    sin_confirmar = calculate_no_show_score(
        "res-1",
        reservation=_reserva(**base),
        customer={"visitas": 0, "no_show_history": 0},
        now=AHORA,
    )
    confirmada = calculate_no_show_score(
        "res-1",
        reservation=_reserva(**base, conf_status="confirmed"),
        customer={"visitas": 0, "no_show_history": 0},
        now=AHORA,
    )

    assert sin_confirmar == 60
    assert confirmada == sin_confirmar - 25


def test_cliente_frecuente_impecable_queda_en_cero():
    # -30 frecuente sin no-shows, -15 reserva hecha hoy → clamp inferior en 0
    score = calculate_no_show_score(
        "res-1",
        reservation=_reserva(creada_hace_dias=0, personas=4),
        customer={"visitas": 8, "no_show_history": 0},
        now=AHORA,
    )

    assert score == 0


def test_peor_caso_se_capea_en_100():
    # +25 sin visitas, +30 no-show previo, +20 reserva vieja, +15 grupo chico,
    # +20 sin responder confirmación = 110 → clamp en 100
    score = calculate_no_show_score(
        "res-1",
        reservation=_reserva(creada_hace_dias=20, personas=1, conf_sent=True),
        customer={"visitas": 0, "no_show_history": 1},
        now=AHORA,
    )

    assert score == 100


def test_score_carga_filas_desde_la_base():
    db = FakeDB({
        "reservations": [_reserva(creada_hace_dias=15, personas=2, conf_sent=True)],
        "customers": [{"id": "cust-1", "visitas": 0, "no_show_history": 0}],
    })

    score = calculate_no_show_score("res-1", db=db, now=AHORA)

    assert score == 80


def test_reservacion_inexistente_lanza_value_error():
    db = FakeDB({"reservations": [], "customers": []})

    with pytest.raises(ValueError):
        calculate_no_show_score("no-existe", db=db, now=AHORA)
