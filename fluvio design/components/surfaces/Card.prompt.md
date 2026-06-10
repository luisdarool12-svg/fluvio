Base white surface. Elevation comes from the 1px line border — never a drop shadow. 12px radius (14px when `prominent`).

```jsx
<Card>
  <h2>Próximas reservas</h2>
  <p className="muted">Hoy y mañana</p>
</Card>
<Card prominent pad="lg">…</Card>
```

`pad`: `none` · `md` (18px) · `lg` (20px). Set `pad="none"` when the card wraps a table or its own padded sections.
