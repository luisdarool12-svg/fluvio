import os
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError

bearer = HTTPBearer()

SUPABASE_JWT_SECRET = os.environ["SUPABASE_JWT_SECRET"]


def get_business_id(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
) -> str:
    """
    Extrae y valida el JWT de Supabase. Devuelve el business_id del usuario.
    El business_id viene del custom claim inyectado en el JWT vía Supabase hook.
    """
    token = credentials.credentials
    try:
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_aud": False},
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
        )

    business_id = payload.get("business_id")
    if not business_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Token no contiene business_id",
        )

    return business_id
