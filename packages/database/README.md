# packages/database

Migraciones SQL y cliente Supabase.

## Aplicar migraciones

1. Abre tu proyecto en [Supabase Studio](https://supabase.com/dashboard)
2. Ve a **SQL Editor**
3. Copia y ejecuta el contenido de `migrations/001_initial_schema.sql`

## Agregar una migración nueva

1. Crea un archivo con el siguiente número: `migrations/002_nombre_descriptivo.sql`
2. Escribe solo el SQL incremental (no repetir lo que ya existe)
3. Ejecuta en Supabase Studio
4. Documenta el cambio en `docs/progress/CHANGELOG.md`

## Cliente Supabase (Python)

```python
import os
from supabase import create_client

supabase = create_client(
    os.environ["SUPABASE_URL"],
    os.environ["SUPABASE_SERVICE_ROLE_KEY"]  # para el bot/api
)
```

## Cliente Supabase (TypeScript/Next.js)

```typescript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```
