"""Tests de la validación de firma X-Hub-Signature-256 del webhook."""
import hashlib
import hmac
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import main


def _sign(body: bytes, secret: str) -> str:
    return "sha256=" + hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()


def test_firma_valida_pasa(monkeypatch):
    monkeypatch.setattr(main, "_META_APP_SECRET", "secreto-test")
    body = b'{"entry": []}'

    assert main._valid_meta_signature(body, _sign(body, "secreto-test"))


def test_firma_con_otro_secreto_falla(monkeypatch):
    monkeypatch.setattr(main, "_META_APP_SECRET", "secreto-test")
    body = b'{"entry": []}'

    assert not main._valid_meta_signature(body, _sign(body, "otro-secreto"))


def test_firma_de_otro_body_falla(monkeypatch):
    monkeypatch.setattr(main, "_META_APP_SECRET", "secreto-test")

    firma = _sign(b'{"entry": []}', "secreto-test")
    assert not main._valid_meta_signature(b'{"entry": ["inyectado"]}', firma)


def test_header_sin_prefijo_sha256_falla(monkeypatch):
    monkeypatch.setattr(main, "_META_APP_SECRET", "secreto-test")

    assert not main._valid_meta_signature(b"{}", "md5=abc")
    assert not main._valid_meta_signature(b"{}", "")


def test_dedupe_de_wamids():
    main._seen_wamids.clear()
    main._seen_order.clear()

    assert not main._already_processed("wamid.A")   # primera vez: procesar
    assert main._already_processed("wamid.A")       # repetido: ignorar
    assert not main._already_processed("wamid.B")
    assert not main._already_processed("")          # sin id: nunca bloquear
