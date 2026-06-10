"""
Motor de disponibilidad de mesas.

Responde dos preguntas:
  1. buscar_mesa_ideal()    — ¿hay mesa para N personas a esta hora? ¿cuál?
  2. get_ocupacion_actual() — ¿qué tan lleno está el restaurante en un momento dado?

Reglas del motor:
  - Una reserva bloquea su mesa durante `tables.tiempo_promedio_estancia`
    minutos a partir de su fecha_hora.
  - "Mesa ideal" = la mesa libre de menor capacidad que alcance para el
    grupo (menos desperdicio de asientos).
  - Si ninguna mesa individual alcanza, se buscan pares de mesas libres
    unibles vía `tables.combinable_con`.
  - Las reservas con combinación bloquean TODAS sus mesas vía
    `reservations.mesas_combinadas`.

El cliente `db` (supabase) se recibe por parámetro y se usa duck-typed,
lo que permite testear el motor sin conexión real a Supabase.
"""
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional, Set, Tuple

ESTADOS_BLOQUEANTES = ["pendiente", "confirmada", "sentada"]
DURACION_DEFAULT_MIN = 90

# Cuánto mirar hacia atrás al traer reservas: una reserva que empezó hace
# horas puede seguir ocupando mesa si su estancia es larga.
_VENTANA_PREVIA_MIN = 360

# Hasta cuántos minutos después de la hora pedida buscar la próxima
# disponibilidad cuando el restaurante está lleno.
_BUSQUEDA_PROXIMA_MIN = 360


def _as_datetime(value: Any) -> datetime:
    """Normaliza str ISO / datetime a datetime tz-aware (UTC si era naive)."""
    if isinstance(value, str):
        value = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return value


def _fetch_mesas(db: Any, business_id: str) -> List[Dict]:
    result = db.table("tables").select(
        "id,nombre,capacidad,zona,tiempo_promedio_estancia,combinable_con"
    ).eq("business_id", business_id).eq("activo", True).execute()
    return result.data or []


def _fetch_reservas_ventana(
    db: Any, business_id: str, inicio: datetime, fin: datetime
) -> List[Dict]:
    """Reservas bloqueantes cuya fecha_hora cae en [inicio - estancia máx., fin)."""
    ventana_inicio = inicio - timedelta(minutes=_VENTANA_PREVIA_MIN)
    result = db.table("reservations").select(
        "id,table_id,mesas_combinadas,fecha_hora,personas,estado"
    ).eq("business_id", business_id).gte(
        "fecha_hora", ventana_inicio.isoformat()
    ).lt("fecha_hora", fin.isoformat()).in_(
        "estado", ESTADOS_BLOQUEANTES
    ).execute()
    return result.data or []


def _mesas_de_reserva(reserva: Dict) -> List[str]:
    """IDs de mesas que ocupa una reserva (principal + combinadas, sin duplicar)."""
    ids: List[str] = []
    if reserva.get("table_id"):
        ids.append(reserva["table_id"])
    for tid in reserva.get("mesas_combinadas") or []:
        if tid not in ids:
            ids.append(tid)
    return ids


def _mesas_ocupadas(
    mesas_por_id: Dict[str, Dict],
    reservas: List[Dict],
    inicio: datetime,
    fin: datetime,
) -> Set[str]:
    """Mesas con alguna reserva que traslapa el intervalo [inicio, fin)."""
    ocupadas: Set[str] = set()
    for reserva in reservas:
        r_inicio = _as_datetime(reserva["fecha_hora"])
        for tid in _mesas_de_reserva(reserva):
            mesa = mesas_por_id.get(tid)
            estancia = mesa["tiempo_promedio_estancia"] if mesa else DURACION_DEFAULT_MIN
            r_fin = r_inicio + timedelta(minutes=estancia)
            if r_inicio < fin and r_fin > inicio:
                ocupadas.add(tid)
    return ocupadas


def _elegir_mesa(
    mesas: List[Dict], ocupadas: Set[str], personas: int
) -> Optional[Tuple[str, List[str]]]:
    """
    (mesa_principal_id, mesas_combinadas) para el grupo, o None si no hay.
    mesas_combinadas queda vacío cuando alcanza una mesa individual.
    """
    libres = [m for m in mesas if m["id"] not in ocupadas]

    individuales = [m for m in libres if m["capacidad"] >= personas]
    if individuales:
        mejor = min(individuales, key=lambda m: (m["capacidad"], m.get("nombre") or ""))
        return mejor["id"], []

    # Combinaciones de 2 mesas libres unibles vía combinable_con
    libres_por_id = {m["id"]: m for m in libres}
    mejor_combo: Optional[Tuple[int, Dict, Dict]] = None
    vistas: Set[frozenset] = set()

    for mesa_a in libres:
        for id_b in mesa_a.get("combinable_con") or []:
            mesa_b = libres_por_id.get(id_b)
            if mesa_b is None or mesa_b["id"] == mesa_a["id"]:
                continue
            par = frozenset((mesa_a["id"], mesa_b["id"]))
            if par in vistas:
                continue
            vistas.add(par)
            cap_total = mesa_a["capacidad"] + mesa_b["capacidad"]
            if cap_total < personas:
                continue
            if mejor_combo is None or cap_total < mejor_combo[0]:
                mejor_combo = (cap_total, mesa_a, mesa_b)

    if mejor_combo is None:
        return None

    _, mesa_a, mesa_b = mejor_combo
    principal = mesa_a if mesa_a["capacidad"] >= mesa_b["capacidad"] else mesa_b
    return principal["id"], [mesa_a["id"], mesa_b["id"]]


