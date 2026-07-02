"""
Tests de core/auth.py (get_business_id).

Se genera un keypair EC P-256 propio y se reemplaza auth._get_signing_key,
de modo que se ejercita el decode ES256 real de python-jose, no un mock del
decode. Sin llamadas reales a Supabase: el fallback a users usa FakeDB.
"""
import time

import pytest
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import ec
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from jose import jwt

from fake_db import FakeDB
from core import auth

BIZ = "11111111-1111-1111-1111-111111111111"
USER = "99999999-9999-9999-9999-999999999999"


def _pem_keypair() -> tuple[str, str]:
    key = ec.generate_private_key(ec.SECP256R1())
    priv = key.private_bytes(
        serialization.Encoding.PEM,
        serialization.PrivateFormat.PKCS8,
        serialization.NoEncryption(),
    ).decode()
    pub = key.public_key().public_bytes(
        serialization.Encoding.PEM,
        serialization.PublicFormat.SubjectPublicKeyInfo,
    ).decode()
    return priv, pub


_PRIV, _PUB = _pem_keypair()
_OTRA_PRIV, _ = _pem_keypair()  # llave ajena para firmar tokens inválidos


@pytest.fixture(autouse=True)
def _usar_keypair_de_test(monkeypatch):
    # jwt.decode de python-jose acepta la llave pública en PEM directamente
    monkeypatch.setattr(auth, "_get_signing_key", lambda kid: (_PUB, "ES256"))


def _creds(token: str) -> HTTPAuthorizationCredentials:
    return HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)


def _token(claims: dict, key: str = _PRIV) -> str:
    return jwt.encode(claims, key, algorithm="ES256")


# ─── JWT válido ───────────────────────────────────────────────────────────────

def test_jwt_valido_con_claim_business_id():
    token = _token({"sub": USER, "business_id": BIZ})

    assert auth.get_business_id(_creds(token)) == BIZ


def test_jwt_valido_sin_claim_cae_a_lookup_en_users(monkeypatch):
    db = FakeDB({"users": [{"id": USER, "business_id": BIZ}]})
    monkeypatch.setattr(auth, "_get_supabase", lambda: db)
    token = _token({"sub": USER})

    assert auth.get_business_id(_creds(token)) == BIZ


# ─── JWT inválido ─────────────────────────────────────────────────────────────

def test_jwt_firmado_con_otra_llave_da_401():
    token = _token({"business_id": BIZ}, key=_OTRA_PRIV)

    with pytest.raises(HTTPException) as exc:
        auth.get_business_id(_creds(token))
    assert exc.value.status_code == 401


def test_jwt_basura_da_401():
    with pytest.raises(HTTPException) as exc:
        auth.get_business_id(_creds("no-soy-un-jwt"))
    assert exc.value.status_code == 401


def test_jwt_expirado_da_401():
    token = _token({"business_id": BIZ, "exp": int(time.time()) - 3600})

    with pytest.raises(HTTPException) as exc:
        auth.get_business_id(_creds(token))
    assert exc.value.status_code == 401


# ─── Header ausente ───────────────────────────────────────────────────────────

def test_sin_header_authorization_da_401():
    with pytest.raises(HTTPException) as exc:
        auth.get_business_id(None)
    assert exc.value.status_code == 401


# ─── Sin claim utilizable ─────────────────────────────────────────────────────

def test_jwt_sin_business_id_ni_sub_da_403():
    token = _token({"role": "authenticated"})

    with pytest.raises(HTTPException) as exc:
        auth.get_business_id(_creds(token))
    assert exc.value.status_code == 403


def test_usuario_sin_negocio_asociado_da_403(monkeypatch):
    db = FakeDB({"users": [{"id": USER, "business_id": None}]})
    monkeypatch.setattr(auth, "_get_supabase", lambda: db)
    token = _token({"sub": USER})

    with pytest.raises(HTTPException) as exc:
        auth.get_business_id(_creds(token))
    assert exc.value.status_code == 403
