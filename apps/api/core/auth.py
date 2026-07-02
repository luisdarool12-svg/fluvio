import logging
import os
import time
from threading import Lock
from typing import Optional

import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, jwk, JWTError

from core.db import get_db

logger = logging.getLogger("uvicorn.error")

bearer = HTTPBearer(auto_error=False)

# Fallback estático por si el endpoint JWKS no responde en el arranque.
# La fuente de verdad es el JWKS del proyecto (soporta rotación de llaves).
_FALLBACK_JWKS_KEY = {
    "alg": "ES256",
    "crv": "P-256",
    "kid": "ecc5afea-9600-4df2-9bc7-a04170de1a8c",
    "kty": "EC",
    "use": "sig",
    "x": "mC_bvzJpp5gLMxySa6xoFRRYuBk4Ey4UDMjl822Qa40",
    "y": "xEhV9NreOw2utUeR4XQpwJMkrCyIkm4fJbfsC9ZKGfM",
}

_JWKS_TTL_SECONDS = 3600
_jwks_lock = Lock()
_jwks_cache: dict = {"keys": {}, "fetched_at": 0.0}


def _fetch_jwks() -> dict:
    """kid → (key construida, alg) desde el JWKS público de Supabase."""
    url = f"{os.environ['SUPABASE_URL']}/auth/v1/.well-known/jwks.json"
    resp = httpx.get(url, timeout=5.0)
    resp.raise_for_status()
    keys = {}
    for k in resp.json().get("keys", []):
        kid = k.get("kid")
        if kid:
            keys[kid] = (jwk.construct(k), k.get("alg", "ES256"))
    return keys


def _get_signing_key(kid: Optional[str]) -> tuple:
    """
    Resuelve la llave de firma por kid, refrescando el JWKS si venció el TTL
    o si aparece un kid desconocido (rotación de llaves). Si el fetch falla,
    sirve el cache viejo o el fallback estático antes que tirar el login.
    """
    with _jwks_lock:
        now = time.time()
        stale = now - _jwks_cache["fetched_at"] > _JWKS_TTL_SECONDS
        unknown_kid = kid is not None and kid not in _jwks_cache["keys"]
        if stale or unknown_kid:
            try:
                _jwks_cache["keys"] = _fetch_jwks()
                _jwks_cache["fetched_at"] = now
            except Exception as e:  # noqa: BLE001 — red caída: usar cache/fallback
                logger.warning(f"[auth] No se pudo refrescar JWKS: {e}")
                _jwks_cache["fetched_at"] = now  # no martillar el endpoint caído

        if kid and kid in _jwks_cache["keys"]:
            return _jwks_cache["keys"][kid]

    return (jwk.construct(_FALLBACK_JWKS_KEY), _FALLBACK_JWKS_KEY["alg"])


def _get_supabase():
    """Wrapper delgado sobre el singleton — seam para los tests."""
    return get_db()


def get_business_id(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer),
) -> str:
    """
    Validates a Supabase JWT and returns the business_id.
    Falls back to a DB lookup when the Auth Hook hasn't injected business_id.
    """
    if credentials is None or not credentials.credentials:
        logger.warning("[auth] Rechazado: falta el header Authorization o el token va vacío")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Falta el token de autenticación (sesión no iniciada o expirada)",
        )

    token = credentials.credentials
    try:
        kid = jwt.get_unverified_header(token).get("kid")
        key, alg = _get_signing_key(kid)
        payload = jwt.decode(
            token,
            key,
            algorithms=[alg],
            options={"verify_aud": False},
        )
    except JWTError as e:
        logger.warning(f"[auth] Rechazado: token inválido — {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
        )

    business_id = payload.get("business_id")
    if business_id:
        return business_id

    # Auth Hook not configured — look up business_id from users table
    user_id = payload.get("sub")
    if not user_id:
        logger.warning("[auth] Rechazado: el token no contiene claim sub")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Token no contiene sub",
        )

    result = (
        _get_supabase().table("users")
        .select("business_id")
        .eq("id", user_id)
        .single()
        .execute()
    )
    if not result.data or not result.data.get("business_id"):
        logger.warning(f"[auth] Rechazado: usuario {user_id} sin business_id en tabla users")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario sin negocio asociado",
        )

    return result.data["business_id"]