def _proxima_disponibilidad(
    mesas: List[Dict],
    mesas_por_id: Dict[str, Dict],
    reservas: List[Dict],
    personas: int,
    fecha_hora: datetime,
    duracion_min: int,
) -> Optional[datetime]:
    """Primer momento posterior a fecha_hora en que alguna mesa/combo se libera."""
    limite = fecha_hora + timedelta(minutes=_BUSQUEDA_PROXIMA_MIN)

    fines: Set[datetime] = set()
    for reserva in reservas:
        r_inicio = _as_datetime(reserva["fecha_hora"])
        for tid in _mesas_de_reserva(reserva):
            mesa = mesas_por_id.get(tid)
            estancia = mesa["tiempo_promedio_estancia"] if mesa else DURACION_DEFAULT_MIN
            fines.add(r_inicio + timedelta(minutes=estancia))

    for candidato in sorted(fines):
        if candidato <= fecha_hora or candidato > limite:
            continue
        ocupadas = _mesas_ocupadas(
            mesas_por_id, reservas, candidato, candidato + timedelta(minutes=duracion_min)
        )
        if _elegir_mesa(mesas, ocupadas, personas) is not None:
            return candidato
    return None


def buscar_mesa_ideal(
    db: Any,
    business_id: str,
    personas: int,
    fecha_hora: datetime,
    duracion_min: int = DURACION_DEFAULT_MIN,
) -> Dict:
    """
    Busca la mesa óptima para un grupo en una fecha/hora dada.

    Retorna:
      {
        "mesa_id":                  UUID de la mesa (principal si hay combinación) o None,
        "mesas_combinadas":         [UUIDs] cuando se necesitan 2 mesas; [] si es individual,
        "restaurante_lleno":        True si no hay mesa ni combinación posible,
        "proxima_disponibilidad":   ISO datetime de la próxima hora con mesa, o None,
        "sin_mesas_configuradas":   True si el negocio aún no tiene mesas activas
                                    (el caller decide no bloquear reservas en ese caso),
      }
    """
    fecha_hora = _as_datetime(fecha_hora)
    fin = fecha_hora + timedelta(minutes=duracion_min)

    mesas = _fetch_mesas(db, business_id)
    if not mesas:
        return {
            "mesa_id": None,
            "mesas_combinadas": [],
            "restaurante_lleno": False,
            "proxima_disponibilidad": None,
            "sin_mesas_configuradas": True,
        }

    mesas_por_id = {m["id"]: m for m in mesas}

    # Una sola ventana amplia sirve para el chequeo actual y para calcular
    # la próxima disponibilidad sin volver a consultar.
    ventana_fin = fecha_hora + timedelta(minutes=_BUSQUEDA_PROXIMA_MIN + duracion_min)
    reservas = _fetch_reservas_ventana(db, business_id, fecha_hora, ventana_fin)

    ocupadas = _mesas_ocupadas(mesas_por_id, reservas, fecha_hora, fin)
    eleccion = _elegir_mesa(mesas, ocupadas, personas)

    if eleccion is not None:
        mesa_id, combinadas = eleccion
        return {
            "mesa_id": mesa_id,
            "mesas_combinadas": combinadas,
            "restaurante_lleno": False,
            "proxima_disponibilidad": None,
            "sin_mesas_configuradas": False,
        }

    proxima = _proxima_disponibilidad(
        mesas, mesas_por_id, reservas, personas, fecha_hora, duracion_min
    )
    return {
        "mesa_id": None,
        "mesas_combinadas": [],
        "restaurante_lleno": True,
        "proxima_disponibilidad": proxima.isoformat() if proxima else None,
        "sin_mesas_configuradas": False,
    }


def get_ocupacion_actual(db: Any, business_id: str, fecha_hora: datetime) -> Dict:
    """
    Porcentaje de ocupación (por capacidad) en un momento dado, para el dashboard.

    Retorna:
      {
        "porcentaje":        0-100 (capacidad ocupada / capacidad total),
        "mesas_ocupadas":    int,
        "mesas_totales":     int,
        "capacidad_ocupada": int,
        "capacidad_total":   int,
      }
    """
    fecha_hora = _as_datetime(fecha_hora)

    mesas = _fetch_mesas(db, business_id)
    capacidad_total = sum(m["capacidad"] for m in mesas)
    if not mesas or capacidad_total == 0:
        return {
            "porcentaje": 0.0,
            "mesas_ocupadas": 0,
            "mesas_totales": len(mesas),
            "capacidad_ocupada": 0,
            "capacidad_total": capacidad_total,
        }

    mesas_por_id = {m["id"]: m for m in mesas}
    instante_fin = fecha_hora + timedelta(minutes=1)
    reservas = _fetch_reservas_ventana(db, business_id, fecha_hora, instante_fin)
    ocupadas = _mesas_ocupadas(mesas_por_id, reservas, fecha_hora, instante_fin)
    ocupadas_conocidas = [tid for tid in ocupadas if tid in mesas_por_id]

    capacidad_ocupada = sum(mesas_por_id[tid]["capacidad"] for tid in ocupadas_conocidas)
    return {
        "porcentaje": round(100.0 * capacidad_ocupada / capacidad_total, 1),
        "mesas_ocupadas": len(ocupadas_conocidas),
        "mesas_totales": len(mesas),
        "capacidad_ocupada": capacidad_ocupada,
        "capacidad_total": capacidad_total,
    }
