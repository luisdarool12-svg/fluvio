---
name: no-print-statements-python
enabled: true
event: PostToolUse
action: warn
pattern: "print\\s*\\("
---
[code-quality] print() encontrado en archivo Python. Usa el módulo logging en su lugar (import logging; logger = logging.getLogger(__name__)). Los print() no deben commitearse a código de producción según las reglas del proyecto.
