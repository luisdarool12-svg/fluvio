"""Tests del TTL de _business_cache en agent.get_business()."""
import sys
import time
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))

import agent


class _FakeQuery:
    """Imita la cadena table().select().eq().eq().execute() de supabase-py."""

    def __init__(self, data: list[dict], fail: bool = False):
        self._data = data
        self._fail = fail

    def table(self, *_args, **_kwargs):
        return self

    def select(self, *_args, **_kwargs):
        return self

    def eq(self, *_args, **_kwargs):
        return self

    def execute(self):
        if self._fail:
            raise RuntimeError("supabase caído")

        class _Result:
            data = self._data

        return _Result()


@pytest.fixture(autouse=True)
def _cache_limpio():
    agent._business_cache.clear()
    yield
    agent._business_cache.clear()


def _expirar_entrada(phone_number_id: str):
    """Reescribe el timestamp de la entrada para simular que pasó el TTL."""
    data, _ = agent._business_cache[phone_number_id]
    agent._business_cache[phone_number_id] = (
        data,
        time.monotonic() - agent.BUSINESS_CACHE_TTL_SECONDS - 1,
    )


def test_cache_hit_dentro_del_ttl(monkeypatch):
    # Arrange
    v1 = {"id": "biz-1", "bot_config": {"system_prompt": "v1"}}
    monkeypatch.setattr(agent, "_db", lambda: _FakeQuery([v1]))

    # Act
    primera = agent.get_business("555")
    monkeypatch.setattr(agent, "_db", lambda: _FakeQuery([{"id": "biz-1", "bot_config": {"system_prompt": "v2"}}]))
    segunda = agent.get_business("555")

    # Assert — dentro del TTL no se vuelve a consultar la base
    assert primera == v1
    assert segunda == v1


def test_cache_expira_tras_el_ttl(monkeypatch):
    # Arrange
    v1 = {"id": "biz-1", "bot_config": {"system_prompt": "v1"}}
    v2 = {"id": "biz-1", "bot_config": {"system_prompt": "v2"}}
    monkeypatch.setattr(agent, "_db", lambda: _FakeQuery([v1]))
    agent.get_business("555")
    _expirar_entrada("555")

    # Act — tras expirar, el cambio del dashboard ya es visible
    monkeypatch.setattr(agent, "_db", lambda: _FakeQuery([v2]))
    resultado = agent.get_business("555")

    # Assert
    assert resultado == v2
    assert agent._business_cache["555"][0] == v2


def test_sirve_stale_si_supabase_falla(monkeypatch):
    # Arrange — entrada vencida y Supabase caído
    v1 = {"id": "biz-1", "bot_config": {"system_prompt": "v1"}}
    monkeypatch.setattr(agent, "_db", lambda: _FakeQuery([v1]))
    agent.get_business("555")
    _expirar_entrada("555")
    monkeypatch.setattr(agent, "_db", lambda: _FakeQuery([], fail=True))

    # Act
    resultado = agent.get_business("555")

    # Assert — mejor responder con config vieja que tirar la conversación
    assert resultado == v1


def test_error_propaga_sin_cache_previo(monkeypatch):
    # Arrange — sin entrada en cache no hay fallback posible
    monkeypatch.setattr(agent, "_db", lambda: _FakeQuery([], fail=True))

    # Act / Assert
    with pytest.raises(RuntimeError):
        agent.get_business("999")


def test_negocio_inexistente_devuelve_none(monkeypatch):
    monkeypatch.setattr(agent, "_db", lambda: _FakeQuery([]))
    assert agent.get_business("000") is None
