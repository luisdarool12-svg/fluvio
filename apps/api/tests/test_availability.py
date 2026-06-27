"""
Tests del motor de disponibilidad (modules/reservations/availability.py).
Sin llamadas reales a Supabase: usa FakeDB (tests/fake_db.py).
"""
from datetime import datetime, timezone

from fake_db import FakeDB
from modules.reservations.availability import buscar_mesa_ideal, get_ocupacion_actual

BIZ_A = "11111111-1111-1111-1111-111111111111"
BIZ_B = "22222222-2222-2222-2222-222222222222"

MESA_2A = "aaaaaaaa-0001-0000-0000-000000000000"  # 2 personas
MESA_2B = "aaaaaaaa-0002-0000-0000-000000000000"  # 2 personas
MESA_4 = "aaaaaaaa-0004-0000-0000-000000000000"   # 4 personas
MESA_8 = "aaaaaaaa-0008-0000-0000-000000000000"   # 8 personas
MESA_B4 = "bbbbbbbb-0004-0000-0000-000000000000"  # negocio B, 4 personas

LAS_OCHO = datetime(2026, 6, 20, 20, 0, tzinfo=timezone.utc)


def _mesa(mesa_id, business_id, nombre, capacidad, combinable=None, estancia=90, zona="Interior"):
    return {
        "id": mesa_id,
        "business_id": business_id,
        "nombre": nombre,
        "capacidad": capacidad,
        "zona": zona,
        "activo": True,
        "tiempo_promedio_estancia": estancia,
        "combinable_con": combinable or [],
    }


def _reserva(business_id, table_id, fecha_hora, estado="confirmada", combinadas=None, personas=2):
    return {
        "id": f"res-{table_id}-{fecha_hora.isoformat()}",
        "business_id": business_id,
        "table_id": table_id,
        "mesas_combinadas": combinadas or [],
        "fecha_hora": fecha_hora.isoformat(),
        "estado": estado,
        "personas": personas,
    }


# ─── Caso: restaurante lleno → rechaza y da próxima hora ─────────────────────

def test_restaurante_lleno_rechaza_y_da_proxima_disponibilidad():
    # Arrange: única mesa (4p, estancia 90) ocupada a las 20:00
    db = FakeDB({
        "tables": [_mesa(MESA_4, BIZ_A, "Mesa 4", 4)],
        "reservations": [_reserva(BIZ_A, MESA_4, LAS_OCHO)],
    })

    # Act
    resultado = buscar_mesa_ideal(db, BIZ_A, personas=2, fecha_hora=LAS_OCHO)

    # Assert: lleno, sin mesa, y la próxima hora es cuando termina la estancia (21:30)
    assert resultado["restaurante_lleno"] is True
    assert resultado["mesa_id"] is None
    assert resultado["mesas_combinadas"] == []
    assert resultado["proxima_disponibilidad"] == datetime(
        2026, 6, 20, 21, 30, tzinfo=timezone.utc
    ).isoformat()


def test_lleno_sin_mas_reservas_no_da_proxima():
    # La mesa está ocupada por una reserva que empezó a las 20:00 pero el
    # grupo pide justo a las 20:00 con la estancia cubriendo todo el rango buscado
    db = FakeDB({
        "tables": [_mesa(MESA_4, BIZ_A, "Mesa 4", 4, estancia=480)],
        "reservations": [_reserva(BIZ_A, MESA_4, LAS_OCHO)],
    })

    resultado = buscar_mesa_ideal(db, BIZ_A, personas=2, fecha_hora=LAS_OCHO)

    assert resultado["restaurante_lleno"] is True
    assert resultado["proxima_disponibilidad"] is None


# ─── Caso: mesa individual → asigna la más pequeña que alcance ───────────────

def test_asigna_mesa_individual_mas_pequena_suficiente():
    # Arrange: mesas de 2, 4 y 8 libres; grupo de 3
    db = FakeDB({
        "tables": [
            _mesa(MESA_2A, BIZ_A, "Mesa 2", 2),
            _mesa(MESA_4, BIZ_A, "Mesa 4", 4),
            _mesa(MESA_8, BIZ_A, "Mesa 8", 8),
        ],
        "reservations": [],
    })

    # Act
    resultado = buscar_mesa_ideal(db, BIZ_A, personas=3, fecha_hora=LAS_OCHO)

    # Assert: elige la de 4 (menor capacidad suficiente), no la de 8
    assert resultado["restaurante_lleno"] is False
    assert resultado["mesa_id"] == MESA_4
    assert resultado["mesas_combinadas"] == []


