On/off toggle — violet track when on. Controlled.

```jsx
const [on, setOn] = React.useState(true);
<Switch checked={on} onChange={setOn} />
```

Used in Configuración for bot/notification settings. Pair with a label to its left.
