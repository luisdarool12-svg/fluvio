#!/bin/bash
ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "▶ Iniciando API (puerto 8000)..."
cd "$ROOT/apps/api"
source .venv/bin/activate
uvicorn main:app --reload --port 8000 &
API_PID=$!

echo "▶ Iniciando Bot (puerto 8001)..."
cd "$ROOT/apps/bot"
.venv/bin/uvicorn main:app --reload --port 8001 &
BOT_PID=$!

echo "▶ Iniciando Web (puerto 3000)..."
cd "$ROOT/apps/web"
npm run dev &
WEB_PID=$!

echo ""
echo "✓ Todo corriendo:"
echo "  API  → http://localhost:8000"
echo "  Bot  → http://localhost:8001"
echo "  Web  → http://localhost:3001"
echo ""
echo "Presiona Ctrl+C para detener todo."

trap "kill $API_PID $BOT_PID $WEB_PID 2>/dev/null; exit" INT
wait