def test_mesa_ocupada_no_se_asigna_y_usa_la_siguiente():
    # La mesa de 4 está tomada → debe caer en la de 8
    db = FakeDB({
        "tables": [
            _mesa(MESA_4, BIZ_A, "Mesa 4", 4),
            _mesa(MESA_8, BIZ_A, "Mesa 8", 8),
        ],
        "reservations": [_reserva(BIZ_A, MESA_4, LAS_OCHO)],
    })

    resultado = buscar_mesa_ideal(db, BIZ_A, personas=3, fecha_hora=LAS_OCHO)

    assert resultado["mesa_id"] == MESA_8


def test_reserva_que_no_traslapa_no_bloquea():
    # Reserva a las 18:00 con estancia 90 termina 19:30 → a las 20:00 está libre
    temprano = datetime(2026, 6, 20, 18, 0, tzinfo=timezone.utc)
    db = FakeDB({
        "tables": [_mesa(MESA_4, BIZ_A, "Mesa 4", 4)],
        "reservations": [_reserva(BIZ_A, MESA_4, temprano)],
    })

    resultado = buscar_mesa_ideal(db, BIZ_A, personas=2, fecha_hora=LAS_OCHO)

    assert resultado["restaurante_lleno"] is False
    assert resultado["mesa_id"] == MESA_4


def test_reserva_cancelada_no_bloquea():
    db = FakeDB({
        "tables": [_mesa(MESA_4, BIZ_A, "Mesa 4", 4)],
        "reservations": [_reserva(BIZ_A, MESA_4, LAS_OCHO, estado="cancelada")],
    })

    resultado = buscar_mesa_ideal(db, BIZ_A, personas=2, fecha_hora=LAS_OCHO)

    assert resultado["restaurante_lleno"] is False
    assert resultado["mesa_id"] == MESA_4


# ─── Caso: combinar 2 mesas vía combinable_con ───────────────────────────────

def test_combina_dos_mesas_para_grupo_grande():
    # Arrange: dos mesas de 2 combinables entre sí; grupo de 4
    db = FakeDB({
        "tables": [
            _mesa(MESA_2A, BIZ_A, "Mesa 2A", 2, combinable=[MESA_2B]),
            _mesa(MESA_2B, BIZ_A, "Mesa 2B", 2),
        ],
        "reservations": [],
    })

    # Act
    resultado = buscar_mesa_ideal(db, BIZ_A, personas=4, fecha_hora=LAS_OCHO)

    # Assert: usa la combinación; mesa_id es una de las dos
    assert resultado["restaurante_lleno"] is False
    assert sorted(resultado["mesas_combinadas"]) == sorted([MESA_2A, MESA_2B])
    assert resultado["mesa_id"] in (MESA_2A, MESA_2B)


def test_no_combina_mesas_no_combinables():
    # Mismas mesas pero SIN combinable_con → grupo de 4 no cabe
    db = FakeDB({
        "tables": [
            _mesa(MESA_2A, BIZ_A, "Mesa 2A", 2),
            _mesa(MESA_2B, BIZ_A, "Mesa 2B", 2),
        ],
        "reservations": [],
    })

    resultado = buscar_mesa_ideal(db, BIZ_A, personas=4, fecha_hora=LAS_OCHO)

    assert resultado["restaurante_lleno"] is True
    assert resultado["mesas_combinadas"] == []


def test_combinacion_bloquea_ambas_mesas():
    # Una reserva combinada (2A+2B) debe dejar ambas mesas ocupadas
    db = FakeDB({
        "tables": [
            _mesa(MESA_2A, BIZ_A, "Mesa 2A", 2, combinable=[MESA_2B]),
            _mesa(MESA_2B, BIZ_A, "Mesa 2B", 2),
        ],
        "reservations": [
            _reserva(BIZ_A, MESA_2A, LAS_OCHO, combinadas=[MESA_2A, MESA_2B], personas=4),
        ],
    })

    resultado = buscar_mesa_ideal(db, BIZ_A, personas=2, fecha_hora=LAS_OCHO)

    assert resultado["restaurante_lleno"] is True


# ─── Caso: multi-tenant ──────────────────────────────────────────────────────

def test_multi_tenant_reservas_de_otro_negocio_no_interfieren():
    # Arrange: negocio A lleno; negocio B con la misma hora pero libre
    db = FakeDB({
        "tables": [
            _mesa(MESA_4, BIZ_A, "Mesa 4", 4),
            _mesa(MESA_B4, BIZ_B, "Mesa B4", 4),
        ],
        "reservations": [_reserva(BIZ_A, MESA_4, LAS_OCHO)],
    })

    # Act
    resultado_a = buscar_mesa_ideal(db, BIZ_A, personas=2, fecha_hora=LAS_OCHO)
    resultado_b = buscar_mesa_ideal(db, BIZ_B, personas=2, fecha_hora=LAS_OCHO)

    # Assert: A lleno, B disponible con SU mesa (nunca la de A)
    assert resultado_a["restaurante_lleno"] is True
    assert resultado_b["restaurante_lleno"] is False
    assert resultado_b["mesa_id"] == MESA_B4


