---
name: no-per-client-folder
enabled: true
event: PreToolUse
action: block
pattern: "(pilots/|clients/|tenants/|businesses/)[a-z_\\-]+/(app|src|api|bot)/"
---
[architecture] BLOCKED — crear una carpeta o archivo que parezca una copia por cliente viola la regla multi-tenant. Los nuevos clientes son FILAS en la tabla `businesses`, nunca directorios o codebases separados. Ejecuta: INSERT INTO businesses (...) en su lugar.
