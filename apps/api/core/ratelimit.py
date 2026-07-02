"""
Rate limiting en memoria, sin dependencias externas.

Suficiente para el despliegue actual (una instancia). Si el API escala a
varias réplicas, este límite pasa a ser por-réplica: muévelo entonces al
proxy (EasyPanel/nginx) o a un almacén compartido.
"""
import time
from collections import defaultdict, deque
from typing import Optional

from fastapi import Request

_WINDOW_SECONDS = 60.0

# Reglas específicas (método, prefijo de ruta, límite por minuto por IP).
# Cubren los endpoints que cuestan dinero real: timbrado CFDI, envío de
# campañas WhatsApp y llamadas a Claude.
_RULES: list[tuple[str, str, int]] = [
    ("POST", "/billing/cfdis", 15),
    ("POST", "/campaigns", 15),
    ("POST", "/chatbot/config/parse-menu", 6),
    ("POST", "/whatsapp/setup/callback", 10),
]

# Techo general para todo lo demás (por IP).
_DEFAULT_LIMIT = 300

_hits: dict[str, deque] = defaultdict(deque)


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _limit_for(method: str, path: str) -> tuple[str, int]:
    for rule_method, prefix, limit in _RULES:
        if method == rule_method and path.startswith(prefix):
            return f"{rule_method}:{prefix}", limit
    return "default", _DEFAULT_LIMIT


def check_rate_limit(request: Request) -> Optional[int]:
    """None si la request pasa; el límite excedido si hay que devolver 429."""
    bucket_name, limit = _limit_for(request.method, request.url.path)
    key = f"{_client_ip(request)}|{bucket_name}"
    now = time.monotonic()

    window = _hits[key]
    while window and now - window[0] > _WINDOW_SECONDS:
        window.popleft()

    if len(window) >= limit:
        return limit

    window.append(now)
    return None