def test_negocio_sin_mesas_configuradas_no_bloquea():
    db = FakeDB({"tables": [], "reservations": []})

    resultado = buscar_mesa_ideal(db, BIZ_A, personas=2, fecha_hora=LAS_OCHO)

    assert resultado["sin_mesas_configuradas"] is True
    assert resultado["restaurante_lleno"] is False
    assert resultado["mesa_id"] is None


# ─── Preferencia de zona ─────────────────────────────────────────────────────

MESA_TERRAZA = "cccccccc-0002-0000-0000-000000000000"  # 2p, Terraza
MESA_INTERIOR = "cccccccc-0004-0000-0000-000000000000"  # 4p, Interior


def test_zona_prioriza_la_solicitada_aunque_sea_mayor_capacidad():
    # Terraza(2p) e Interior(4p) libres; grupo de 2 pide Terraza.
    # Sin zona elegiría la de 2 (Terraza) por capacidad; con zona también Terraza.
    # El caso interesante: pedir Interior debe dar la de 4 aunque la de 2 sea menor.
    db = FakeDB({
        "tables": [
            _mesa(MESA_TERRAZA, BIZ_A, "T1", 2, zona="Terraza"),
            _mesa(MESA_INTERIOR, BIZ_A, "I1", 4, zona="Interior"),
        ],
        "reservations": [],
    })

    resultado = buscar_mesa_ideal(db, BIZ_A, personas=2, fecha_hora=LAS_OCHO, zona="interior")

    assert resultado["mesa_id"] == MESA_INTERIOR
    assert resultado["zona_asignada"] == "Interior"
    assert resultado["zona_match"] is True


def test_zona_acepta_sinonimo_comedor_como_interior():
    db = FakeDB({
        "tables": [
            _mesa(MESA_TERRAZA, BIZ_A, "T1", 2, zona="Terraza"),
            _mesa(MESA_INTERIOR, BIZ_A, "I1", 4, zona="Interior"),
        ],
        "reservations": [],
    })

    resultado = buscar_mesa_ideal(db, BIZ_A, personas=2, fecha_hora=LAS_OCHO, zona="comedor")

    assert resultado["mesa_id"] == MESA_INTERIOR
    assert resultado["zona_match"] is True


def test_zona_llena_cae_a_otra_zona_y_marca_zona_match_false():
    # Solo hay Interior libre; el cliente pide Terraza (que no tiene mesa libre).
    # No se rechaza: cae a Interior, pero zona_match=False para que el bot avise.
    db = FakeDB({
        "tables": [
            _mesa(MESA_TERRAZA, BIZ_A, "T1", 2, zona="Terraza"),
            _mesa(MESA_INTERIOR, BIZ_A, "I1", 4, zona="Interior"),
        ],
        "reservations": [_reserva(BIZ_A, MESA_TERRAZA, LAS_OCHO)],
    })

    resultado = buscar_mesa_ideal(db, BIZ_A, personas=2, fecha_hora=LAS_OCHO, zona="terraza")

    assert resultado["restaurante_lleno"] is False
    assert resultado["mesa_id"] == MESA_INTERIOR
    assert resultado["zona_asignada"] == "Interior"
    assert resultado["zona_match"] is False


def test_sin_zona_mantiene_comportamiento_y_zona_match_true():
    db = FakeDB({
        "tables": [_mesa(MESA_INTERIOR, BIZ_A, "I1", 4, zona="Interior")],
        "reservations": [],
    })

    resultado = buscar_mesa_ideal(db, BIZ_A, personas=2, fecha_hora=LAS_OCHO)

    assert resultado["mesa_id"] == MESA_INTERIOR
    assert resultado["zona_match"] is True
    assert resultado["zona_solicitada"] is None


# ─── get_ocupacion_actual ────────────────────────────────────────────────────

def test_ocupacion_por_capacidad():
    # Mesa de 4 ocupada + mesa de 4 libre → 50% de la capacidad
    db = FakeDB({
        "tables": [
            _mesa(MESA_4, BIZ_A, "Mesa 4", 4),
            _mesa(MESA_8, BIZ_A, "Mesa 8", 4),
        ],
        "reservations": [_reserva(BIZ_A, MESA_4, LAS_OCHO)],
    })

    ocupacion = get_ocupacion_actual(db, BIZ_A, LAS_OCHO)

    assert ocupacion["porcentaje"] == 50.0
    assert ocupacion["mesas_ocupadas"] == 1
    assert ocupacion["mesas_totales"] == 2
    assert ocupacion["capacidad_total"] == 8


def test_ocupacion_sin_mesas_es_cero():
    db = FakeDB({"tables": [], "reservations": []})

    ocupacion = get_ocupacion_actual(db, BIZ_A, LAS_OCHO)

    assert ocupacion["porcentaje"] == 0.0
    assert ocupacion["mesas_totales"] == 0
