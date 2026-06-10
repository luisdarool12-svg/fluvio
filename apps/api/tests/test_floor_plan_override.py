"""
Tests de overrides temporales del plano (modules/floor_plan/availability.py).
Sin llamadas reales a Supabase: usa FakeDB (tests/fake_db.py).
"""
from datetime import datetime, timedelta, timezone

import pytest

from fake_db import FakeDB
from modules.floor_plan.availability import (
    OverrideOverlapError,
    OverrideValidationError,
    create_temporary_override,
    delete_active_override,
    get_active_floor_plan,
    revert_expired_overrides,
    update_active_override_config,
)

BIZ_A = "11111111-1111-1111-1111-111111111111"
BIZ_B = "22222222-2222-2222-2222-222222222222"

AHORA = datetime(2026, 6, 20, 18, 0, tzinfo=timezone.utc)

CONFIG_BASE = {"walls": [], "zones": [{"id": "z1", "label": "Interior"}], "furniture": []}
CONFIG_TEMPORAL = {"walls": [], "zones": [{"id": "z2", "label": "Evento"}], "furniture": [], "tables": []}


def _override(business_id, valid_from, valid_until, config=None, oid="ov-1"):
    return {
        "id": oid,
        "business_id": business_id,
        "config": config or CONFIG_TEMPORAL,
        "valid_from": valid_from.isoformat(),
        "valid_until": valid_until.isoformat(),
        "motivo": "Evento privado",
    }


def _db_con_base():
    return FakeDB({
        "floor_plan_config": [{"id": "fp-1", "business_id": BIZ_A, "config": CONFIG_BASE}],
        "floor_plan_overrides": [],
    })


# ─── Override activo → devuelve el temporal ──────────────────────────────────

def test_override_activo_devuelve_config_temporal():
    db = _db_con_base()
    db.tables["floor_plan_overrides"].append(
        _override(BIZ_A, AHORA - timedelta(hours=1), AHORA + timedelta(hours=3))
    )

    plan = get_active_floor_plan(db, BIZ_A, at_time=AHORA)

    assert plan["source"] == "override"
    assert plan["config"] == CONFIG_TEMPORAL
    assert plan["override"]["motivo"] == "Evento privado"


# ─── Override expirado → devuelve el base ────────────────────────────────────

def test_override_expirado_devuelve_base():
    db = _db_con_base()
    db.tables["floor_plan_overrides"].append(
        _override(BIZ_A, AHORA - timedelta(hours=5), AHORA - timedelta(hours=1))
    )

    plan = get_active_floor_plan(db, BIZ_A, at_time=AHORA)

    assert plan["source"] == "base"
    assert plan["config"] == CONFIG_BASE
    assert plan["override"] is None


def test_sin_config_base_devuelve_config_vacia():
    db = FakeDB({"floor_plan_config": [], "floor_plan_overrides": []})

    plan = get_active_floor_plan(db, BIZ_A, at_time=AHORA)

    assert plan["source"] == "base"
    assert plan["config"]["walls"] == []
    assert plan["config"]["zones"] == []


# ─── Crear override: validaciones ────────────────────────────────────────────

def test_crear_override_valido():
    db = _db_con_base()

    row = create_temporary_override(
        db, BIZ_A, CONFIG_TEMPORAL,
        valid_from=AHORA, valid_until=AHORA + timedelta(hours=4),
        motivo="Cena de grupo",
    )

    assert row["business_id"] == BIZ_A
    assert get_active_floor_plan(db, BIZ_A, at_time=AHORA + timedelta(hours=1))["source"] == "override"


def test_rango_invalido_da_error_claro():
    db = _db_con_base()

    with pytest.raises(OverrideValidationError):
        create_temporary_override(
            db, BIZ_A, CONFIG_TEMPORAL,
            valid_from=AHORA, valid_until=AHORA,  # until == from → inválido
            motivo=None,
        )


def test_traslape_de_overrides_da_error_claro():
    db = _db_con_base()
    db.tables["floor_plan_overrides"].append(
        _override(BIZ_A, AHORA, AHORA + timedelta(hours=4))
    )

    # Se traslapa parcialmente con el existente (empieza dentro de su vigencia)
    with pytest.raises(OverrideOverlapError):
        create_temporary_override(
            db, BIZ_A, CONFIG_TEMPORAL,
            valid_from=AHORA + timedelta(hours=2),
            valid_until=AHORA + timedelta(hours=6),
            motivo=None,
        )


