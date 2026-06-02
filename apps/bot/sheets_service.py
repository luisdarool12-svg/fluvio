import json
from datetime import datetime
from zoneinfo import ZoneInfo
from googleapiclient.discovery import build
from google.oauth2 import service_account

TZ = ZoneInfo("America/Mexico_City")


def _get_sheets_client(bot_config: dict):
    creds_raw = bot_config.get("google_credentials_json") or bot_config.get("google_credentials")
    if not creds_raw:
        raise ValueError("google_credentials_json no configurado en bot_config")
    creds_info = json.loads(creds_raw) if isinstance(creds_raw, str) else creds_raw
    creds = service_account.Credentials.from_service_account_info(
        creds_info,
        scopes=["https://www.googleapis.com/auth/spreadsheets"],
    )
    return build("sheets", "v4", credentials=creds, cache_discovery=False)


def register_event_inscription(business: dict, inscripcion: dict, sender_id: str) -> None:
    """
    Registra la inscripción de un cliente en Google Sheets.
    inscripcion = {"nombre": str, "turno": str}
    """
    bot_config: dict = business.get("bot_config") or {}
    sheets_id = bot_config.get("sheets_id")
    if not sheets_id:
        print("[sheets] sheets_id no configurado — inscripción no guardada")
        return

    service = _get_sheets_client(bot_config)
    timestamp = datetime.now(TZ).strftime("%d/%m/%Y %H:%M")

    service.spreadsheets().values().append(
        spreadsheetId=sheets_id,
        range="Inscripciones!A:D",
        valueInputOption="USER_ENTERED",
        body={
            "values": [[timestamp, inscripcion["nombre"], inscripcion["turno"], sender_id]]
        },
    ).execute()

    print(f"[sheets] Inscripción: {inscripcion['nombre']} — turno {inscripcion['turno']}")
