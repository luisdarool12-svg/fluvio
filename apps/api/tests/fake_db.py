"""
Cliente Supabase falso para tests: replica la API encadenable de
postgrest-py (table().select().eq().gte()...execute()) aplicando los
filtros sobre listas de dicts en memoria. Sin red, sin Supabase real.

Aplica los filtros de verdad (incluido business_id), por lo que sirve
para probar el aislamiento multi-tenant del motor.
"""
from datetime import datetime
from types import SimpleNamespace
from typing import Any, Dict, List


def _comparable(value: Any) -> Any:
    """ISO datetime str → datetime para comparar rangos correctamente."""
    if isinstance(value, str):
        try:
            return datetime.fromisoformat(value.replace("Z", "+00:00"))
        except ValueError:
            return value
    return value


class FakeQuery:
    def __init__(self, rows: List[Dict]):
        self._rows = rows
        self._filters: List = []
        self._order_col = None
        self._order_desc = False
        self._limit = None
        self._single = False
        self._op = "select"
        self._payload: Any = None

    # ── construcción de la query ──────────────────────────────────────────
    def select(self, *_cols, **_kw):
        return self

    def insert(self, payload):
        self._op = "insert"
        self._payload = payload
        return self

    def update(self, payload):
        self._op = "update"
        self._payload = payload
        return self

    def delete(self):
        self._op = "delete"
        return self

    # ── filtros ───────────────────────────────────────────────────────────
    def eq(self, col, val):
        self._filters.append(lambda r: r.get(col) == val)
        return self

    def neq(self, col, val):
        self._filters.append(lambda r: r.get(col) != val)
        return self

    def gt(self, col, val):
        self._filters.append(lambda r: _comparable(r.get(col)) > _comparable(val))
        return self

    def gte(self, col, val):
        self._filters.append(lambda r: _comparable(r.get(col)) >= _comparable(val))
        return self

    def lt(self, col, val):
        self._filters.append(lambda r: _comparable(r.get(col)) < _comparable(val))
        return self

    def lte(self, col, val):
        self._filters.append(lambda r: _comparable(r.get(col)) <= _comparable(val))
        return self

    def in_(self, col, values):
        self._filters.append(lambda r: r.get(col) in values)
        return self

    def order(self, col, desc: bool = False):
        self._order_col = col
        self._order_desc = desc
        return self

    def limit(self, n: int):
        self._limit = n
        return self

    def single(self):
        """Como en postgrest-py: execute() devuelve un dict (o None), no una lista."""
        self._single = True
        return self

    # ── ejecución ─────────────────────────────────────────────────────────
    def _matching(self) -> List[Dict]:
        rows = [r for r in self._rows if all(f(r) for f in self._filters)]
        if self._order_col:
            rows.sort(key=lambda r: _comparable(r.get(self._order_col)), reverse=self._order_desc)
        if self._limit is not None:
            rows = rows[: self._limit]
        return rows

    def execute(self):
        if self._op == "insert":
            payload = self._payload if isinstance(self._payload, list) else [self._payload]
            inserted = []
            for row in payload:
                row = dict(row)
                row.setdefault("id", f"fake-{len(self._rows) + 1}")
                self._rows.append(row)
                inserted.append(row)
            return SimpleNamespace(data=inserted)

        if self._op == "update":
            updated = []
            for row in self._matching():
                row.update(self._payload)
                updated.append(row)
            return SimpleNamespace(data=updated)

        if self._op == "delete":
            removed = self._matching()
            for row in removed:
                self._rows.remove(row)
            return SimpleNamespace(data=removed)

        rows = self._matching()
        if self._single:
            return SimpleNamespace(data=rows[0] if rows else None)
        return SimpleNamespace(data=rows)


class FakeDB:
    """db.table(nombre) → FakeQuery sobre las filas en memoria de esa tabla."""

    def __init__(self, tables: Dict[str, List[Dict]]):
        self.tables = tables

    def table(self, name: str) -> FakeQuery:
        return FakeQuery(self.tables.setdefault(name, []))