def test_rangos_consecutivos_no_se_traslapan():
    db = _db_con_base()
    db.tables["floor_plan_overrides"].append(
        _override(BIZ_A, AHORA, AHORA + timedelta(hours=4))
    )

    # Empieza exactamente cuando termina el anterior → permitido
    row = create_temporary_override(
        db, BIZ_A, CONFIG_TEMPORAL,
        valid_from=AHORA + timedelta(hours=4),
        valid_until=AHORA + timedelta(hours=6),
        motivo=None,
    )
    assert row["business_id"] == BIZ_A


# ─── Multi-tenant ────────────────────────────────────────────────────────────

def test_multi_tenant_override_de_a_no_afecta_a_b():
    db = FakeDB({
        "floor_plan_config": [
            {"id": "fp-1", "business_id": BIZ_A, "config": CONFIG_BASE},
            {"id": "fp-2", "business_id": BIZ_B, "config": CONFIG_BASE},
        ],
        "floor_plan_overrides": [
            _override(BIZ_A, AHORA - timedelta(hours=1), AHORA + timedelta(hours=3)),
        ],
    })

    plan_a = get_active_floor_plan(db, BIZ_A, at_time=AHORA)
    plan_b = get_active_floor_plan(db, BIZ_B, at_time=AHORA)

    assert plan_a["source"] == "override"
    assert plan_b["source"] == "base"


def test_multi_tenant_crear_override_en_b_con_a_activo():
    # El override activo de A no debe contar como traslape para B
    db = _db_con_base()
    db.tables["floor_plan_overrides"].append(
        _override(BIZ_A, AHORA, AHORA + timedelta(hours=4))
    )

    row = create_temporary_override(
        db, BIZ_B, CONFIG_TEMPORAL,
        valid_from=AHORA, valid_until=AHORA + timedelta(hours=4),
        motivo=None,
    )
    assert row["business_id"] == BIZ_B


# ─── Revertir: manual y por expiración ───────────────────────────────────────

def test_revertir_manualmente_elimina_el_activo():
    db = _db_con_base()
    db.tables["floor_plan_overrides"].append(
        _override(BIZ_A, AHORA - timedelta(hours=1), AHORA + timedelta(hours=3))
    )

    assert delete_active_override(db, BIZ_A, at_time=AHORA) is True
    assert get_active_floor_plan(db, BIZ_A, at_time=AHORA)["source"] == "base"
    # Segunda llamada: ya no hay nada que revertir
    assert delete_active_override(db, BIZ_A, at_time=AHORA) is False


def test_revert_expired_solo_elimina_expirados():
    db = _db_con_base()
    db.tables["floor_plan_overrides"].extend([
        _override(BIZ_A, AHORA - timedelta(hours=6), AHORA - timedelta(hours=2), oid="ov-exp"),
        _override(BIZ_B, AHORA - timedelta(hours=1), AHORA + timedelta(hours=3), oid="ov-act"),
    ])

    eliminados = revert_expired_overrides(db, now=AHORA)

    assert eliminados == 1
    restantes = [o["id"] for o in db.tables["floor_plan_overrides"]]
    assert restantes == ["ov-act"]


# ─── Actualizar config del override activo (editor en modo temporal) ─────────

def test_update_config_del_override_activo():
    db = _db_con_base()
    db.tables["floor_plan_overrides"].append(
        _override(BIZ_A, AHORA - timedelta(hours=1), AHORA + timedelta(hours=3))
    )
    nueva_config = {**CONFIG_TEMPORAL, "tables": [{"id": "m1", "posX": 10, "posY": 20, "rotation": 0}]}

    updated = update_active_override_config(db, BIZ_A, nueva_config, at_time=AHORA)

    assert updated is not None
    assert get_active_floor_plan(db, BIZ_A, at_time=AHORA)["config"] == nueva_config


def test_update_config_sin_override_activo_devuelve_none():
    db = _db_con_base()

    assert update_active_override_config(db, BIZ_A, CONFIG_TEMPORAL, at_time=AHORA) is None
