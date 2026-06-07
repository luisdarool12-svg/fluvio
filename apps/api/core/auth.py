import os
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, jwk, JWTError
from supabase import create_client

bearer = HTTPBearer()

# Supabase project uses ES256 (ECDSA P-256) for JWT signing.
# Public key fetched from: https://<project>.supabase.co/auth/v1/.well-known/jwks.json
_JWKS_KEY = {
    "alg": "ES256",
    "crv": "P-256",
    "kid": "ecc5afea-9600-4df2-9bc7-a04170de1a8c",
    "kty": "EC",
    "use": "sig",
    "x": "mC_bvzJpp5gLMxySa6xoFRRYuBk4Ey4UDMjl822Qa40",
    "y": "xEhV9NreOw2utUeR4XQpwJMkrCyIkm4fJbfsC9ZKGfM",
}
_PUBLIC_KEY = jwk.construct(_JWKS_KEY)


def _get_supabase():
    return create_client(
        os.environ["SUPABASE_URL"],
        os.environ["SUPABASE_SERVICE_ROLE_KEY"],
    )


def get_business_id(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
) -> str:
    """
    Validates a Supabase JWT (ES256) and returns the business_id.
    Falls back to a DB lookup when the Auth Hook hasn't injected business_id.
    """
    token = credentials.credentials
    try:
        payload = jwt.decode(
            token,
            _PUBLIC_KEY,
            algorithms=["ES256"],
            options={"verify_aud": False},
        )
    except JWTError:
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
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Token no contiene sub",
        )

    db = _get_supabase()
    result = (
        db.table("users")
        .select("business_id")
        .eq("id", user_id)
        .single()
        .execute()
    )
    if not result.data or not result.data.get("business_id"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario sin negocio asociado",
        )

    return result.data["business_id"]
