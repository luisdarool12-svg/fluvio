---
name: file-size-limit-800-lines
enabled: true
event: PreToolUse
action: block
pattern: ""
---
[code-quality] BLOCKED — el archivo a escribir excede 800 líneas. Divide en módulos más pequeños y enfocados antes de escribir. Los routers se separan por dominio (ej. conversations.py vs system_prompt.py). Máximo 800 líneas por archivo según las reglas del proyecto.
