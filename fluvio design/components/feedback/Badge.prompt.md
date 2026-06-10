Reservation status pill with a leading dot. Pass `status` to auto-label + color, or `variant` + children for a custom pill.

```jsx
<Badge status="confirmada" />
<Badge status="pendiente" />
<Badge status="no_show" />
<Badge variant="seat">Mesa lista</Badge>
```

Statuses: `confirmada` (green) · `pendiente` (violet) · `sentada` (blue) · `no_show` (gray) · `cancelada` (faint gray). Set `dot={false}` to hide the dot.
