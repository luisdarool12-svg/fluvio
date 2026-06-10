---
name: missing-business-id-filter
enabled: true
event: PostToolUse
action: warn
pattern: "\\.table\\(\"(?!businesses)[a-z_]+\"\\)\\.(select|update|delete)\\("
---
[multi-tenant] Esta archivo contiene una query de Supabase que podría estar faltando el filtro business_id. Todo .select(), .insert(), .update() y .delete() sobre una tabla de tenant DEBE encadenar .eq("business_id", business_id) o equivalente. Revisa todas las queries en este archivo antes de continuar.
