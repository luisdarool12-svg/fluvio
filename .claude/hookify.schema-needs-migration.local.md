---
name: schema-change-needs-migration
enabled: true
event: PostToolUse
action: warn
pattern: "(ALTER TABLE|CREATE TABLE|ADD COLUMN|DROP COLUMN)"
---
[schema] Editaste un archivo que contiene cambios de esquema. Si introduces una nueva columna, tabla o índice, DEBES crear el archivo de migración correspondiente en platform/packages/database/migrations/ con el siguiente número secuencial (ej. 006_<feature>.sql). Verifica que la migración exista antes de terminar.
