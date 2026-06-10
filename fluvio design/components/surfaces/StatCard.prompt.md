KPI metric tile — uppercase label, big Syne number, optional trend delta and violet progress ring. Lay out 2×2 (desktop) or 1×4 (narrow).

```jsx
<StatCard icon={<CalIcon/>} label="Reservas hoy" value="10" trend="+18% vs. ayer" trendDir="up" />
<StatCard icon={<CheckIcon/>} label="Confirmadas" ring={70} />
<StatCard icon={<XIcon/>} label="No-shows del mes" value="4" trend="−61%" trendDir="up" />
```

`trendDir`: `up` (green), `down` (coral), `flat` (mist). Set `ring={0..100}` to show a percentage ring in place of the number.
