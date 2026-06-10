---
name: hardcoded-secret-block
enabled: true
event: PreToolUse
action: block
pattern: "(sk-ant-|SUPABASE_SERVICE_ROLE_KEY\\s*=\\s*[\"'][^\"']{8}|whatsapp_token\\s*=\\s*[\"'][^\"']{8}|anthropic_api_key\\s*=\\s*[\"'][^\"']{8})"
---
[security] BLOCKED — el contenido parece contener un secret hardcodeado (API key, token o password literal). Usa os.environ[] (Python) o process.env[] (TypeScript) y agrega la variable a .env.example. Nunca commitees un valor real de credencial.
