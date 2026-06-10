Labeled text field — violet focus ring, optional leading icon and helper hint.

```jsx
<Input label="Nombre del cliente" placeholder="Sofía Mendoza" />
<Input icon={<SearchIcon/>} placeholder="Buscar reservas, clientes…" />
<Input label="Personas" type="number" hint="Máximo 12 por mesa" />
```

Renders bare (no wrapper) when neither `label` nor `hint` is set — handy inside toolbars/search bars.
