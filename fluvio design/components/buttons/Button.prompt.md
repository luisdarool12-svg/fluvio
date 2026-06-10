Fluvio's action button — coral primary CTA (use once per view), violet secondary, plus soft/ghost/subtle/danger for lower emphasis.

```jsx
<Button variant="primary" icon={<PlusIcon />}>Nueva reservación</Button>
<Button variant="violet">Aplicar filtros</Button>
<Button variant="ghost" size="sm">Cancelar</Button>
<Button variant="soft" size="sm" icon={<HistoryIcon />}>Ver actividad</Button>
```

- **variant**: `primary` (coral — the action color, sparingly), `violet` (brand/secondary), `soft`, `ghost`, `subtle`, `danger`
- **size**: `sm` · `md` · `lg`
- **icon / iconRight**: pass an SVG node. Icon-only buttons (no children) auto-render square.
- **block**: full-width. **disabled**: 55% opacity, no pointer.
