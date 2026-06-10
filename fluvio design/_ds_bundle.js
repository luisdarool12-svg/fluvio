/* @ds-bundle: {"format":3,"namespace":"DesignSystem_578428","components":[{"name":"Logo","sourcePath":"components/brand/Logo.jsx"},{"name":"Button","sourcePath":"components/buttons/Button.jsx"},{"name":"Avatar","sourcePath":"components/feedback/Avatar.jsx"},{"name":"Badge","sourcePath":"components/feedback/Badge.jsx"},{"name":"Chip","sourcePath":"components/forms/Chip.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"Card","sourcePath":"components/surfaces/Card.jsx"},{"name":"StatCard","sourcePath":"components/surfaces/StatCard.jsx"}],"sourceHashes":{"components/brand/Logo.jsx":"40653cee1edc","components/buttons/Button.jsx":"800e4eb7653b","components/feedback/Avatar.jsx":"9a007ccf2d7a","components/feedback/Badge.jsx":"ab71d19702ac","components/forms/Chip.jsx":"9dd1041b73ba","components/forms/Input.jsx":"ccab7efbe987","components/forms/Switch.jsx":"e9c707495061","components/surfaces/Card.jsx":"1019943bf9cf","components/surfaces/StatCard.jsx":"83a0834f9107","ui_kits/fluvio-app/app-shell.jsx":"8c0aeb6385bd","ui_kits/fluvio-app/app.jsx":"556ee07709fd","ui_kits/fluvio-app/components.jsx":"68ebfc64d5ab","ui_kits/fluvio-app/lib.jsx":"613b164c48af","ui_kits/fluvio-app/screens-dashboard.jsx":"643fed860d28","ui_kits/fluvio-app/screens-landing.jsx":"ad2833b7a5e5","ui_kits/fluvio-app/screens-login.jsx":"1380ac07a5eb","ui_kits/fluvio-app/screens-misc.jsx":"f3f8226014ce","ui_kits/fluvio-app/screens-reservaciones.jsx":"6a6c97e0fcf4"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.DesignSystem_578428 = window.DesignSystem_578428 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/brand/Logo.jsx
try { (() => {
/**
 * Fluvio Logo — three flowing wave currents (violet → medium violet → coral),
 * the brand gradient expressed through the mark without a CSS gradient.
 * variant "color" for light backgrounds, "mono" (all white) for the dark sidebar.
 * Set `wordmark` to render the FLUVIO lockup.
 */
function Logo({
  size = 28,
  variant = 'color',
  wordmark = false
}) {
  const mono = variant === 'mono';
  const c1 = mono ? '#FFFFFF' : '#6447F5';
  const c2 = mono ? '#FFFFFF' : '#9B8CF8';
  const c3 = mono ? '#FFFFFF' : '#FF6A38';
  const mark = /*#__PURE__*/React.createElement("svg", {
    width: size * 1.15,
    height: size,
    viewBox: "0 0 46 40",
    fill: "none",
    style: {
      flex: 'none'
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12 C11 7.2 16 7.2 23 11.4 C30 15.6 35 15.6 41 10.6",
    stroke: c1,
    strokeWidth: "6.2",
    strokeLinecap: "round"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6 21.4 C11.4 17.2 15.8 17.2 21.6 20.8 C27 24 31 24 36 20.4",
    stroke: c2,
    strokeOpacity: mono ? 0.65 : 1,
    strokeWidth: "5.7",
    strokeLinecap: "round"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9.5 30.4 C13.6 27 17 27 21.6 29.8 C25.2 32 27.8 32 30.8 29.6",
    stroke: c3,
    strokeOpacity: mono ? 0.9 : 1,
    strokeWidth: "5.4",
    strokeLinecap: "round"
  }));
  if (!wordmark) return mark;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: size * 0.46
    }
  }, mark, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: size * 0.82,
      letterSpacing: '0.04em',
      lineHeight: 1,
      color: mono ? '#FFFFFF' : '#6447F5'
    }
  }, "FLUVIO"));
}
Object.assign(__ds_scope, { Logo });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/Logo.jsx", error: String((e && e.message) || e) }); }

// components/buttons/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Fluvio Button — the action primitive.
 * Primary = Coral (the action color, use sparingly). Violet = secondary/brand.
 * Soft / ghost / subtle / danger for lower-emphasis actions.
 */
function Button({
  variant = 'primary',
  size = 'md',
  icon = null,
  iconRight = null,
  block = false,
  disabled = false,
  type = 'button',
  className = '',
  children,
  ...rest
}) {
  const variantClass = {
    primary: 'btn-primary',
    // Coral CTA — "Nueva reservación", "Mejorar plan"
    violet: 'btn-violet',
    // brand / secondary
    soft: 'btn-soft',
    ghost: 'btn-ghost',
    subtle: 'btn-subtle',
    danger: 'btn-danger'
  }[variant] || 'btn-primary';
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';
  const iconOnly = !children && (icon || iconRight);
  const cls = ['btn', variantClass, sizeClass, iconOnly ? 'btn-icon' : '', block ? 'btn-block' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    className: cls,
    disabled: disabled
  }, rest), icon, children && /*#__PURE__*/React.createElement("span", null, children), iconRight);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/Button.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Avatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function initials(name = '') {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] || '') + (p[1]?.[0] || '')).toUpperCase() || '?';
}

/**
 * Fluvio Avatar — circular initials chip. Uniform violet-light fill with
 * violet-dark initials in Syne (per brand). Optional VIP ring.
 */
function Avatar({
  name = '',
  size = 34,
  vip = false,
  className = '',
  style = {},
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    className: ['avatar', className].filter(Boolean).join(' '),
    style: {
      width: size,
      height: size,
      fontSize: Math.round(size * 0.34),
      ...(vip ? {
        boxShadow: '0 0 0 2px var(--surface), 0 0 0 3.5px var(--coral)'
      } : {}),
      ...style
    }
  }, rest), initials(name));
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const STATUS = {
  confirmada: {
    cls: 'badge-conf',
    label: 'Confirmada'
  },
  pendiente: {
    cls: 'badge-pend',
    label: 'Pendiente'
  },
  sentada: {
    cls: 'badge-seat',
    label: 'Sentada'
  },
  no_show: {
    cls: 'badge-no',
    label: 'No-show'
  },
  cancelada: {
    cls: 'badge-canc',
    label: 'Cancelada'
  }
};

/**
 * Fluvio Badge — small status pill with a leading dot.
 * Pass `status` for a reservation state (maps to the brand status palette),
 * or `variant` + children for a custom pill.
 */
function Badge({
  status,
  variant,
  dot = true,
  className = '',
  children,
  ...rest
}) {
  if (status) {
    const s = STATUS[status] || STATUS.pendiente;
    return /*#__PURE__*/React.createElement("span", _extends({
      className: ['badge', s.cls, className].filter(Boolean).join(' ')
    }, rest), dot && /*#__PURE__*/React.createElement("span", {
      className: "dot"
    }), children || s.label);
  }
  const variantClass = {
    conf: 'badge-conf',
    pend: 'badge-pend',
    seat: 'badge-seat',
    no: 'badge-no',
    canc: 'badge-canc'
  }[variant] || 'badge-pend';
  return /*#__PURE__*/React.createElement("span", _extends({
    className: ['badge', variantClass, className].filter(Boolean).join(' ')
  }, rest), dot && /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Badge.jsx", error: String((e && e.message) || e) }); }

// components/forms/Chip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Fluvio Chip — pill filter/tab. Active = violet fill; inactive = mist text
 * that darkens on hover. Use in groups inside cards (filter tabs).
 */
function Chip({
  active = false,
  icon,
  className = '',
  children,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    className: ['ftab', active ? 'on' : '', className].filter(Boolean).join(' ')
  }, rest), icon, children);
}
Object.assign(__ds_scope, { Chip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Chip.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Fluvio Input — labeled text field. Violet focus ring, optional leading icon.
 */
function Input({
  label,
  icon,
  hint,
  id,
  className = '',
  style = {},
  ...rest
}) {
  const inputId = id || (label ? 'in-' + label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const field = /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center'
    }
  }, icon && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: 12,
      display: 'grid',
      placeItems: 'center',
      color: 'var(--ink-3)',
      pointerEvents: 'none'
    }
  }, icon), /*#__PURE__*/React.createElement("input", _extends({
    id: inputId,
    className: ['input', className].filter(Boolean).join(' '),
    style: {
      ...(icon ? {
        paddingLeft: 38
      } : {}),
      ...style
    }
  }, rest)));
  if (!label && !hint) return field;
  return /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId
  }, label), field, hint && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'var(--ink-3)'
    }
  }, hint));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Fluvio Switch — on/off toggle. Violet when on. Controlled via `checked`.
 */
function Switch({
  checked = false,
  onChange,
  disabled = false,
  className = '',
  ...rest
}) {
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    role: "switch",
    "aria-checked": checked,
    disabled: disabled,
    onClick: () => !disabled && onChange && onChange(!checked),
    className: ['switch', checked ? 'on' : '', className].filter(Boolean).join(' '),
    style: {
      border: 'none',
      opacity: disabled ? 0.5 : 1,
      cursor: disabled ? 'not-allowed' : 'pointer'
    }
  }, rest));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Fluvio Card — the base surface. White, 1px line border, 12px radius.
 * Elevation is the border, never a shadow (overlays excepted).
 */
function Card({
  prominent = false,
  pad = 'md',
  className = '',
  children,
  ...rest
}) {
  const padClass = pad === 'lg' ? 'card-pad-lg' : pad === 'none' ? '' : 'card-pad';
  const cls = ['card', prominent ? 'card-prominent' : '', padClass, className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cls
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/Card.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/StatCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Fluvio StatCard — a KPI metric tile. Uppercase label, large Syne number,
 * optional trend delta, optional progress ring. Icon in a violet-light chip.
 */
function StatCard({
  icon,
  label,
  value,
  trend,
  trendDir = 'flat',
  ring,
  className = '',
  ...rest
}) {
  const trendClass = trendDir === 'up' ? 'trend-up' : trendDir === 'down' ? 'trend-down' : '';
  const trendColor = trendDir === 'flat' ? 'var(--ink-3)' : undefined;
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ['stat', className].filter(Boolean).join(' ')
  }, rest), /*#__PURE__*/React.createElement("div", {
    className: "stat-top"
  }, /*#__PURE__*/React.createElement("span", {
    className: "stat-label"
  }, label), icon && /*#__PURE__*/React.createElement("span", {
    className: "stat-ico"
  }, icon)), ring != null ? /*#__PURE__*/React.createElement(Ring, {
    value: ring
  }) : /*#__PURE__*/React.createElement("div", {
    className: "stat-value"
  }, value), trend && /*#__PURE__*/React.createElement("div", {
    className: ['stat-foot', trendClass].filter(Boolean).join(' '),
    style: trendColor ? {
      color: trendColor
    } : undefined
  }, trend));
}
function Ring({
  value = 0,
  size = 56
}) {
  const r = (size - 7) / 2;
  const c = 2 * Math.PI * r;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: size,
      height: size
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    style: {
      transform: 'rotate(-90deg)'
    }
  }, /*#__PURE__*/React.createElement("circle", {
    cx: size / 2,
    cy: size / 2,
    r: r,
    fill: "none",
    stroke: "var(--surface-3)",
    strokeWidth: "6"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: size / 2,
    cy: size / 2,
    r: r,
    fill: "none",
    stroke: "var(--violet)",
    strokeWidth: "6",
    strokeLinecap: "round",
    strokeDasharray: c,
    strokeDashoffset: c * (1 - value / 100)
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'grid',
      placeItems: 'center',
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: 15,
      color: 'var(--ink)'
    }
  }, value, "%"));
}
Object.assign(__ds_scope, { StatCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/StatCard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/fluvio-app/app-shell.jsx
try { (() => {
/* ============================================================
   FLUVIO — App shell: Sidebar + Topbar
   ============================================================ */

const NAV = [{
  key: 'dashboard',
  label: 'Dashboard',
  icon: 'dashboard'
}, {
  key: 'reservaciones',
  label: 'Reservaciones',
  icon: 'calendar',
  count: 10
}, {
  key: 'clientes',
  label: 'Clientes',
  icon: 'users'
}, {
  key: 'mesas',
  label: 'Mesas',
  icon: 'tables'
}, {
  key: 'configuracion',
  label: 'Configuración',
  icon: 'settings'
}];
function Sidebar({
  route,
  onNav,
  business,
  open,
  onClose
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: 'sb-backdrop' + (open ? ' show' : ''),
    onClick: onClose
  }), /*#__PURE__*/React.createElement("aside", {
    className: 'sidebar' + (open ? ' open' : '')
  }, /*#__PURE__*/React.createElement("div", {
    className: "sb-brand"
  }, /*#__PURE__*/React.createElement(Logo, {
    size: 30,
    mono: true
  }), /*#__PURE__*/React.createElement("div", {
    className: "col",
    style: {
      gap: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "display",
    style: {
      fontWeight: 700,
      fontSize: 17,
      letterSpacing: '-0.02em',
      lineHeight: 1.1,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, business), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      color: 'var(--ink-3)',
      fontWeight: 500
    }
  }, "v\xEDa Fluvio"))), /*#__PURE__*/React.createElement("nav", {
    className: "sb-nav"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sb-section-label"
  }, "Operaci\xF3n"), NAV.map(n => /*#__PURE__*/React.createElement("div", {
    key: n.key,
    className: 'nav-item' + (route === n.key ? ' active' : ''),
    onClick: () => {
      onNav(n.key);
      onClose();
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: n.icon,
    size: 18
  }), /*#__PURE__*/React.createElement("span", null, n.label), n.count != null && /*#__PURE__*/React.createElement("span", {
    className: "nav-count"
  }, n.count)))), /*#__PURE__*/React.createElement("div", {
    className: "sb-foot"
  }, /*#__PURE__*/React.createElement("div", {
    className: "plan-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      justifyContent: 'space-between',
      marginBottom: 9
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "row gap-6",
    style: {
      fontWeight: 600,
      fontSize: 13.5,
      whiteSpace: 'nowrap'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "zap",
    size: 15,
    style: {
      color: 'var(--violet)'
    }
  }), " Plan Starter"), /*#__PURE__*/React.createElement("span", {
    className: "badge badge-conf",
    style: {
      height: 20,
      padding: '0 8px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), "Activo")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 6,
      borderRadius: 99,
      background: 'var(--surface-3)',
      overflow: 'hidden',
      marginBottom: 7
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '64%',
      height: '100%',
      background: 'var(--violet)',
      borderRadius: 99
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "faint",
    style: {
      fontSize: 11.5,
      whiteSpace: 'nowrap'
    }
  }, "320 / 500 reservas"), /*#__PURE__*/React.createElement("a", {
    className: "row gap-2",
    style: {
      fontSize: 12.5,
      fontWeight: 600,
      color: 'var(--violet-ink)'
    },
    onClick: () => onNav('configuracion')
  }, "Mejorar"))), /*#__PURE__*/React.createElement("div", {
    className: "user-row",
    onClick: () => onNav('configuracion')
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: "Luis Duble",
    size: 34
  }), /*#__PURE__*/React.createElement("div", {
    className: "col",
    style: {
      gap: 0,
      minWidth: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600,
      fontSize: 13.5,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, "Luis Duble"), /*#__PURE__*/React.createElement("span", {
    className: "faint",
    style: {
      fontSize: 12
    }
  }, "luis@dublebistro.mx")), /*#__PURE__*/React.createElement(Icon, {
    name: "chevronDown",
    size: 16,
    style: {
      color: 'var(--ink-3)'
    }
  })))));
}
function Topbar({
  onMenu,
  onNewRes,
  onNav,
  title
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "topbar"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-icon btn-subtle menu-btn",
    onClick: onMenu
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "menu",
    size: 20
  })), /*#__PURE__*/React.createElement("div", {
    className: "search-wrap hide-sm",
    style: {
      width: 320,
      maxWidth: '36vw'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    className: "s-ico"
  }), /*#__PURE__*/React.createElement("input", {
    className: "input",
    style: {
      height: 38,
      background: 'var(--surface-2)',
      border: '1px solid transparent'
    },
    placeholder: "Buscar reservas, clientes\u2026"
  })), /*#__PURE__*/React.createElement("div", {
    className: "spacer"
  }), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-soft btn-icon",
    title: "Notificaciones",
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "bell",
    size: 18
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 7,
      right: 8,
      width: 7,
      height: 7,
      borderRadius: 99,
      background: 'var(--st-no-dot)',
      border: '1.5px solid var(--surface)'
    }
  })), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    onClick: onNewRes
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 17
  }), /*#__PURE__*/React.createElement("span", {
    className: "hide-sm"
  }, "Nueva reservaci\xF3n")));
}
Object.assign(window, {
  Sidebar,
  Topbar,
  NAV
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/fluvio-app/app-shell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/fluvio-app/app.jsx
try { (() => {
/* ============================================================
   FLUVIO — App UI kit · routing + state + live feed + toasts
   (Brand-fixed build — no theming/tweaks. Mock data from lib.jsx.)
   ============================================================ */
const {
  useState,
  useEffect
} = React;
let feedSeq = 100;
function agePeriod(t) {
  if (t === 'Ahora') return 'hace 1 min';
  const m = t.match(/hace (\d+) min/);
  if (m) return `hace ${+m[1] + 5} min`;
  return t;
}
function App() {
  const [route, setRoute] = useState(() => localStorage.getItem('fluvio_kit_route') || 'dashboard');
  const [reservations, setReservations] = useState(() => ALL_RES.map(r => ({
    ...r
  })));
  const [drawer, setDrawer] = useState(null);
  const [sbOpen, setSbOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [feed, setFeed] = useState(() => AI_FEED_SEED.map((f, i) => ({
    ...f,
    id: 'seed' + i
  })));
  useEffect(() => {
    localStorage.setItem('fluvio_kit_route', route);
    window.scrollTo(0, 0);
  }, [route]);

  // Live WhatsApp / AI feed — only inside the app
  useEffect(() => {
    if (route === 'landing' || route === 'login') return;
    const iv = setInterval(() => {
      const pick = AI_FEED_POOL[Math.floor(Math.random() * AI_FEED_POOL.length)];
      setFeed(f => [{
        ...pick,
        id: 'f' + feedSeq++,
        t: 'Ahora'
      }, ...f.map(x => ({
        ...x,
        t: agePeriod(x.t)
      }))].slice(0, 12));
    }, 6500);
    return () => clearInterval(iv);
  }, [route]);
  const nav = r => {
    setRoute(r);
    setSbOpen(false);
  };
  const showToast = (msg, kind = 'ok') => {
    setToast({
      msg,
      kind
    });
    setTimeout(() => setToast(null), 2400);
  };
  const onAction = (id, kind) => {
    if (kind === 'edit') {
      const r = reservations.find(x => x.id === id);
      setDrawer({
        res: r
      });
      return;
    }
    const map = {
      confirmar: 'confirmada',
      sentar: 'sentada',
      no_show: 'no_show',
      cancelar: 'cancelada'
    };
    const ns = map[kind];
    if (!ns) return;
    setReservations(rs => rs.map(r => r.id === id ? {
      ...r,
      status: ns
    } : r));
    const cl = clientById(reservations.find(r => r.id === id)?.clientId);
    const labels = {
      confirmada: 'confirmada',
      sentada: 'sentada',
      no_show: 'marcada como no-show',
      cancelada: 'cancelada'
    };
    showToast(`Reserva de ${cl?.name.split(' ')[0]} ${labels[ns]}`, ns === 'no_show' ? 'warn' : 'ok');
  };
  const openRes = res => setDrawer({
    res
  });
  const newRes = () => setDrawer({});
  const saveRes = data => {
    setDrawer(null);
    showToast(data?.client ? `Reserva creada para ${data.client.split(' ')[0]}` : 'Reservación guardada');
  };
  const isApp = route !== 'landing' && route !== 'login';
  return /*#__PURE__*/React.createElement(React.Fragment, null, route === 'landing' && /*#__PURE__*/React.createElement(Landing, {
    onNav: nav
  }), route === 'login' && /*#__PURE__*/React.createElement(Login, {
    onNav: nav
  }), isApp && /*#__PURE__*/React.createElement("div", {
    className: "app-shell"
  }, /*#__PURE__*/React.createElement(Sidebar, {
    route: route,
    onNav: nav,
    business: "Duble Bistr\xF3",
    open: sbOpen,
    onClose: () => setSbOpen(false)
  }), /*#__PURE__*/React.createElement("div", {
    className: "main"
  }, /*#__PURE__*/React.createElement(Topbar, {
    onMenu: () => setSbOpen(true),
    onNewRes: newRes,
    onNav: nav
  }), route === 'dashboard' && /*#__PURE__*/React.createElement(Dashboard, {
    reservations: reservations,
    onAction: onAction,
    onOpen: openRes,
    onNewRes: newRes,
    onNav: nav,
    layout: "metrics",
    feed: feed
  }), route === 'reservaciones' && /*#__PURE__*/React.createElement(Reservaciones, {
    reservations: reservations,
    onAction: onAction,
    onOpen: openRes,
    onNewRes: newRes
  }), route === 'clientes' && /*#__PURE__*/React.createElement(Clientes, {
    reservations: reservations
  }), route === 'mesas' && /*#__PURE__*/React.createElement(Mesas, null), route === 'configuracion' && /*#__PURE__*/React.createElement(Configuracion, null))), drawer && /*#__PURE__*/React.createElement(ReservationDrawer, {
    res: drawer.res,
    onClose: () => setDrawer(null),
    onSave: saveRes
  }), toast && /*#__PURE__*/React.createElement("div", {
    className: "toast"
  }, /*#__PURE__*/React.createElement("span", {
    className: "toast-ico",
    style: {
      background: toast.kind === 'warn' ? 'var(--coral)' : 'var(--st-conf-dot)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: toast.kind === 'warn' ? 'x' : 'check',
    size: 14,
    strokeWidth: 2.4
  })), toast.msg));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/fluvio-app/app.jsx", error: String((e && e.message) || e) }); }

// ui_kits/fluvio-app/components.jsx
try { (() => {
/* ============================================================
   FLUVIO — Componentes reutilizables
   ============================================================ */

/* Fluvio mark — three flowing wave currents (violet → medium violet → coral).
   variant: 'color' (brand, light bg) · 'mono' (all-white, dark bg per brief). */
function Logo({
  size = 26,
  variant = 'color',
  mono = false
}) {
  const _mono = mono || variant === 'mono';
  const c1 = _mono ? '#FFFFFF' : '#6447F5';
  const c2 = _mono ? '#FFFFFF' : '#9B8CF8';
  const c3 = _mono ? '#FFFFFF' : '#FF6A38';
  return /*#__PURE__*/React.createElement("svg", {
    width: size * 1.15,
    height: size,
    viewBox: "0 0 46 40",
    fill: "none",
    style: {
      flex: 'none'
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12 C11 7.2 16 7.2 23 11.4 C30 15.6 35 15.6 41 10.6",
    stroke: c1,
    strokeWidth: "6.2",
    strokeLinecap: "round"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6 21.4 C11.4 17.2 15.8 17.2 21.6 20.8 C27 24 31 24 36 20.4",
    stroke: c2,
    strokeOpacity: _mono ? 0.65 : 1,
    strokeWidth: "5.7",
    strokeLinecap: "round"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9.5 30.4 C13.6 27 17 27 21.6 29.8 C25.2 32 27.8 32 30.8 29.6",
    stroke: c3,
    strokeOpacity: _mono ? 0.9 : 1,
    strokeWidth: "5.4",
    strokeLinecap: "round"
  }));
}
function Wordmark({
  size = 26,
  mono = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "row gap-10"
  }, /*#__PURE__*/React.createElement(Logo, {
    size: size,
    variant: mono ? 'mono' : 'color'
  }), /*#__PURE__*/React.createElement("span", {
    className: "display",
    style: {
      fontWeight: 800,
      fontSize: size * .82,
      letterSpacing: '.04em',
      lineHeight: 1,
      color: mono ? '#fff' : 'var(--violet)'
    }
  }, "FLUVIO"));
}
function Avatar({
  name,
  size = 34,
  src
}) {
  const fs = Math.round(size * 0.34);
  return /*#__PURE__*/React.createElement("div", {
    className: "avatar",
    style: {
      width: size,
      height: size,
      fontSize: fs
    }
  }, initials(name));
}
function StatusBadge({
  status
}) {
  const s = STATUS[status];
  if (!s) return null;
  return /*#__PURE__*/React.createElement("span", {
    className: 'badge ' + s.cls
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), s.label);
}
function ChannelTag({
  channel,
  showLabel = true
}) {
  const c = CHANNEL[channel];
  if (!c) return null;
  return /*#__PURE__*/React.createElement("span", {
    className: "channel",
    title: c.label
  }, /*#__PURE__*/React.createElement(Icon, {
    name: c.icon,
    size: 14
  }), showLabel && /*#__PURE__*/React.createElement("span", {
    className: "hide-sm"
  }, c.label));
}
function VipTag() {
  return /*#__PURE__*/React.createElement("span", {
    className: "tag-vip"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "star",
    size: 11,
    strokeWidth: 2.2
  }), "VIP");
}
function RingProgress({
  value,
  size = 56,
  stroke = 6,
  color = 'var(--violet)'
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - value / 100);
  return /*#__PURE__*/React.createElement("div", {
    className: "ring-wrap",
    style: {
      width: size,
      height: size
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size
  }, /*#__PURE__*/React.createElement("circle", {
    cx: size / 2,
    cy: size / 2,
    r: r,
    fill: "none",
    stroke: "var(--surface-3)",
    strokeWidth: stroke
  }), /*#__PURE__*/React.createElement("circle", {
    cx: size / 2,
    cy: size / 2,
    r: r,
    fill: "none",
    stroke: color,
    strokeWidth: stroke,
    strokeDasharray: c,
    strokeDashoffset: off,
    strokeLinecap: "round",
    transform: `rotate(-90 ${size / 2} ${size / 2})`,
    style: {
      transition: 'stroke-dashoffset .9s var(--ease)'
    }
  })), /*#__PURE__*/React.createElement("span", {
    className: "pct"
  }, value, "%"));
}
function StatCard({
  icon,
  label,
  value,
  trend,
  trendDir,
  ring,
  sub
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "stat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-top"
  }, /*#__PURE__*/React.createElement("span", {
    className: "stat-label"
  }, label), /*#__PURE__*/React.createElement("span", {
    className: "stat-ico"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 18
  }))), /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      justifyContent: 'space-between',
      alignItems: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "col gap-6"
  }, /*#__PURE__*/React.createElement("span", {
    className: "stat-value"
  }, value), trend && /*#__PURE__*/React.createElement("span", {
    className: 'stat-foot ' + (trendDir === 'up' ? 'trend-up' : trendDir === 'down' ? 'trend-down' : 'trend-flat')
  }, trendDir !== 'flat' && /*#__PURE__*/React.createElement(Icon, {
    name: trendDir === 'up' ? 'trendUp' : 'trendDown',
    size: 15,
    strokeWidth: 2
  }), trend, /*#__PURE__*/React.createElement("span", {
    className: "faint",
    style: {
      fontWeight: 500
    }
  }, sub))), ring != null && /*#__PURE__*/React.createElement(RingProgress, {
    value: ring
  })));
}
function EmptyState({
  icon = 'calcheck',
  title,
  body,
  action
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "empty"
  }, /*#__PURE__*/React.createElement("div", {
    className: "empty-art"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 92 92",
    fill: "none",
    width: "92",
    height: "92"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "8",
    y: "14",
    width: "76",
    height: "68",
    rx: "14",
    fill: "var(--surface-2)",
    stroke: "var(--line-2)",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "8",
    y: "14",
    width: "76",
    height: "20",
    rx: "14",
    fill: "var(--surface-3)"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 28h76",
    stroke: "var(--line-2)",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "29",
    y: "8",
    width: "4",
    height: "12",
    rx: "2",
    fill: "var(--ink-4)"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "59",
    y: "8",
    width: "4",
    height: "12",
    rx: "2",
    fill: "var(--ink-4)"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "46",
    cy: "56",
    r: "15",
    fill: "var(--violet-light)",
    stroke: "var(--violet)",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M40 56l4.2 4.2L53 51",
    stroke: "var(--violet)",
    strokeWidth: "2.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    fill: "none"
  }))), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 18
    }
  }, title), /*#__PURE__*/React.createElement("p", {
    className: "muted",
    style: {
      maxWidth: 320,
      fontSize: 14
    }
  }, body), action && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10
    }
  }, action));
}

/* ---------------- Quick actions (row) ---------------- */
function QuickActions({
  res,
  onAction
}) {
  const acts = [];
  if (res.status === 'pendiente') acts.push({
    k: 'confirmar',
    icon: 'check',
    title: 'Confirmar',
    cls: 'btn-soft'
  });
  if (res.status === 'confirmada') acts.push({
    k: 'sentar',
    icon: 'seat',
    title: 'Sentar',
    cls: 'btn-soft'
  });
  if (res.status !== 'no_show' && res.status !== 'cancelada' && res.status !== 'sentada') acts.push({
    k: 'no_show',
    icon: 'x',
    title: 'No-show',
    cls: 'btn-subtle'
  });
  acts.push({
    k: 'edit',
    icon: 'more',
    title: 'Más',
    cls: 'btn-subtle'
  });
  return /*#__PURE__*/React.createElement("div", {
    className: "row-actions"
  }, acts.map(a => /*#__PURE__*/React.createElement("button", {
    key: a.k,
    className: 'btn btn-sm btn-icon ' + a.cls,
    title: a.title,
    onClick: e => {
      e.stopPropagation();
      onAction(res.id, a.k);
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: a.icon,
    size: 15
  }))));
}

/* ---------------- Reservation row (table) ---------------- */
function ReservationRow({
  res,
  onAction,
  onOpen
}) {
  const cl = clientById(res.clientId);
  return /*#__PURE__*/React.createElement("tr", {
    style: {
      cursor: 'pointer'
    },
    onClick: () => onOpen && onOpen(res)
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      width: 76
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "display",
    style: {
      fontWeight: 600,
      fontSize: 15,
      fontVariantNumeric: 'tabular-nums'
    }
  }, res.time)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    className: "row gap-10"
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: cl.name,
    size: 32
  }), /*#__PURE__*/React.createElement("div", {
    className: "col",
    style: {
      gap: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "row gap-6",
    style: {
      fontWeight: 600,
      fontSize: 14
    }
  }, cl.name, cl.tags.includes('VIP') && /*#__PURE__*/React.createElement(VipTag, null)), /*#__PURE__*/React.createElement("span", {
    className: "faint",
    style: {
      fontSize: 12.5
    }
  }, cl.phone)))), /*#__PURE__*/React.createElement("td", {
    className: "hide-sm"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono-num",
    style: {
      fontWeight: 500
    }
  }, res.people), " ", /*#__PURE__*/React.createElement("span", {
    className: "faint"
  }, "pers.")), /*#__PURE__*/React.createElement("td", {
    className: "hide-sm"
  }, /*#__PURE__*/React.createElement("span", {
    className: "muted"
  }, res.table)), /*#__PURE__*/React.createElement("td", {
    className: "hide-sm"
  }, /*#__PURE__*/React.createElement(ChannelTag, {
    channel: res.channel,
    showLabel: false
  })), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(StatusBadge, {
    status: res.status
  })), /*#__PURE__*/React.createElement("td", {
    style: {
      width: 150
    }
  }, /*#__PURE__*/React.createElement(QuickActions, {
    res: res,
    onAction: onAction
  })));
}

/* ---------------- Page header ---------------- */
function PageHeader({
  title,
  subtitle,
  actions
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 22,
      gap: 16,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "col gap-4"
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 27
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("p", {
    className: "muted",
    style: {
      fontSize: 14.5
    }
  }, subtitle)), actions && /*#__PURE__*/React.createElement("div", {
    className: "row gap-10"
  }, actions));
}

/* ---------------- Section card header ---------------- */
function SectionHead({
  title,
  count,
  right
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      justifyContent: 'space-between',
      padding: '16px 18px 14px',
      borderBottom: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "row gap-8"
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 16.5
    }
  }, title), count != null && /*#__PURE__*/React.createElement("span", {
    className: "chip",
    style: {
      height: 22,
      fontSize: 12
    }
  }, count)), right);
}

/* ---------------- Modal scrim wrapper ---------------- */
function Scrim({
  onClose,
  children
}) {
  React.useEffect(() => {
    const h = e => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "scrim",
    onClick: onClose
  }), children);
}
Object.assign(window, {
  Logo,
  Wordmark,
  Avatar,
  StatusBadge,
  ChannelTag,
  VipTag,
  RingProgress,
  StatCard,
  EmptyState,
  QuickActions,
  ReservationRow,
  PageHeader,
  SectionHead,
  Scrim
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/fluvio-app/components.jsx", error: String((e && e.message) || e) }); }

// ui_kits/fluvio-app/lib.jsx
try { (() => {
/* ============================================================
   FLUVIO — Iconos (Lucide-style stroke) + datos mock + helpers
   ============================================================ */

const ICONS = {
  dashboard: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
  calendar: '<rect x="3" y="4.5" width="18" height="16" rx="2.5"/><path d="M3 9h18M8 2.5v4M16 2.5v4"/>',
  calcheck: '<rect x="3" y="4.5" width="18" height="16" rx="2.5"/><path d="M3 9h18M8 2.5v4M16 2.5v4M9 15l2 2 4-4"/>',
  users: '<path d="M16 19v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V19"/><circle cx="9" cy="7" r="3.2"/><path d="M22 19v-1.5a4 4 0 0 0-3-3.85M16 3.6a4 4 0 0 1 0 7.3"/>',
  user: '<circle cx="12" cy="8" r="3.6"/><path d="M5 20v-1a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v1"/>',
  userplus: '<path d="M14 19v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V19"/><circle cx="8" cy="7" r="3.2"/><path d="M18 8v6M21 11h-6"/>',
  tables: '<rect x="3" y="3" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2"/>',
  settings: '<path d="M12 15.4a3.4 3.4 0 1 0 0-6.8 3.4 3.4 0 0 0 0 6.8Z"/><path d="M19.4 15a1.6 1.6 0 0 0 .32 1.77l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.6 1.6 0 0 0-2.7 1.13V21a2 2 0 0 1-4 0v-.1A1.6 1.6 0 0 0 7 19.4a1.6 1.6 0 0 0-1.77.32l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.6 1.6 0 0 0 2.6 14H2.5a2 2 0 0 1 0-4h.1A1.6 1.6 0 0 0 4.6 7a1.6 1.6 0 0 0-.32-1.77l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.6 1.6 0 0 0 9 2.6h.1A2 2 0 0 1 13 2.5v.1A1.6 1.6 0 0 0 17 4.6a1.6 1.6 0 0 0 1.77-.32l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.6 1.6 0 0 0 21.4 9h.1a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.5 2Z" transform="scale(.92) translate(1 1)"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  chevronRight: '<path d="m9 6 6 6-6 6"/>',
  chevronLeft: '<path d="m15 6-6 6 6 6"/>',
  arrowUpRight: '<path d="M7 17 17 7M8 7h9v9"/>',
  trendUp: '<path d="m3 17 6-6 4 4 8-8"/><path d="M17 7h4v4"/>',
  trendDown: '<path d="m3 7 6 6 4-4 8 8"/><path d="M17 17h4v-4"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  phone: '<path d="M16.5 21A14.5 14.5 0 0 1 3 7.5 2.5 2.5 0 0 1 5.5 5h2A1.6 1.6 0 0 1 9 6.2c.13.9.36 1.78.7 2.6a1.6 1.6 0 0 1-.4 1.7L8.1 11.8a13 13 0 0 0 4.1 4.1l1.3-1.2a1.6 1.6 0 0 1 1.7-.4c.82.34 1.7.57 2.6.7A1.6 1.6 0 0 1 19 16.5v2A2.5 2.5 0 0 1 16.5 21Z"/>',
  whatsapp: '<path d="M12 3a8.7 8.7 0 0 0-7.5 13.1L3 21l5-1.4A8.7 8.7 0 1 0 12 3Z"/><path d="M8.9 8.4c.2-.5.4-.5.6-.5h.5c.2 0 .4 0 .6.5l.6 1.4c.1.2 0 .4-.1.6l-.4.5c-.1.2-.2.3 0 .6.5.8 1.2 1.4 2 1.8.3.1.4.1.6-.1l.5-.6c.2-.2.3-.2.5-.1l1.3.7c.2.1.4.2.4.3.1.5-.1 1.3-.5 1.6-.4.3-1 .5-1.6.4-1.8-.3-3.4-1.2-4.6-2.6-.8-.9-1.3-1.9-1.4-3 0-.6.2-1.1.5-1.5Z" fill="currentColor" stroke="none"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z"/>',
  monitor: '<rect x="2.5" y="4" width="19" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
  bell: '<path d="M18 8a6 6 0 1 0-12 0c0 6-2.5 7-2.5 7h17S18 14 18 8Z"/><path d="M10.5 19a1.8 1.8 0 0 0 3 0"/>',
  logout: '<path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3M16 17l5-5-5-5M21 12H9"/>',
  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
  more: '<circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/>',
  sparkles: '<path d="M12 3l1.6 4.6L18 9.2l-4.4 1.6L12 15l-1.6-4.2L6 9.2l4.4-1.6L12 3Z"/><path d="M19 13l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2ZM5 14l.6 1.6L7 16l-1.4.5L5 18l-.6-1.5L3 16l1.4-.4L5 14Z"/>',
  utensils: '<path d="M4 3v7a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V3M6 12v9M14 3c-1.5 0-2.5 1.8-2.5 4s1 4 2.5 4M14 11v10"/>',
  mappin: '<path d="M20 10c0 5.5-8 11-8 11s-8-5.5-8-11a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="2.6"/>',
  armchair: '<path d="M5 11V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4"/><path d="M4 11a2 2 0 0 1 2 2v2h12v-2a2 2 0 0 1 2-2 2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2Z"/><path d="M6 19v2M18 19v2"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  edit: '<path d="M11 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-6"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z"/>',
  trash: '<path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6"/>',
  seat: '<path d="M5 18v3M19 18v3M4 18h16M6 18v-3a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3M8 13V9a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4"/>',
  filter: '<path d="M3 5h18l-7 8v6l-4-2v-4L3 5Z"/>',
  star: '<path d="M12 3l2.6 5.3 5.9.9-4.2 4.1 1 5.8L12 16.9 6.7 19.7l1-5.8L3.5 9.8l5.9-.9L12 3Z"/>',
  shield: '<path d="M12 3l7.5 2.5v5.5c0 4.5-3 7.8-7.5 9.5C7.5 18.8 4.5 15.5 4.5 11V5.5L12 3Z"/><path d="M9.5 12l1.8 1.8L15 10"/>',
  alert: '<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/>',
  zap: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>',
  smartphone: '<rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M11 18h2"/>',
  mail: '<rect x="2.5" y="4.5" width="19" height="15" rx="2.5"/><path d="m3 7 9 6 9-6"/>',
  lock: '<rect x="4.5" y="11" width="15" height="10" rx="2.5"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  building: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 8h2M9 12h2M9 16h2M14 8h1M14 12h1M14 16h1"/>',
  card: '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 9.5h19"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>',
  check2: '<path d="M20 6 9 17l-5-5"/>',
  dollar: '<path d="M12 2v20M17 6.5c0-2-2.2-3-5-3s-5 1-5 3.2c0 4.8 10 2.8 10 7.6 0 2.2-2.2 3.2-5 3.2s-5-1-5-3"/>',
  history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 4v4h4"/><path d="M12 8v4l3 2"/>',
  message: '<path d="M21 11.5a8.5 8.5 0 0 1-12.2 7.6L3 21l1.9-5.8A8.5 8.5 0 1 1 21 11.5Z"/>',
  grid: '<rect x="3" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
  columns: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M12 4v16"/>',
  flame: '<path d="M12 3c1 3-1.5 4-1.5 6.5A2.5 2.5 0 0 0 13 12c1.5-1 1-3 1-3 2 1.5 3 3.8 3 6a5.5 5.5 0 0 1-11 0c0-3 2.5-4.5 3-7.5.2-1.4 1.5-3 3-4.5Z"/>'
};
function Icon({
  name,
  size,
  style,
  className,
  strokeWidth
}) {
  const s = size || 20;
  return React.createElement('svg', {
    width: s,
    height: s,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: strokeWidth || 1.7,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    style,
    className,
    dangerouslySetInnerHTML: {
      __html: ICONS[name] || ''
    }
  });
}

/* ============================================================
   HELPERS
   ============================================================ */
const STATUS = {
  pendiente: {
    label: 'Pendiente',
    cls: 'badge-pend'
  },
  confirmada: {
    label: 'Confirmada',
    cls: 'badge-conf'
  },
  sentada: {
    label: 'Sentada',
    cls: 'badge-seat'
  },
  no_show: {
    label: 'No-show',
    cls: 'badge-no'
  },
  cancelada: {
    label: 'Cancelada',
    cls: 'badge-canc'
  }
};
const CHANNEL = {
  whatsapp: {
    label: 'WhatsApp',
    icon: 'whatsapp'
  },
  web: {
    label: 'Web',
    icon: 'globe'
  },
  telefono: {
    label: 'Teléfono',
    icon: 'phone'
  },
  manual: {
    label: 'Manual',
    icon: 'edit'
  }
};
const AVATAR_COLORS = ['#4A7C59', '#B0662C', '#3568A0', '#9C5A8C', '#5C6BC0', '#3E7C8A', '#A8553E', '#6B8E4E', '#8A6FB0', '#C08A2A'];
function avatarColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}
function initials(name) {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] || '') + (p[1]?.[0] || '')).toUpperCase();
}

/* ============================================================
   DATOS MOCK — Duble Bistró
   ============================================================ */
const TABLES = [{
  id: 't1',
  name: 'Mesa 1',
  cap: 2,
  zone: 'Terraza',
  active: true
}, {
  id: 't2',
  name: 'Mesa 2',
  cap: 2,
  zone: 'Terraza',
  active: true
}, {
  id: 't3',
  name: 'Mesa 3',
  cap: 4,
  zone: 'Terraza',
  active: true
}, {
  id: 't4',
  name: 'Mesa 4',
  cap: 4,
  zone: 'Interior',
  active: true
}, {
  id: 't5',
  name: 'Mesa 5',
  cap: 6,
  zone: 'Interior',
  active: true
}, {
  id: 't6',
  name: 'Mesa 6',
  cap: 4,
  zone: 'Interior',
  active: true
}, {
  id: 't7',
  name: 'Mesa 7',
  cap: 8,
  zone: 'Interior',
  active: false
}, {
  id: 'b1',
  name: 'Barra 1',
  cap: 1,
  zone: 'Barra',
  active: true
}, {
  id: 'b2',
  name: 'Barra 2',
  cap: 1,
  zone: 'Barra',
  active: true
}, {
  id: 'p1',
  name: 'Privado',
  cap: 12,
  zone: 'Interior',
  active: true
}];
const CLIENTS = [{
  id: 'c1',
  name: 'María Fernanda Ríos',
  phone: '+52 55 1843 2290',
  visits: 9,
  last: '2026-05-22',
  notes: 'Alérgica a mariscos · prefiere terraza',
  tags: ['VIP']
}, {
  id: 'c2',
  name: 'Andrés Lozano',
  phone: '+52 55 2901 7733',
  visits: 6,
  last: '2026-05-18',
  notes: 'Cumpleaños en junio',
  tags: ['VIP']
}, {
  id: 'c3',
  name: 'Sofía Mendoza',
  phone: '+52 55 3320 1188',
  visits: 3,
  last: '2026-05-09',
  notes: '',
  tags: []
}, {
  id: 'c4',
  name: 'Diego Navarro',
  phone: '+52 55 7781 5540',
  visits: 12,
  last: '2026-05-25',
  notes: 'Cliente frecuente · vino tinto',
  tags: ['VIP']
}, {
  id: 'c5',
  name: 'Valeria Castro',
  phone: '+52 55 4408 9912',
  visits: 2,
  last: '2026-04-30',
  notes: '',
  tags: []
}, {
  id: 'c6',
  name: 'Ricardo Beltrán',
  phone: '+52 55 6650 3321',
  visits: 1,
  last: '2026-05-28',
  notes: 'Primera visita',
  tags: ['Nuevo']
}, {
  id: 'c7',
  name: 'Camila Ortiz',
  phone: '+52 55 9912 4408',
  visits: 5,
  last: '2026-05-15',
  notes: 'Mesa tranquila',
  tags: ['VIP']
}, {
  id: 'c8',
  name: 'Jorge Ramírez',
  phone: '+52 55 1120 8876',
  visits: 4,
  last: '2026-05-11',
  notes: '',
  tags: []
}, {
  id: 'c9',
  name: 'Paola Guzmán',
  phone: '+52 55 5567 2204',
  visits: 0,
  last: '—',
  notes: 'Reserva futura',
  tags: ['Nuevo']
}, {
  id: 'c10',
  name: 'Emilio Vargas',
  phone: '+52 55 3344 1190',
  visits: 7,
  last: '2026-05-20',
  notes: 'Negocios · factura',
  tags: ['VIP']
}];
function clientById(id) {
  return CLIENTS.find(c => c.id === id);
}

// Reservas de HOY (30 may 2026)
const TODAY = [{
  id: 'r1',
  time: '13:00',
  clientId: 'c3',
  people: 2,
  table: 'Mesa 2',
  status: 'confirmada',
  channel: 'whatsapp',
  notes: ''
}, {
  id: 'r2',
  time: '13:30',
  clientId: 'c5',
  people: 4,
  table: 'Mesa 4',
  status: 'confirmada',
  channel: 'web',
  notes: ''
}, {
  id: 'r3',
  time: '14:00',
  clientId: 'c1',
  people: 2,
  table: 'Mesa 1',
  status: 'sentada',
  channel: 'whatsapp',
  notes: 'Alérgica a mariscos'
}, {
  id: 'r4',
  time: '14:00',
  clientId: 'c8',
  people: 6,
  table: 'Mesa 5',
  status: 'pendiente',
  channel: 'telefono',
  notes: ''
}, {
  id: 'r5',
  time: '14:30',
  clientId: 'c6',
  people: 2,
  table: '—',
  status: 'pendiente',
  channel: 'whatsapp',
  notes: 'Primera visita'
}, {
  id: 'r6',
  time: '15:00',
  clientId: 'c4',
  people: 4,
  table: 'Mesa 6',
  status: 'confirmada',
  channel: 'whatsapp',
  notes: 'Vino tinto reservado'
}, {
  id: 'r7',
  time: '20:00',
  clientId: 'c2',
  people: 8,
  table: 'Privado',
  status: 'confirmada',
  channel: 'manual',
  notes: 'Cena de negocios'
}, {
  id: 'r8',
  time: '20:30',
  clientId: 'c7',
  people: 2,
  table: 'Mesa 3',
  status: 'pendiente',
  channel: 'web',
  notes: ''
}, {
  id: 'r9',
  time: '21:00',
  clientId: 'c10',
  people: 5,
  table: 'Mesa 5',
  status: 'confirmada',
  channel: 'whatsapp',
  notes: ''
}, {
  id: 'r10',
  time: '21:30',
  clientId: 'c5',
  people: 3,
  table: '—',
  status: 'no_show',
  channel: 'web',
  notes: ''
}];

// Próximas (mañana / pasado)
const UPCOMING = [{
  id: 'u1',
  day: 'Mañana',
  date: 'Dom 31 may',
  items: [{
    time: '13:30',
    clientId: 'c1',
    people: 4,
    status: 'confirmada',
    channel: 'whatsapp'
  }, {
    time: '14:00',
    clientId: 'c9',
    people: 2,
    status: 'confirmada',
    channel: 'whatsapp'
  }, {
    time: '20:00',
    clientId: 'c4',
    people: 6,
    status: 'pendiente',
    channel: 'web'
  }]
}, {
  id: 'u2',
  day: 'Pasado mañana',
  date: 'Lun 1 jun',
  items: [{
    time: '14:00',
    clientId: 'c2',
    people: 2,
    status: 'confirmada',
    channel: 'telefono'
  }, {
    time: '21:00',
    clientId: 'c7',
    people: 8,
    status: 'confirmada',
    channel: 'whatsapp'
  }]
}];

// Historial completo de reservas (para tabla de reservaciones)
const ALL_RES = [...TODAY.map(r => ({
  ...r,
  date: '2026-05-30',
  dayLabel: 'Hoy'
})), ...UPCOMING.flatMap(g => g.items.map((it, i) => ({
  id: g.id + i,
  ...it,
  date: g.id === 'u1' ? '2026-05-31' : '2026-06-01',
  dayLabel: g.day,
  table: '—',
  notes: ''
}))), {
  id: 'p1r',
  time: '14:30',
  clientId: 'c4',
  people: 4,
  table: 'Mesa 6',
  status: 'sentada',
  channel: 'whatsapp',
  date: '2026-05-29',
  dayLabel: 'Ayer',
  notes: ''
}, {
  id: 'p2r',
  time: '20:00',
  clientId: 'c10',
  people: 2,
  table: 'Mesa 3',
  status: 'no_show',
  channel: 'web',
  date: '2026-05-29',
  dayLabel: 'Ayer',
  notes: ''
}, {
  id: 'p3r',
  time: '21:00',
  clientId: 'c1',
  people: 6,
  table: 'Privado',
  status: 'cancelada',
  channel: 'whatsapp',
  date: '2026-05-28',
  dayLabel: '28 may',
  notes: ''
}, {
  id: 'p4r',
  time: '13:00',
  clientId: 'c8',
  people: 2,
  table: 'Mesa 1',
  status: 'sentada',
  channel: 'telefono',
  date: '2026-05-28',
  dayLabel: '28 may',
  notes: ''
}];

// Feed de actividad del bot IA
const AI_FEED_SEED = [{
  t: 'Ahora',
  who: 'Sofía Mendoza',
  msg: 'reservó mesa para 2 a las 13:00',
  kind: 'new'
}, {
  t: 'hace 4 min',
  who: 'Ricardo Beltrán',
  msg: 'confirmó su asistencia para hoy 14:30',
  kind: 'confirm'
}, {
  t: 'hace 12 min',
  who: 'Diego Navarro',
  msg: 'recibió recordatorio anti no-show',
  kind: 'remind'
}, {
  t: 'hace 26 min',
  who: 'Camila Ortiz',
  msg: 'preguntó por disponibilidad de terraza',
  kind: 'chat'
}];
const AI_FEED_POOL = [{
  who: 'Laura Beristáin',
  msg: 'reservó mesa para 4 a las 21:00',
  kind: 'new'
}, {
  who: 'Tomás Quirós',
  msg: 'confirmó su reservación de mañana',
  kind: 'confirm'
}, {
  who: 'Fernanda Ruiz',
  msg: 'recibió recordatorio anti no-show',
  kind: 'remind'
}, {
  who: 'Mateo Salas',
  msg: 'reagendó su reserva para el sábado',
  kind: 'chat'
}, {
  who: 'Lucía Paredes',
  msg: 'reservó mesa para 2 en barra',
  kind: 'new'
}];
Object.assign(window, {
  Icon,
  ICONS,
  STATUS,
  CHANNEL,
  avatarColor,
  initials,
  TABLES,
  CLIENTS,
  clientById,
  TODAY,
  UPCOMING,
  ALL_RES,
  AI_FEED_SEED,
  AI_FEED_POOL
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/fluvio-app/lib.jsx", error: String((e && e.message) || e) }); }

// ui_kits/fluvio-app/screens-dashboard.jsx
try { (() => {
/* ============================================================
   FLUVIO — Dashboard (3 variaciones + feed IA en vivo)
   ============================================================ */

function GreetHeader({
  onNewRes
}) {
  const hour = 9;
  const greet = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';
  return /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      marginBottom: 22,
      gap: 16,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "col gap-4"
  }, /*#__PURE__*/React.createElement("span", {
    className: "row gap-8 faint",
    style: {
      fontSize: 13.5,
      fontWeight: 500,
      whiteSpace: 'nowrap'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "calendar",
    size: 15
  }), " S\xE1bado, 30 de mayo \xB7 2026"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 30
    }
  }, greet, ", Luis ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--violet)'
    }
  }, "\uD83D\uDC4B")), /*#__PURE__*/React.createElement("p", {
    className: "muted",
    style: {
      fontSize: 14.5
    }
  }, "Tienes ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--ink)'
    }
  }, "10 reservas"), " para hoy y ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--ink)'
    }
  }, "3 pendientes"), " por confirmar.")), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary btn-lg hide-sm",
    onClick: onNewRes
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 18
  }), " Nueva reservaci\xF3n"));
}
function MetricsRow() {
  return /*#__PURE__*/React.createElement("div", {
    className: "stat-grid",
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 16,
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement(StatCard, {
    icon: "calcheck",
    label: "Reservas hoy",
    value: "10",
    trend: "+18%",
    trendDir: "up",
    sub: "vs. ayer"
  }), /*#__PURE__*/React.createElement(StatCard, {
    icon: "check2",
    label: "Confirmadas",
    value: "",
    ring: 70
  }), /*#__PURE__*/React.createElement(StatCard, {
    icon: "x",
    label: "No-shows del mes",
    value: "4",
    trend: "\u221261%",
    trendDir: "up",
    sub: "vs. abril"
  }), /*#__PURE__*/React.createElement(StatCard, {
    icon: "userplus",
    label: "Clientes nuevos",
    value: "12",
    trend: "esta semana",
    trendDir: "flat"
  }));
}
function MetricsStrip() {
  const items = [{
    icon: 'calcheck',
    label: 'Reservas hoy',
    value: '10',
    t: '+18%',
    d: 'up'
  }, {
    icon: 'check2',
    label: 'Confirmadas',
    value: '70%',
    t: '7 de 10',
    d: 'flat'
  }, {
    icon: 'x',
    label: 'No-shows mes',
    value: '4',
    t: '−61%',
    d: 'up'
  }, {
    icon: 'userplus',
    label: 'Nuevos',
    value: '12',
    t: 'semana',
    d: 'flat'
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      marginBottom: 18,
      overflow: 'hidden'
    }
  }, items.map((m, i) => /*#__PURE__*/React.createElement("div", {
    key: m.label,
    className: "row gap-12",
    style: {
      padding: '15px 18px',
      borderLeft: i ? '1px solid var(--line)' : 'none'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "stat-ico"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: m.icon,
    size: 18
  })), /*#__PURE__*/React.createElement("div", {
    className: "col",
    style: {
      gap: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "row gap-6",
    style: {
      alignItems: 'baseline'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "display",
    style: {
      fontSize: 23,
      fontWeight: 600,
      letterSpacing: '-0.02em'
    }
  }, m.value), /*#__PURE__*/React.createElement("span", {
    className: 'stat-foot ' + (m.d === 'up' ? 'trend-up' : 'trend-flat'),
    style: {
      fontSize: 12
    }
  }, m.t)), /*#__PURE__*/React.createElement("span", {
    className: "stat-label",
    style: {
      fontSize: 12.5
    }
  }, m.label)))));
}

/* ---- AI feed (live) ---- */
const FEED_KIND = {
  new: {
    ico: 'whatsapp',
    color: '#25D366',
    label: 'Nueva reserva'
  },
  confirm: {
    ico: 'check',
    color: 'var(--st-conf)',
    label: 'Confirmada'
  },
  remind: {
    ico: 'bell',
    color: 'var(--st-pend)',
    label: 'Recordatorio'
  },
  chat: {
    ico: 'message',
    color: 'var(--st-seat)',
    label: 'Consulta'
  }
};
function AIFeedPanel({
  feed,
  compact
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      justifyContent: 'space-between',
      padding: '15px 18px 13px',
      borderBottom: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "row gap-10"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wa-ico"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "whatsapp",
    size: 17
  })), /*#__PURE__*/React.createElement("div", {
    className: "col",
    style: {
      gap: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "row gap-6",
    style: {
      fontWeight: 600,
      fontSize: 15
    }
  }, "Bot de WhatsApp"), /*#__PURE__*/React.createElement("span", {
    className: "row gap-6 faint",
    style: {
      fontSize: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "ai-pulse"
  }), " Activo \xB7 responde 24/7"))), /*#__PURE__*/React.createElement("span", {
    className: "chip",
    style: {
      background: 'var(--violet-light)',
      color: 'var(--plum)',
      fontWeight: 600,
      fontSize: 12
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "sparkles",
    size: 13
  }), " IA")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 18px',
      maxHeight: compact ? 'none' : 360,
      overflowY: 'auto',
      flex: 1
    }
  }, feed.map((f, i) => {
    const k = FEED_KIND[f.kind];
    return /*#__PURE__*/React.createElement("div", {
      className: "feed-item",
      key: f.id
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 30,
        height: 30,
        borderRadius: 8,
        background: 'var(--surface-2)',
        display: 'grid',
        placeItems: 'center',
        flex: 'none',
        color: k.color
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: k.ico,
      size: 16
    })), /*#__PURE__*/React.createElement("div", {
      className: "col",
      style: {
        gap: 2,
        minWidth: 0,
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13.5,
        lineHeight: 1.4
      }
    }, /*#__PURE__*/React.createElement("b", null, f.who), " ", /*#__PURE__*/React.createElement("span", {
      className: "muted"
    }, f.msg)), /*#__PURE__*/React.createElement("span", {
      className: "row gap-8 faint",
      style: {
        fontSize: 11.5
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: k.color,
        fontWeight: 600
      }
    }, k.label), " \xB7 ", f.t)));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 18px',
      borderTop: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-soft btn-sm btn-block"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "history",
    size: 15
  }), " Ver toda la actividad")));
}

/* ---- Upcoming ---- */
function UpcomingPanel({
  onNav
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement(SectionHead, {
    title: "Pr\xF3ximas reservas",
    right: /*#__PURE__*/React.createElement("a", {
      className: "row gap-2",
      style: {
        fontSize: 13,
        fontWeight: 600,
        color: 'var(--violet-ink)'
      },
      onClick: () => onNav('reservaciones')
    }, "Ver todas ", /*#__PURE__*/React.createElement(Icon, {
      name: "chevronRight",
      size: 14
    }))
  }), /*#__PURE__*/React.createElement("div", {
    className: "col",
    style: {
      padding: '6px 0'
    }
  }, UPCOMING.map(g => /*#__PURE__*/React.createElement("div", {
    key: g.id
  }, /*#__PURE__*/React.createElement("div", {
    className: "row gap-8",
    style: {
      padding: '10px 18px 6px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      fontWeight: 700,
      color: 'var(--ink-2)'
    }
  }, g.day), /*#__PURE__*/React.createElement("span", {
    className: "faint",
    style: {
      fontSize: 12
    }
  }, "\xB7 ", g.date)), g.items.map((it, i) => {
    const cl = clientById(it.clientId);
    return /*#__PURE__*/React.createElement("div", {
      className: "row gap-10",
      key: i,
      style: {
        padding: '8px 18px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "display",
      style: {
        fontWeight: 600,
        fontSize: 13.5,
        width: 42,
        fontVariantNumeric: 'tabular-nums'
      }
    }, it.time), /*#__PURE__*/React.createElement(Avatar, {
      name: cl.name,
      size: 28
    }), /*#__PURE__*/React.createElement("div", {
      className: "col",
      style: {
        gap: 0,
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13.5,
        fontWeight: 500,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, cl.name), /*#__PURE__*/React.createElement("span", {
      className: "faint",
      style: {
        fontSize: 11.5
      }
    }, it.people, " personas")), /*#__PURE__*/React.createElement(StatusBadge, {
      status: it.status
    }));
  })))));
}

/* ---- Today as table ---- */
function TodayTable({
  reservations,
  onAction,
  onOpen,
  onNewRes
}) {
  const today = reservations.filter(r => r.dayLabel === 'Hoy');
  return /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement(SectionHead, {
    title: "Reservas de hoy",
    count: today.length,
    right: /*#__PURE__*/React.createElement("div", {
      className: "seg"
    }, /*#__PURE__*/React.createElement("button", {
      className: "on"
    }, "Todas"), /*#__PURE__*/React.createElement("button", null, "Comida"), /*#__PURE__*/React.createElement("button", null, "Cena"))
  }), today.length === 0 ? /*#__PURE__*/React.createElement(EmptyState, {
    title: "Sin reservas hoy",
    body: "Cuando el bot agende reservas, aparecer\xE1n aqu\xED en tiempo real.",
    action: /*#__PURE__*/React.createElement("button", {
      className: "btn btn-primary btn-sm",
      onClick: onNewRes
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "plus",
      size: 15
    }), " Nueva reservaci\xF3n")
  }) : /*#__PURE__*/React.createElement("table", {
    className: "tbl"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Hora"), /*#__PURE__*/React.createElement("th", null, "Cliente"), /*#__PURE__*/React.createElement("th", {
    className: "hide-sm"
  }, "Pers."), /*#__PURE__*/React.createElement("th", {
    className: "hide-sm"
  }, "Mesa"), /*#__PURE__*/React.createElement("th", {
    className: "hide-sm"
  }, "Canal"), /*#__PURE__*/React.createElement("th", null, "Estado"), /*#__PURE__*/React.createElement("th", null))), /*#__PURE__*/React.createElement("tbody", null, today.map(r => /*#__PURE__*/React.createElement(ReservationRow, {
    key: r.id,
    res: r,
    onAction: onAction,
    onOpen: onOpen
  })))));
}

/* ---- Today as timeline ---- */
function TodayTimeline({
  reservations,
  onAction,
  onOpen
}) {
  const today = reservations.filter(r => r.dayLabel === 'Hoy');
  return /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement(SectionHead, {
    title: "Agenda de hoy",
    count: today.length
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 18px 18px'
    }
  }, today.map((r, i) => {
    const cl = clientById(r.clientId);
    return /*#__PURE__*/React.createElement("div", {
      className: "tl-row",
      key: r.id
    }, /*#__PURE__*/React.createElement("div", {
      className: "tl-time"
    }, r.time), /*#__PURE__*/React.createElement("div", {
      className: "tl-track"
    }, /*#__PURE__*/React.createElement("div", {
      className: "tl-dot",
      style: {
        borderColor: `var(--st-${r.status === 'no_show' ? 'no' : r.status === 'pendiente' ? 'pend' : r.status === 'sentada' ? 'seat' : r.status === 'cancelada' ? 'canc' : 'conf'}-dot)`
      }
    }), /*#__PURE__*/React.createElement("div", {
      className: "card",
      onClick: () => onOpen(r),
      style: {
        padding: '11px 13px',
        marginBottom: 12,
        cursor: 'pointer',
        boxShadow: 'none',
        background: 'var(--surface-2)',
        border: '1px solid var(--line)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "row",
      style: {
        justifyContent: 'space-between',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "row gap-10",
      style: {
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: cl.name,
      size: 32
    }), /*#__PURE__*/React.createElement("div", {
      className: "col",
      style: {
        gap: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "row gap-6",
      style: {
        fontWeight: 600,
        fontSize: 14
      }
    }, cl.name, " ", cl.tags.includes('VIP') && /*#__PURE__*/React.createElement(VipTag, null)), /*#__PURE__*/React.createElement("span", {
      className: "row gap-8 faint",
      style: {
        fontSize: 12
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "mono-num"
    }, r.people, " pers."), " \xB7 ", r.table, " \xB7 ", /*#__PURE__*/React.createElement(ChannelTag, {
      channel: r.channel,
      showLabel: false
    })))), /*#__PURE__*/React.createElement("div", {
      className: "col gap-8",
      style: {
        alignItems: 'flex-end'
      }
    }, /*#__PURE__*/React.createElement(StatusBadge, {
      status: r.status
    }), /*#__PURE__*/React.createElement(QuickActions, {
      res: r,
      onAction: onAction
    }))))));
  })));
}

/* ============================================================
   DASHBOARD — main, switches by layout tweak
   ============================================================ */
function Dashboard({
  reservations,
  onAction,
  onOpen,
  onNewRes,
  onNav,
  layout,
  feed
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "page page-enter"
  }, /*#__PURE__*/React.createElement(GreetHeader, {
    onNewRes: onNewRes
  }), layout === 'focus' ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(MetricsStrip, null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1.45fr) minmax(0,1fr)',
      gap: 18,
      alignItems: 'start'
    },
    className: "dash-grid"
  }, /*#__PURE__*/React.createElement(TodayTimeline, {
    reservations: reservations,
    onAction: onAction,
    onOpen: onOpen
  }), /*#__PURE__*/React.createElement("div", {
    className: "col gap-18",
    style: {
      position: 'sticky',
      top: 84
    }
  }, /*#__PURE__*/React.createElement(AIFeedPanel, {
    feed: feed
  }), /*#__PURE__*/React.createElement(UpcomingPanel, {
    onNav: onNav
  })))) : layout === 'timeline' ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(MetricsRow, null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1.45fr) minmax(0,1fr)',
      gap: 18,
      alignItems: 'start'
    },
    className: "dash-grid"
  }, /*#__PURE__*/React.createElement(TodayTimeline, {
    reservations: reservations,
    onAction: onAction,
    onOpen: onOpen
  }), /*#__PURE__*/React.createElement("div", {
    className: "col gap-18"
  }, /*#__PURE__*/React.createElement(UpcomingPanel, {
    onNav: onNav
  }), /*#__PURE__*/React.createElement(AIFeedPanel, {
    feed: feed
  })))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(MetricsRow, null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1.6fr) minmax(0,1fr)',
      gap: 18,
      alignItems: 'start'
    },
    className: "dash-grid"
  }, /*#__PURE__*/React.createElement(TodayTable, {
    reservations: reservations,
    onAction: onAction,
    onOpen: onOpen,
    onNewRes: onNewRes
  }), /*#__PURE__*/React.createElement("div", {
    className: "col gap-18"
  }, /*#__PURE__*/React.createElement(AIFeedPanel, {
    feed: feed
  }), /*#__PURE__*/React.createElement(UpcomingPanel, {
    onNav: onNav
  })))));
}
Object.assign(window, {
  Dashboard
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/fluvio-app/screens-dashboard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/fluvio-app/screens-landing.jsx
try { (() => {
/* ============================================================
   FLUVIO — Landing page (/)
   ============================================================ */

function LandingNav({
  onNav
}) {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(250,250,248,.8)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      maxWidth: 1180,
      margin: '0 auto',
      padding: '14px 28px',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement(Wordmark, {
    size: 28
  }), /*#__PURE__*/React.createElement("nav", {
    className: "row gap-4 hide-sm",
    style: {
      color: 'var(--ink-2)',
      fontSize: 14.5,
      fontWeight: 500
    }
  }, /*#__PURE__*/React.createElement("a", {
    className: "btn btn-subtle btn-sm",
    href: "#features"
  }, "Funciones"), /*#__PURE__*/React.createElement("a", {
    className: "btn btn-subtle btn-sm",
    href: "#como"
  }, "C\xF3mo funciona"), /*#__PURE__*/React.createElement("a", {
    className: "btn btn-subtle btn-sm",
    href: "#precio"
  }, "Precios")), /*#__PURE__*/React.createElement("div", {
    className: "row gap-8"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => onNav('login')
  }, "Iniciar sesi\xF3n"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary btn-sm",
    onClick: () => onNav('login')
  }, "Empezar gratis"))));
}
function ChatBubble({
  from,
  children,
  delay
}) {
  const isBot = from === 'bot';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: isBot ? 'flex-start' : 'flex-end',
      animation: `feedIn .5s var(--ease) ${delay}s both`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: '80%',
      padding: '9px 13px',
      fontSize: 13.5,
      lineHeight: 1.45,
      borderRadius: isBot ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
      background: isBot ? '#fff' : '#DCF8C6',
      color: 'var(--ink)',
      boxShadow: '0 1px 1px rgba(0,0,0,.06)',
      border: isBot ? '1px solid var(--line)' : 'none'
    }
  }, children));
}
function PhoneDemo() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: 290,
      flex: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: '-30px -10px',
      background: 'radial-gradient(60% 50% at 50% 30%, rgba(74,124,89,.16), transparent 70%)',
      filter: 'blur(8px)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      borderRadius: 38,
      background: '#1A1A1A',
      padding: 9,
      boxShadow: 'var(--shadow-overlay)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: 30,
      overflow: 'hidden',
      background: '#E5DDD5',
      height: 560,
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "row gap-10",
    style: {
      background: '#075E54',
      padding: '14px 16px',
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      borderRadius: 99,
      background: 'rgba(255,255,255,.18)',
      display: 'grid',
      placeItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    size: 22,
    mono: true
  })), /*#__PURE__*/React.createElement("div", {
    className: "col",
    style: {
      gap: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600,
      fontSize: 14.5
    }
  }, "Duble Bistr\xF3"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      opacity: .8
    }
  }, "en l\xEDnea \xB7 responde al instante"))), /*#__PURE__*/React.createElement("div", {
    className: "col gap-8",
    style: {
      padding: 14,
      flex: 1,
      background: 'linear-gradient(rgba(229,221,213,.5), rgba(229,221,213,.5))',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      margin: '2px 0 6px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      background: 'rgba(255,255,255,.7)',
      padding: '3px 9px',
      borderRadius: 8,
      color: 'var(--ink-2)'
    }
  }, "Hoy")), /*#__PURE__*/React.createElement(ChatBubble, {
    from: "user",
    delay: .1
  }, "Hola! Tienen mesa para 2 hoy a las 2?"), /*#__PURE__*/React.createElement(ChatBubble, {
    from: "bot",
    delay: .5
  }, "\xA1Hola! \uD83D\uDC4B Claro que s\xED. Tengo disponible la ", /*#__PURE__*/React.createElement("b", null, "terraza a las 14:00"), ". \xBFLa aparto?"), /*#__PURE__*/React.createElement(ChatBubble, {
    from: "user",
    delay: 1.1
  }, "Perfecto, s\xED porfa"), /*#__PURE__*/React.createElement(ChatBubble, {
    from: "bot",
    delay: 1.6
  }, "Listo \u2705 Mesa para 2, hoy 14:00 en terraza. Te mandar\xE9 un recordatorio una hora antes. \xA1Te esperamos!"), /*#__PURE__*/React.createElement("div", {
    style: {
      animation: 'feedIn .5s var(--ease) 2.2s both',
      alignSelf: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "row gap-6",
    style: {
      background: '#fff',
      padding: '8px 12px',
      borderRadius: '4px 14px 14px 14px',
      border: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "ai-pulse"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'var(--ink-3)'
    }
  }, "Fluvio agend\xF3 la reserva")))))));
}
function FeatureCard({
  icon,
  title,
  body,
  badge
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "card card-pad col gap-12",
    style: {
      borderRadius: 'var(--r-lg)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 44,
      height: 44,
      borderRadius: 12,
      background: 'var(--violet-light)',
      color: 'var(--plum)',
      display: 'grid',
      placeItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 22
  })), badge && /*#__PURE__*/React.createElement("span", {
    className: "chip",
    style: {
      background: 'var(--violet-light)',
      color: 'var(--plum)',
      fontWeight: 600,
      fontSize: 12
    }
  }, badge)), /*#__PURE__*/React.createElement("div", {
    className: "col gap-6"
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 18.5
    }
  }, title), /*#__PURE__*/React.createElement("p", {
    className: "muted",
    style: {
      fontSize: 14.5,
      lineHeight: 1.55
    }
  }, body)));
}
function Step({
  n,
  title,
  body
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "row gap-16",
    style: {
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "display",
    style: {
      fontSize: 17,
      fontWeight: 700,
      color: '#fff',
      background: 'var(--violet)',
      width: 38,
      height: 38,
      borderRadius: 11,
      display: 'grid',
      placeItems: 'center',
      flex: 'none'
    }
  }, n), /*#__PURE__*/React.createElement("div", {
    className: "col gap-4",
    style: {
      paddingTop: 3
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 18
    }
  }, title), /*#__PURE__*/React.createElement("p", {
    className: "muted",
    style: {
      fontSize: 14.5,
      lineHeight: 1.55
    }
  }, body)));
}
function Landing({
  onNav
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100vh'
    }
  }, /*#__PURE__*/React.createElement(LandingNav, {
    onNav: onNav
  }), /*#__PURE__*/React.createElement("section", {
    style: {
      position: 'relative',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: -120,
      right: -80,
      width: 480,
      height: 480,
      background: 'radial-gradient(circle, rgba(74,124,89,.10), transparent 65%)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      maxWidth: 1180,
      margin: '0 auto',
      padding: '64px 28px 72px',
      gap: 56,
      alignItems: 'center',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "col gap-24",
    style: {
      flex: '1 1 420px',
      minWidth: 320
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "chip",
    style: {
      alignSelf: 'flex-start',
      background: 'var(--violet-light)',
      color: 'var(--plum)',
      fontWeight: 600,
      height: 32
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "ai-pulse"
  }), " Bot de WhatsApp con IA"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 'clamp(40px, 6vw, 62px)',
      lineHeight: 1.02,
      letterSpacing: '-0.035em'
    }
  }, "Tu restaurante,", /*#__PURE__*/React.createElement("br", null), "siempre lleno.", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--violet)'
    }
  }, "Sin esfuerzo.")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 19,
      color: 'var(--ink-2)',
      lineHeight: 1.5,
      maxWidth: 480
    }
  }, "Bot de WhatsApp con IA que toma reservaciones 24/7 y elimina los no-shows autom\xE1ticamente."), /*#__PURE__*/React.createElement("div", {
    className: "row gap-12",
    style: {
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary btn-lg",
    onClick: () => onNav('login')
  }, "Empezar gratis ", /*#__PURE__*/React.createElement(Icon, {
    name: "arrowUpRight",
    size: 18
  })), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-lg",
    onClick: () => onNav('dashboard')
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "monitor",
    size: 18
  }), " Ver demo")), /*#__PURE__*/React.createElement("div", {
    className: "row gap-20",
    style: {
      marginTop: 4,
      color: 'var(--ink-3)',
      fontSize: 13.5,
      fontWeight: 500,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "row gap-6"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 16,
    style: {
      color: 'var(--violet)'
    }
  }), " 14 d\xEDas gratis"), /*#__PURE__*/React.createElement("span", {
    className: "row gap-6"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 16,
    style: {
      color: 'var(--violet)'
    }
  }), " Sin tarjeta"), /*#__PURE__*/React.createElement("span", {
    className: "row gap-6"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 16,
    style: {
      color: 'var(--violet)'
    }
  }), " Listo en 5 min"))), /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      flex: '1 1 290px',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(PhoneDemo, null)))), /*#__PURE__*/React.createElement("section", {
    style: {
      borderTop: '1px solid var(--line)',
      borderBottom: '1px solid var(--line)',
      background: 'var(--surface)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      maxWidth: 1180,
      margin: '0 auto',
      padding: '22px 28px',
      gap: 40,
      justifyContent: 'space-between',
      flexWrap: 'wrap'
    }
  }, [['+38%', 'reservas confirmadas'], ['−61%', 'no-shows'], ['24/7', 'atención sin pausa'], ['4.9★', 'satisfacción']].map(([n, l]) => /*#__PURE__*/React.createElement("div", {
    className: "col",
    key: l,
    style: {
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "display",
    style: {
      fontSize: 27,
      fontWeight: 700,
      letterSpacing: '-0.03em'
    }
  }, n), /*#__PURE__*/React.createElement("span", {
    className: "muted",
    style: {
      fontSize: 13.5
    }
  }, l))))), /*#__PURE__*/React.createElement("section", {
    id: "features",
    style: {
      maxWidth: 1180,
      margin: '0 auto',
      padding: '84px 28px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "col gap-8",
    style: {
      textAlign: 'center',
      alignItems: 'center',
      marginBottom: 48
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "chip",
    style: {
      background: 'var(--violet-light)',
      color: 'var(--plum)',
      fontWeight: 600
    }
  }, "Funciones"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 'clamp(30px, 4vw, 42px)',
      maxWidth: 640
    }
  }, "Todo lo que tu host hac\xEDa, ahora autom\xE1tico"), /*#__PURE__*/React.createElement("p", {
    className: "muted",
    style: {
      fontSize: 17,
      maxWidth: 520
    }
  }, "Fluvio atiende, confirma y recuerda \u2014 para que t\xFA te dediques a la cocina y la sala.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement(FeatureCard, {
    icon: "whatsapp",
    badge: "Estrella",
    title: "Bot de WhatsApp 24/7",
    body: "Responde, sugiere horarios y aparta mesas al instante \u2014 en el chat que tus clientes ya usan, sin apps ni formularios."
  }), /*#__PURE__*/React.createElement(FeatureCard, {
    icon: "bell",
    title: "Recordatorios anti no-show",
    body: "Mensajes autom\xE1ticos antes de cada reserva con confirmaci\xF3n en un toque. Recupera las mesas que se quedaban vac\xEDas."
  }), /*#__PURE__*/React.createElement(FeatureCard, {
    icon: "dashboard",
    title: "Panel en tiempo real",
    body: "Mira tus reservas del d\xEDa, ocupaci\xF3n y clientes desde un panel claro. Confirma, sienta o reagenda con un clic."
  }))), /*#__PURE__*/React.createElement("section", {
    id: "como",
    style: {
      background: 'var(--surface)',
      borderTop: '1px solid var(--line)',
      borderBottom: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      maxWidth: 1180,
      margin: '0 auto',
      padding: '84px 28px',
      gap: 64,
      alignItems: 'center',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "col gap-28",
    style: {
      flex: '1 1 360px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "col gap-8"
  }, /*#__PURE__*/React.createElement("span", {
    className: "chip",
    style: {
      alignSelf: 'flex-start',
      background: 'var(--violet-light)',
      color: 'var(--plum)',
      fontWeight: 600
    }
  }, "As\xED funciona"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 'clamp(30px, 4vw, 42px)'
    }
  }, "En marcha en tres pasos")), /*#__PURE__*/React.createElement("div", {
    className: "col gap-24"
  }, /*#__PURE__*/React.createElement(Step, {
    n: "1",
    title: "Conecta tu WhatsApp",
    body: "Enlaza el n\xFAmero de tu restaurante en minutos. Fluvio entiende tu men\xFA, horarios y mesas."
  }), /*#__PURE__*/React.createElement(Step, {
    n: "2",
    title: "El bot toma las reservas",
    body: "Tus clientes escriben como siempre. La IA responde, confirma disponibilidad y agenda autom\xE1ticamente."
  }), /*#__PURE__*/React.createElement(Step, {
    n: "3",
    title: "Gestiona desde el panel",
    body: "Todo cae ordenado en tu dashboard. Confirma, sienta o reagenda \u2014 y deja que los recordatorios hagan el resto."
  })), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    style: {
      alignSelf: 'flex-start'
    },
    onClick: () => onNav('login')
  }, "Crear mi cuenta ", /*#__PURE__*/React.createElement(Icon, {
    name: "chevronRight",
    size: 17
  }))), /*#__PURE__*/React.createElement("div", {
    className: "col",
    style: {
      flex: '1 1 320px',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(MiniDashPreview, null)))), /*#__PURE__*/React.createElement("section", {
    id: "precio",
    style: {
      maxWidth: 1180,
      margin: '0 auto',
      padding: '84px 28px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--plum)',
      borderRadius: 'var(--r-xl)',
      padding: '56px 40px',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: -60,
      right: -40,
      width: 300,
      height: 300,
      background: 'radial-gradient(circle, rgba(255,255,255,.08), transparent 65%)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "col gap-16",
    style: {
      alignItems: 'center',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      color: '#fff',
      fontSize: 'clamp(30px, 4vw, 44px)',
      maxWidth: 620
    }
  }, "Llena tu restaurante esta misma semana"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'rgba(255,255,255,.78)',
      fontSize: 18,
      maxWidth: 480
    }
  }, "Plan Starter desde ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: '#fff'
    }
  }, "$99/mes"), ". Cancela cuando quieras. Prueba 14 d\xEDas gratis."), /*#__PURE__*/React.createElement("div", {
    className: "row gap-12",
    style: {
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-lg",
    style: {
      background: '#fff',
      color: 'var(--plum)'
    },
    onClick: () => onNav('login')
  }, "Empezar gratis"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-lg",
    style: {
      background: 'rgba(255,255,255,.12)',
      color: '#fff'
    },
    onClick: () => onNav('dashboard')
  }, "Ver demo en vivo"))))), /*#__PURE__*/React.createElement("footer", {
    style: {
      borderTop: '1px solid var(--line)',
      background: 'var(--surface)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      maxWidth: 1180,
      margin: '0 auto',
      padding: '32px 28px',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "col gap-8"
  }, /*#__PURE__*/React.createElement(Wordmark, {
    size: 26
  }), /*#__PURE__*/React.createElement("p", {
    className: "faint",
    style: {
      fontSize: 13
    }
  }, "Reservaciones inteligentes para tu restaurante.")), /*#__PURE__*/React.createElement("div", {
    className: "row gap-24 muted",
    style: {
      fontSize: 13.5
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#features"
  }, "Funciones"), /*#__PURE__*/React.createElement("a", {
    href: "#precio"
  }, "Precios"), /*#__PURE__*/React.createElement("a", {
    href: "#como"
  }, "C\xF3mo funciona"), /*#__PURE__*/React.createElement("span", {
    className: "faint"
  }, "\xA9 2026 Fluvio")))));
}

/* mini dashboard preview for "cómo funciona" */
function MiniDashPreview() {
  return /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      width: '100%',
      maxWidth: 400,
      overflow: 'hidden',
      boxShadow: 'var(--shadow-pop)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "row gap-8",
    style: {
      padding: '12px 14px',
      borderBottom: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 9,
      height: 9,
      borderRadius: 99,
      background: 'var(--st-no-dot)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 9,
      height: 9,
      borderRadius: 99,
      background: 'var(--st-pend-dot)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 9,
      height: 9,
      borderRadius: 99,
      background: 'var(--st-conf-dot)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "faint",
    style: {
      fontSize: 12,
      marginLeft: 6
    }
  }, "Reservas de hoy")), /*#__PURE__*/React.createElement("div", {
    className: "col",
    style: {
      padding: 14,
      gap: 10
    }
  }, [['14:00', 'María F. Ríos', 'confirmada'], ['14:30', 'Ricardo Beltrán', 'pendiente'], ['20:00', 'Andrés Lozano', 'confirmada']].map(([t, n, s]) => /*#__PURE__*/React.createElement("div", {
    className: "row gap-10",
    key: n,
    style: {
      padding: '8px 10px',
      borderRadius: 10,
      background: 'var(--surface-2)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "display",
    style: {
      fontWeight: 600,
      fontSize: 13.5,
      width: 42
    }
  }, t), /*#__PURE__*/React.createElement(Avatar, {
    name: n,
    size: 26
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 500,
      flex: 1
    }
  }, n), /*#__PURE__*/React.createElement(StatusBadge, {
    status: s
  })))));
}
Object.assign(window, {
  Landing
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/fluvio-app/screens-landing.jsx", error: String((e && e.message) || e) }); }

// ui_kits/fluvio-app/screens-login.jsx
try { (() => {
/* ============================================================
   FLUVIO — Login / Auth (split layout)
   ============================================================ */

function Login({
  onNav
}) {
  const [mode, setMode] = React.useState('login');
  const [email, setEmail] = React.useState('luis@dublebistro.mx');
  const [pass, setPass] = React.useState('demo1234');
  const [loading, setLoading] = React.useState(false);
  const submit = e => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => onNav('dashboard'), 850);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      minHeight: '100vh'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "hide-sm",
    style: {
      flex: '1 1 0',
      background: 'var(--plum)',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '40px 48px',
      color: '#fff',
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: -80,
      left: -60,
      width: 360,
      height: 360,
      background: 'radial-gradient(circle, rgba(255,255,255,.08), transparent 65%)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: -100,
      right: -60,
      width: 400,
      height: 400,
      background: 'radial-gradient(circle, rgba(255,255,255,.06), transparent 65%)'
    }
  }), /*#__PURE__*/React.createElement("button", {
    className: "row gap-10",
    style: {
      position: 'relative',
      alignSelf: 'flex-start'
    },
    onClick: () => onNav('landing')
  }, /*#__PURE__*/React.createElement(Logo, {
    size: 30,
    mono: true
  }), /*#__PURE__*/React.createElement("span", {
    className: "display",
    style: {
      fontWeight: 700,
      fontSize: 21,
      color: '#fff'
    }
  }, "Fluvio")), /*#__PURE__*/React.createElement("div", {
    className: "col gap-24",
    style: {
      position: 'relative',
      maxWidth: 440
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      color: '#fff',
      fontSize: 'clamp(30px, 3.5vw, 40px)',
      lineHeight: 1.08
    }
  }, "Reservaciones inteligentes para tu restaurante."), /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      background: 'rgba(255,255,255,.08)',
      border: '1px solid rgba(255,255,255,.14)',
      padding: 18,
      boxShadow: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "row gap-10",
    style: {
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "ai-pulse"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      color: 'rgba(255,255,255,.7)',
      fontWeight: 600,
      letterSpacing: '.02em'
    }
  }, "FLUVIO \xB7 EN VIVO")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 15,
      color: 'rgba(255,255,255,.92)',
      lineHeight: 1.5
    }
  }, "\"Desde que usamos Fluvio bajamos los no-shows a la mitad. El bot trabaja todas las noches por nosotros.\""), /*#__PURE__*/React.createElement("div", {
    className: "row gap-10",
    style: {
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: "Luis Duble",
    size: 34
  }), /*#__PURE__*/React.createElement("div", {
    className: "col",
    style: {
      gap: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600,
      fontSize: 13.5
    }
  }, "Luis Duble"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'rgba(255,255,255,.65)'
    }
  }, "Due\xF1o \xB7 Duble Bistr\xF3"))))), /*#__PURE__*/React.createElement("div", {
    className: "row gap-20",
    style: {
      position: 'relative',
      color: 'rgba(255,255,255,.6)',
      fontSize: 12.5
    }
  }, /*#__PURE__*/React.createElement("span", null, "\xA9 2026 Fluvio"), /*#__PURE__*/React.createElement("span", null, "Privacidad"), /*#__PURE__*/React.createElement("span", null, "T\xE9rminos"))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '1 1 0',
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      padding: '22px 28px',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "row gap-10 hide-md",
    style: {
      display: 'none'
    },
    onClick: () => onNav('landing')
  }, /*#__PURE__*/React.createElement(Logo, {
    size: 26
  })), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-subtle btn-sm",
    style: {
      marginLeft: 'auto'
    },
    onClick: () => onNav('landing')
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevronLeft",
    size: 16
  }), " Volver")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'grid',
      placeItems: 'center',
      padding: '12px 24px 60px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "col gap-24",
    style: {
      width: '100%',
      maxWidth: 380
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "row gap-10",
    style: {
      justifyContent: 'center'
    },
    onClick: () => onNav('landing')
  }, /*#__PURE__*/React.createElement(Logo, {
    size: 34
  })), /*#__PURE__*/React.createElement("div", {
    className: "col gap-4",
    style: {
      textAlign: 'center',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 28
    }
  }, mode === 'login' ? 'Bienvenido de vuelta' : 'Crea tu cuenta'), /*#__PURE__*/React.createElement("p", {
    className: "muted",
    style: {
      fontSize: 14.5
    }
  }, mode === 'login' ? 'Inicia sesión para entrar a tu panel.' : 'Empieza tus 14 días gratis, sin tarjeta.')), /*#__PURE__*/React.createElement("form", {
    className: "col gap-14",
    onSubmit: submit
  }, mode === 'signup' && /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", null, "Nombre del restaurante"), /*#__PURE__*/React.createElement("input", {
    className: "input",
    placeholder: "Duble Bistr\xF3",
    defaultValue: ""
  })), /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", null, "Correo electr\xF3nico"), /*#__PURE__*/React.createElement("div", {
    className: "search-wrap"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "mail",
    className: "s-ico"
  }), /*#__PURE__*/React.createElement("input", {
    className: "input",
    type: "email",
    value: email,
    onChange: e => setEmail(e.target.value),
    placeholder: "tu@restaurante.mx"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("label", null, "Contrase\xF1a"), mode === 'login' && /*#__PURE__*/React.createElement("a", {
    style: {
      fontSize: 13,
      color: 'var(--violet-ink)',
      fontWeight: 600
    }
  }, "\xBFOlvidaste?")), /*#__PURE__*/React.createElement("div", {
    className: "search-wrap"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "lock",
    className: "s-ico"
  }), /*#__PURE__*/React.createElement("input", {
    className: "input",
    type: "password",
    value: pass,
    onChange: e => setPass(e.target.value),
    placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
  }))), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary btn-lg btn-block",
    type: "submit",
    disabled: loading,
    style: {
      marginTop: 4
    }
  }, loading ? /*#__PURE__*/React.createElement("span", {
    className: "row gap-8"
  }, /*#__PURE__*/React.createElement("span", {
    className: "spin"
  }), "Entrando\u2026") : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta gratis')), /*#__PURE__*/React.createElement("div", {
    className: "row gap-12",
    style: {
      color: 'var(--ink-3)',
      fontSize: 12.5
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 1,
      background: 'var(--line)'
    }
  }), "o", /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 1,
      background: 'var(--line)'
    }
  })), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-block",
    onClick: () => onNav('dashboard')
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "whatsapp",
    size: 18,
    style: {
      color: '#25D366'
    }
  }), " Continuar con WhatsApp Business"), /*#__PURE__*/React.createElement("p", {
    className: "muted",
    style: {
      textAlign: 'center',
      fontSize: 14
    }
  }, mode === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? ', /*#__PURE__*/React.createElement("a", {
    style: {
      color: 'var(--violet-ink)',
      fontWeight: 600
    },
    onClick: () => setMode(mode === 'login' ? 'signup' : 'login')
  }, mode === 'login' ? 'Regístrate' : 'Inicia sesión'))))));
}
Object.assign(window, {
  Login
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/fluvio-app/screens-login.jsx", error: String((e && e.message) || e) }); }

// ui_kits/fluvio-app/screens-misc.jsx
try { (() => {
/* ============================================================
   FLUVIO — Clientes · Mesas · Configuración
   ============================================================ */

/* ---------------- CLIENTES ---------------- */
function ClientPanel({
  client,
  reservations,
  onClose
}) {
  const hist = reservations.filter(r => r.clientId === client.id);
  return /*#__PURE__*/React.createElement(Scrim, {
    onClose: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "drawer"
  }, /*#__PURE__*/React.createElement("div", {
    className: "drawer-head"
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: client.name,
    size: 44
  }), /*#__PURE__*/React.createElement("div", {
    className: "col",
    style: {
      gap: 2,
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "row gap-6",
    style: {
      fontWeight: 700,
      fontSize: 17
    }
  }, client.name, " ", client.tags.includes('VIP') && /*#__PURE__*/React.createElement(VipTag, null)), /*#__PURE__*/React.createElement("span", {
    className: "faint",
    style: {
      fontSize: 13
    }
  }, client.phone)), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-icon btn-subtle",
    onClick: onClose
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "x",
    size: 18
  }))), /*#__PURE__*/React.createElement("div", {
    className: "drawer-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row gap-12"
  }, [['Visitas', client.visits], ['Última', client.last === '—' ? '—' : new Date(client.last).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short'
  })], ['Canal fav.', 'WhatsApp']].map(([l, v]) => /*#__PURE__*/React.createElement("div", {
    key: l,
    className: "card",
    style: {
      flex: 1,
      padding: '12px 14px',
      boxShadow: 'none',
      background: 'var(--surface-2)',
      border: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "display",
    style: {
      fontSize: 21,
      fontWeight: 600
    }
  }, v), /*#__PURE__*/React.createElement("div", {
    className: "faint",
    style: {
      fontSize: 12
    }
  }, l)))), client.notes && /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      padding: 14,
      boxShadow: 'none',
      background: 'var(--st-pend-bg)',
      border: '1px solid #EFE0BE'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "row gap-6",
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: 'var(--st-pend)',
      marginBottom: 5
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "alert",
    size: 14
  }), " NOTAS"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13.5,
      color: '#7A5A12'
    }
  }, client.notes)), /*#__PURE__*/React.createElement("div", {
    className: "col gap-10"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: 'var(--ink-2)'
    }
  }, "Historial de reservaciones"), hist.length ? hist.map(r => /*#__PURE__*/React.createElement("div", {
    className: "row gap-10",
    key: r.id,
    style: {
      padding: '10px 12px',
      borderRadius: 10,
      background: 'var(--surface-2)',
      border: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      borderRadius: 9,
      background: 'var(--surface)',
      display: 'grid',
      placeItems: 'center',
      flex: 'none'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "calendar",
    size: 17,
    style: {
      color: 'var(--ink-2)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "col",
    style: {
      gap: 1,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13.5,
      fontWeight: 600
    }
  }, r.dayLabel, " \xB7 ", r.time), /*#__PURE__*/React.createElement("span", {
    className: "faint",
    style: {
      fontSize: 12
    }
  }, r.people, " personas \xB7 ", r.table)), /*#__PURE__*/React.createElement(StatusBadge, {
    status: r.status
  }))) : /*#__PURE__*/React.createElement("p", {
    className: "faint",
    style: {
      fontSize: 13.5
    }
  }, "Sin reservaciones registradas todav\xEDa."))), /*#__PURE__*/React.createElement("div", {
    className: "drawer-foot"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost grow"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "whatsapp",
    size: 17,
    style: {
      color: '#25D366'
    }
  }), " Escribir"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary grow"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 17
  }), " Nueva reserva"))));
}
function Clientes({
  reservations
}) {
  const [q, setQ] = React.useState('');
  const [sel, setSel] = React.useState(null);
  const list = CLIENTS.filter(c => c.name.toLowerCase().includes(q.toLowerCase()) || c.phone.includes(q));
  return /*#__PURE__*/React.createElement("div", {
    className: "page page-enter"
  }, /*#__PURE__*/React.createElement(PageHeader, {
    title: "Clientes",
    subtitle: `${CLIENTS.length} clientes · ${CLIENTS.filter(c => c.visits >= 5).length} VIP`,
    actions: /*#__PURE__*/React.createElement("button", {
      className: "btn btn-primary"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "userplus",
      size: 17
    }), " Nuevo cliente")
  }), /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      padding: 14,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "search-wrap"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    className: "s-ico"
  }), /*#__PURE__*/React.createElement("input", {
    className: "input",
    placeholder: "Buscar por nombre o tel\xE9fono\u2026",
    value: q,
    onChange: e => setQ(e.target.value)
  }))), /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("table", {
    className: "tbl"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Nombre"), /*#__PURE__*/React.createElement("th", {
    className: "hide-sm"
  }, "Tel\xE9fono"), /*#__PURE__*/React.createElement("th", null, "Visitas"), /*#__PURE__*/React.createElement("th", {
    className: "hide-sm"
  }, "\xDAltima visita"), /*#__PURE__*/React.createElement("th", {
    className: "hide-sm"
  }, "Notas"), /*#__PURE__*/React.createElement("th", null))), /*#__PURE__*/React.createElement("tbody", null, list.map(c => /*#__PURE__*/React.createElement("tr", {
    key: c.id,
    style: {
      cursor: 'pointer'
    },
    onClick: () => setSel(c)
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    className: "row gap-10"
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: c.name,
    size: 34
  }), /*#__PURE__*/React.createElement("div", {
    className: "col",
    style: {
      gap: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "row gap-6",
    style: {
      fontWeight: 600,
      fontSize: 14
    }
  }, c.name, " ", c.tags.includes('VIP') && /*#__PURE__*/React.createElement(VipTag, null)), /*#__PURE__*/React.createElement("span", {
    className: "faint hide-sm",
    style: {
      fontSize: 12
    }
  }, c.tags.includes('Nuevo') ? 'Cliente nuevo' : 'Cliente recurrente')))), /*#__PURE__*/React.createElement("td", {
    className: "hide-sm"
  }, /*#__PURE__*/React.createElement("span", {
    className: "muted"
  }, c.phone)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "mono-num",
    style: {
      fontWeight: 600
    }
  }, c.visits)), /*#__PURE__*/React.createElement("td", {
    className: "hide-sm"
  }, /*#__PURE__*/React.createElement("span", {
    className: "muted"
  }, c.last === '—' ? '—' : new Date(c.last).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }))), /*#__PURE__*/React.createElement("td", {
    className: "hide-sm"
  }, /*#__PURE__*/React.createElement("span", {
    className: "faint",
    style: {
      fontSize: 13,
      maxWidth: 200,
      display: 'block',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, c.notes || '—')), /*#__PURE__*/React.createElement("td", {
    style: {
      width: 44
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevronRight",
    size: 17,
    style: {
      color: 'var(--ink-3)'
    }
  }))))))), sel && /*#__PURE__*/React.createElement(ClientPanel, {
    client: sel,
    reservations: reservations,
    onClose: () => setSel(null)
  }));
}

/* ---------------- MESAS ---------------- */
const ZONE_ICON = {
  'Terraza': 'sun',
  'Interior': 'utensils',
  'Barra': 'armchair'
};
function TableCard({
  table,
  onToggle
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "card card-pad col gap-14",
    style: {
      opacity: table.active ? 1 : 0.62
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "row gap-10"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 42,
      height: 42,
      borderRadius: 11,
      background: 'var(--violet-light)',
      color: 'var(--plum)',
      display: 'grid',
      placeItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: ZONE_ICON[table.zone] || 'tables',
    size: 20
  })), /*#__PURE__*/React.createElement("div", {
    className: "col",
    style: {
      gap: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "display",
    style: {
      fontWeight: 600,
      fontSize: 17
    }
  }, table.name), /*#__PURE__*/React.createElement("span", {
    className: "faint",
    style: {
      fontSize: 12.5
    }
  }, table.zone))), /*#__PURE__*/React.createElement("div", {
    className: 'switch' + (table.active ? ' on' : ''),
    onClick: () => onToggle(table.id)
  })), /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      justifyContent: 'space-between',
      borderTop: '1px solid var(--line)',
      paddingTop: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "row gap-6 muted",
    style: {
      fontSize: 13.5
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "users",
    size: 15
  }), " ", table.cap, " ", table.cap === 1 ? 'persona' : 'personas'), /*#__PURE__*/React.createElement("span", {
    className: 'badge ' + (table.active ? 'badge-conf' : 'badge-canc')
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), table.active ? 'Activa' : 'Inactiva')));
}
function Mesas() {
  const [tables, setTables] = React.useState(TABLES);
  const [zone, setZone] = React.useState('Todas');
  const toggle = id => setTables(ts => ts.map(t => t.id === id ? {
    ...t,
    active: !t.active
  } : t));
  const zones = ['Todas', 'Terraza', 'Interior', 'Barra'];
  const list = zone === 'Todas' ? tables : tables.filter(t => t.zone === zone);
  const activeCount = tables.filter(t => t.active).length;
  const totalCap = tables.filter(t => t.active).reduce((s, t) => s + t.cap, 0);
  return /*#__PURE__*/React.createElement("div", {
    className: "page page-enter"
  }, /*#__PURE__*/React.createElement(PageHeader, {
    title: "Mesas",
    subtitle: `${activeCount} mesas activas · ${totalCap} comensales de aforo`,
    actions: /*#__PURE__*/React.createElement("button", {
      className: "btn btn-primary"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "plus",
      size: 17
    }), " Agregar mesa")
  }), /*#__PURE__*/React.createElement("div", {
    className: "row gap-8",
    style: {
      marginBottom: 18,
      flexWrap: 'wrap'
    }
  }, zones.map(z => /*#__PURE__*/React.createElement("button", {
    key: z,
    className: 'chip' + (zone === z ? '' : ''),
    onClick: () => setZone(z),
    style: zone === z ? {
      background: 'var(--ink)',
      color: '#fff',
      cursor: 'pointer'
    } : {
      cursor: 'pointer'
    }
  }, z !== 'Todas' && /*#__PURE__*/React.createElement(Icon, {
    name: ZONE_ICON[z],
    size: 14
  }), z))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(248px, 1fr))',
      gap: 16
    }
  }, list.map(t => /*#__PURE__*/React.createElement(TableCard, {
    key: t.id,
    table: t,
    onToggle: toggle
  })), /*#__PURE__*/React.createElement("button", {
    className: "card col",
    style: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      padding: 22,
      border: '1.5px dashed var(--line-strong)',
      background: 'transparent',
      boxShadow: 'none',
      color: 'var(--ink-2)',
      minHeight: 150,
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 42,
      height: 42,
      borderRadius: 11,
      background: 'var(--surface-2)',
      display: 'grid',
      placeItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 20
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600,
      fontSize: 14
    }
  }, "Agregar mesa"))));
}

/* ---------------- CONFIGURACIÓN ---------------- */
function ConfigRow({
  label,
  hint,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      justifyContent: 'space-between',
      padding: '16px 0',
      borderTop: '1px solid var(--line)',
      gap: 24,
      alignItems: 'center',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "col",
    style: {
      gap: 2,
      maxWidth: 320
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600,
      fontSize: 14.5
    }
  }, label), hint && /*#__PURE__*/React.createElement("span", {
    className: "faint",
    style: {
      fontSize: 13
    }
  }, hint)), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 240,
      flex: '0 1 320px'
    }
  }, children));
}
function ConfigSection({
  icon,
  title,
  desc,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "card card-pad",
    style: {
      padding: '20px 24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "row gap-12",
    style: {
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 38,
      height: 38,
      borderRadius: 10,
      background: 'var(--violet-light)',
      color: 'var(--plum)',
      display: 'grid',
      placeItems: 'center',
      flex: 'none'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 19
  })), /*#__PURE__*/React.createElement("div", {
    className: "col",
    style: {
      gap: 1
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 17
    }
  }, title), desc && /*#__PURE__*/React.createElement("span", {
    className: "faint",
    style: {
      fontSize: 13
    }
  }, desc))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8
    }
  }, children));
}
function Configuracion() {
  const [section, setSection] = React.useState('perfil');
  const [notif, setNotif] = React.useState({
    reminders: true,
    newRes: true,
    noshow: true,
    weekly: false
  });
  const tog = k => setNotif(n => ({
    ...n,
    [k]: !n[k]
  }));
  const tabs = [['perfil', 'Perfil', 'building'], ['whatsapp', 'WhatsApp', 'whatsapp'], ['notif', 'Notificaciones', 'bell'], ['plan', 'Plan', 'card']];
  return /*#__PURE__*/React.createElement("div", {
    className: "page page-narrow page-enter"
  }, /*#__PURE__*/React.createElement(PageHeader, {
    title: "Configuraci\xF3n",
    subtitle: "Administra tu restaurante, integraciones y plan"
  }), /*#__PURE__*/React.createElement("div", {
    className: "row gap-6",
    style: {
      marginBottom: 20,
      borderBottom: '1px solid var(--line)',
      overflowX: 'auto'
    }
  }, tabs.map(([k, l, ic]) => /*#__PURE__*/React.createElement("button", {
    key: k,
    onClick: () => setSection(k),
    className: "row gap-8",
    style: {
      padding: '11px 14px',
      fontWeight: 600,
      fontSize: 14,
      color: section === k ? 'var(--ink)' : 'var(--ink-3)',
      borderBottom: section === k ? '2px solid var(--violet)' : '2px solid transparent',
      marginBottom: -1
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: ic,
    size: 16
  }), " ", l))), /*#__PURE__*/React.createElement("div", {
    className: "col gap-18"
  }, section === 'perfil' && /*#__PURE__*/React.createElement(ConfigSection, {
    icon: "building",
    title: "Perfil del negocio",
    desc: "C\xF3mo aparece tu restaurante en Fluvio y WhatsApp"
  }, /*#__PURE__*/React.createElement(ConfigRow, {
    label: "Nombre del restaurante"
  }, /*#__PURE__*/React.createElement("input", {
    className: "input",
    defaultValue: "Duble Bistr\xF3"
  })), /*#__PURE__*/React.createElement(ConfigRow, {
    label: "Tel\xE9fono de contacto"
  }, /*#__PURE__*/React.createElement("input", {
    className: "input",
    defaultValue: "+52 55 4040 1212"
  })), /*#__PURE__*/React.createElement(ConfigRow, {
    label: "Zona horaria"
  }, /*#__PURE__*/React.createElement("select", {
    className: "select",
    defaultValue: "cdmx"
  }, /*#__PURE__*/React.createElement("option", {
    value: "cdmx"
  }, "(GMT\u22126) Ciudad de M\xE9xico"), /*#__PURE__*/React.createElement("option", null, "(GMT\u22127) Tijuana"), /*#__PURE__*/React.createElement("option", null, "(GMT\u22125) Canc\xFAn"))), /*#__PURE__*/React.createElement(ConfigRow, {
    label: "Idioma"
  }, /*#__PURE__*/React.createElement("select", {
    className: "select",
    defaultValue: "es"
  }, /*#__PURE__*/React.createElement("option", {
    value: "es"
  }, "Espa\xF1ol"), /*#__PURE__*/React.createElement("option", {
    value: "en"
  }, "English")))), section === 'whatsapp' && /*#__PURE__*/React.createElement(ConfigSection, {
    icon: "whatsapp",
    title: "WhatsApp Business",
    desc: "El n\xFAmero desde el que el bot atiende a tus clientes"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      padding: 16,
      boxShadow: 'none',
      background: 'var(--st-conf-bg)',
      border: '1px solid #C7E3D3',
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "row gap-10"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wa-ico",
    style: {
      width: 36,
      height: 36
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "whatsapp",
    size: 20
  })), /*#__PURE__*/React.createElement("div", {
    className: "col",
    style: {
      gap: 1,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "row gap-6",
    style: {
      fontWeight: 600,
      fontSize: 14
    }
  }, "+52 55 4040 1212 ", /*#__PURE__*/React.createElement("span", {
    className: "badge badge-conf",
    style: {
      height: 20
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), "Conectado")), /*#__PURE__*/React.createElement("span", {
    className: "faint",
    style: {
      fontSize: 12.5
    }
  }, "Bot activo \xB7 1.284 mensajes este mes")), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-sm"
  }, "Reconectar"))), /*#__PURE__*/React.createElement(ConfigRow, {
    label: "N\xFAmero de WhatsApp",
    hint: "El bot responde desde este n\xFAmero"
  }, /*#__PURE__*/React.createElement("input", {
    className: "input",
    defaultValue: "+52 55 4040 1212"
  })), /*#__PURE__*/React.createElement(ConfigRow, {
    label: "Mensaje de bienvenida",
    hint: "Lo primero que recibe un cliente nuevo"
  }, /*#__PURE__*/React.createElement("textarea", {
    className: "textarea",
    defaultValue: "\xA1Hola! \uD83D\uDC4B Bienvenido a Duble Bistr\xF3. \xBFTe ayudo a reservar mesa?"
  })), /*#__PURE__*/React.createElement(ConfigRow, {
    label: "Tomar reservas 24/7",
    hint: "El bot atiende incluso fuera de horario"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      justifyContent: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "switch on"
  })))), section === 'notif' && /*#__PURE__*/React.createElement(ConfigSection, {
    icon: "bell",
    title: "Notificaciones",
    desc: "Cu\xE1ndo y c\xF3mo te avisamos"
  }, /*#__PURE__*/React.createElement(ConfigRow, {
    label: "Recordatorios anti no-show",
    hint: "Mensaje autom\xE1tico antes de cada reserva"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      justifyContent: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: 'switch' + (notif.reminders ? ' on' : ''),
    onClick: () => tog('reminders')
  }))), /*#__PURE__*/React.createElement(ConfigRow, {
    label: "Nueva reserva del bot",
    hint: "Aviso cuando el bot agenda una mesa"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      justifyContent: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: 'switch' + (notif.newRes ? ' on' : ''),
    onClick: () => tog('newRes')
  }))), /*#__PURE__*/React.createElement(ConfigRow, {
    label: "Alerta de no-show",
    hint: "Cuando un cliente no se presenta"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      justifyContent: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: 'switch' + (notif.noshow ? ' on' : ''),
    onClick: () => tog('noshow')
  }))), /*#__PURE__*/React.createElement(ConfigRow, {
    label: "Resumen semanal",
    hint: "Reporte de ocupaci\xF3n cada lunes"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      justifyContent: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: 'switch' + (notif.weekly ? ' on' : ''),
    onClick: () => tog('weekly')
  })))), section === 'plan' && /*#__PURE__*/React.createElement(ConfigSection, {
    icon: "card",
    title: "Plan y facturaci\xF3n",
    desc: "Tu suscripci\xF3n actual"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      padding: 18,
      boxShadow: 'none',
      background: 'var(--plum)',
      color: '#fff',
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      justifyContent: 'space-between',
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "col gap-4"
  }, /*#__PURE__*/React.createElement("span", {
    className: "row gap-8",
    style: {
      fontWeight: 600,
      fontSize: 15
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "zap",
    size: 16
  }), " Plan Starter"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: 'rgba(255,255,255,.7)'
    }
  }, "500 reservas/mes \xB7 1 n\xFAmero de WhatsApp")), /*#__PURE__*/React.createElement("span", {
    className: "display",
    style: {
      fontSize: 28,
      fontWeight: 700
    }
  }, "$99", /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 500,
      color: 'rgba(255,255,255,.7)'
    }
  }, "/mes"))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 6,
      borderRadius: 99,
      background: 'rgba(255,255,255,.18)',
      margin: '14px 0 7px',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '64%',
      height: '100%',
      background: '#fff',
      borderRadius: 99
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      color: 'rgba(255,255,255,.75)'
    }
  }, "320 / 500 reservas usadas este mes")), /*#__PURE__*/React.createElement(ConfigRow, {
    label: "M\xE9todo de pago",
    hint: "Visa terminaci\xF3n 4242"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-block"
  }, "Actualizar tarjeta")), /*#__PURE__*/React.createElement(ConfigRow, {
    label: "Mejorar a Pro",
    hint: "Reservas ilimitadas + 3 n\xFAmeros"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary btn-block"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrowUpRight",
    size: 16
  }), " Subir a Pro"))), /*#__PURE__*/React.createElement("div", {
    className: "card card-pad",
    style: {
      padding: '20px 24px',
      border: '1px solid #EBC9C2',
      background: '#FCF3F1'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "row gap-12",
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 38,
      height: 38,
      borderRadius: 10,
      background: 'var(--st-no-bg)',
      color: 'var(--st-no)',
      display: 'grid',
      placeItems: 'center',
      flex: 'none'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "alert",
    size: 19
  })), /*#__PURE__*/React.createElement("div", {
    className: "col",
    style: {
      gap: 1
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 17,
      color: 'var(--st-no)'
    }
  }, "Zona de peligro"), /*#__PURE__*/React.createElement("span", {
    className: "faint",
    style: {
      fontSize: 13
    }
  }, "Acciones irreversibles. Procede con cuidado."))), /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      justifyContent: 'space-between',
      padding: '14px 0 0',
      borderTop: '1px solid #EBC9C2',
      gap: 16,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "col",
    style: {
      gap: 2,
      maxWidth: 360
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600,
      fontSize: 14.5
    }
  }, "Cancelar cuenta"), /*#__PURE__*/React.createElement("span", {
    className: "faint",
    style: {
      fontSize: 13
    }
  }, "Se eliminar\xE1n todas tus reservas, clientes y la conexi\xF3n de WhatsApp.")), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-danger"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "trash",
    size: 16
  }), " Cancelar cuenta")))));
}
Object.assign(window, {
  Clientes,
  Mesas,
  Configuracion,
  ClientPanel
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/fluvio-app/screens-misc.jsx", error: String((e && e.message) || e) }); }

// ui_kits/fluvio-app/screens-reservaciones.jsx
try { (() => {
/* ============================================================
   FLUVIO — Reservaciones (tabla + filtros + drawer)
   ============================================================ */

function ReservationDrawer({
  res,
  onClose,
  onSave
}) {
  const editing = res && res.clientId;
  const cl = editing ? clientById(res.clientId) : null;
  const [people, setPeople] = React.useState(res?.people || 2);
  const [channel, setChannel] = React.useState(res?.channel || 'manual');
  const [date, setDate] = React.useState('2026-05-30');
  const [time, setTime] = React.useState(res?.time || '14:00');
  const [client, setClient] = React.useState(cl?.name || '');
  const [showClients, setShowClients] = React.useState(false);
  const matches = CLIENTS.filter(c => c.name.toLowerCase().includes(client.toLowerCase())).slice(0, 4);
  return /*#__PURE__*/React.createElement(Scrim, {
    onClose: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "drawer"
  }, /*#__PURE__*/React.createElement("div", {
    className: "drawer-head"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 38,
      height: 38,
      borderRadius: 10,
      background: 'var(--violet-light)',
      color: 'var(--plum)',
      display: 'grid',
      placeItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: editing ? 'edit' : 'plus',
    size: 19
  })), /*#__PURE__*/React.createElement("div", {
    className: "col",
    style: {
      gap: 1,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 18
    }
  }, editing ? 'Editar reservación' : 'Nueva reservación'), /*#__PURE__*/React.createElement("span", {
    className: "faint",
    style: {
      fontSize: 12.5
    }
  }, editing ? 'Modifica los datos de la reserva' : 'Crea una reserva manualmente')), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-icon btn-subtle",
    onClick: onClose
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "x",
    size: 18
  }))), /*#__PURE__*/React.createElement("div", {
    className: "drawer-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "field",
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("label", null, "Cliente"), /*#__PURE__*/React.createElement("div", {
    className: "search-wrap"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "user",
    className: "s-ico"
  }), /*#__PURE__*/React.createElement("input", {
    className: "input",
    placeholder: "Buscar o crear cliente\u2026",
    value: client,
    onChange: e => {
      setClient(e.target.value);
      setShowClients(true);
    },
    onFocus: () => setShowClients(true)
  })), showClients && client && /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      marginTop: 4,
      zIndex: 5,
      padding: 6,
      boxShadow: 'var(--shadow-pop)'
    }
  }, matches.length ? matches.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.id,
    className: "row gap-10 client-pick",
    onClick: () => {
      setClient(c.name);
      setShowClients(false);
    },
    style: {
      padding: '8px 8px',
      borderRadius: 8,
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: c.name,
    size: 28
  }), /*#__PURE__*/React.createElement("div", {
    className: "col",
    style: {
      gap: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "row gap-6",
    style: {
      fontSize: 13.5,
      fontWeight: 500
    }
  }, c.name, " ", c.tags.includes('VIP') && /*#__PURE__*/React.createElement(VipTag, null)), /*#__PURE__*/React.createElement("span", {
    className: "faint",
    style: {
      fontSize: 11.5
    }
  }, c.phone, " \xB7 ", c.visits, " visitas")))) : /*#__PURE__*/React.createElement("div", {
    className: "row gap-10",
    style: {
      padding: '10px 8px',
      cursor: 'pointer'
    },
    onClick: () => setShowClients(false)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 28,
      height: 28,
      borderRadius: 99,
      background: 'var(--violet-light)',
      color: 'var(--plum)',
      display: 'grid',
      placeItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 15
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13.5,
      fontWeight: 500
    }
  }, "Crear \"", client, "\"")))), /*#__PURE__*/React.createElement("div", {
    className: "row gap-12"
  }, /*#__PURE__*/React.createElement("div", {
    className: "field",
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("label", null, "Fecha"), /*#__PURE__*/React.createElement("input", {
    className: "input",
    type: "date",
    value: date,
    onChange: e => setDate(e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "field",
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("label", null, "Hora"), /*#__PURE__*/React.createElement("input", {
    className: "input",
    type: "time",
    value: time,
    onChange: e => setTime(e.target.value)
  }))), /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", null, "N\xFAmero de personas"), /*#__PURE__*/React.createElement("div", {
    className: "row gap-8",
    style: {
      flexWrap: 'wrap'
    }
  }, [1, 2, 3, 4, 5, 6, 8].map(n => /*#__PURE__*/React.createElement("button", {
    key: n,
    className: 'btn btn-sm' + (people === n ? ' btn-primary' : ' btn-ghost'),
    style: {
      minWidth: 42
    },
    onClick: () => setPeople(n)
  }, n)), /*#__PURE__*/React.createElement("button", {
    className: 'btn btn-sm' + (people > 8 ? ' btn-primary' : ' btn-ghost'),
    onClick: () => setPeople(10)
  }, "+8"))), /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", null, "Mesa ", /*#__PURE__*/React.createElement("span", {
    className: "faint",
    style: {
      fontWeight: 400
    }
  }, "\xB7 opcional")), /*#__PURE__*/React.createElement("select", {
    className: "select",
    defaultValue: res?.table || ''
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Asignar autom\xE1ticamente"), TABLES.filter(t => t.active).map(t => /*#__PURE__*/React.createElement("option", {
    key: t.id,
    value: t.name
  }, t.name, " \xB7 ", t.zone, " (", t.cap, " pers.)")))), /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", null, "Canal"), /*#__PURE__*/React.createElement("div", {
    className: "row gap-8",
    style: {
      flexWrap: 'wrap'
    }
  }, Object.entries(CHANNEL).map(([k, c]) => /*#__PURE__*/React.createElement("button", {
    key: k,
    className: 'chip' + (channel === k ? ' chip-on' : ''),
    onClick: () => setChannel(k),
    style: channel === k ? {
      background: 'var(--violet-light)',
      color: 'var(--plum)',
      border: '1px solid var(--violet-light)',
      fontWeight: 600
    } : {
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: c.icon,
    size: 14
  }), " ", c.label)))), /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("label", null, "Notas ", /*#__PURE__*/React.createElement("span", {
    className: "faint",
    style: {
      fontWeight: 400
    }
  }, "\xB7 opcional")), /*#__PURE__*/React.createElement("textarea", {
    className: "textarea",
    placeholder: "Alergias, preferencias de mesa, ocasi\xF3n especial\u2026",
    defaultValue: res?.notes || ''
  }))), /*#__PURE__*/React.createElement("div", {
    className: "drawer-foot"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost grow",
    onClick: onClose
  }, "Cancelar"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary grow",
    onClick: () => onSave({
      client,
      time,
      people,
      channel
    })
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 17
  }), " ", editing ? 'Guardar cambios' : 'Crear reservación'))));
}
function Reservaciones({
  reservations,
  onAction,
  onOpen,
  onNewRes
}) {
  const [q, setQ] = React.useState('');
  const [status, setStatus] = React.useState('all');
  const [day, setDay] = React.useState('all');
  let list = reservations.filter(r => {
    const cl = clientById(r.clientId);
    if (q && !cl.name.toLowerCase().includes(q.toLowerCase()) && !cl.phone.includes(q)) return false;
    if (status !== 'all' && r.status !== status) return false;
    if (day !== 'all' && r.dayLabel !== day) return false;
    return true;
  });
  const statusOpts = [['all', 'Todos'], ['pendiente', 'Pendientes'], ['confirmada', 'Confirmadas'], ['sentada', 'Sentadas'], ['no_show', 'No-show'], ['cancelada', 'Canceladas']];
  return /*#__PURE__*/React.createElement("div", {
    className: "page page-enter"
  }, /*#__PURE__*/React.createElement(PageHeader, {
    title: "Reservaciones",
    subtitle: `${reservations.length} reservas en total · ${reservations.filter(r => r.status === 'pendiente').length} pendientes`,
    actions: /*#__PURE__*/React.createElement("button", {
      className: "btn btn-primary",
      onClick: onNewRes
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "plus",
      size: 17
    }), " Nueva reservaci\xF3n")
  }), /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      padding: 14,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "row gap-10",
    style: {
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "search-wrap grow",
    style: {
      minWidth: 220
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    className: "s-ico"
  }), /*#__PURE__*/React.createElement("input", {
    className: "input",
    placeholder: "Buscar por nombre o tel\xE9fono\u2026",
    value: q,
    onChange: e => setQ(e.target.value)
  })), /*#__PURE__*/React.createElement("select", {
    className: "select",
    style: {
      width: 'auto',
      minWidth: 150
    },
    value: day,
    onChange: e => setDay(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: "all"
  }, "Cualquier fecha"), /*#__PURE__*/React.createElement("option", {
    value: "Hoy"
  }, "Hoy"), /*#__PURE__*/React.createElement("option", {
    value: "Ma\xF1ana"
  }, "Ma\xF1ana"), /*#__PURE__*/React.createElement("option", {
    value: "Pasado ma\xF1ana"
  }, "Pasado ma\xF1ana"), /*#__PURE__*/React.createElement("option", {
    value: "Ayer"
  }, "Ayer")), /*#__PURE__*/React.createElement("select", {
    className: "select",
    style: {
      width: 'auto',
      minWidth: 150
    },
    value: status,
    onChange: e => setStatus(e.target.value)
  }, statusOpts.map(([v, l]) => /*#__PURE__*/React.createElement("option", {
    key: v,
    value: v
  }, l))))), /*#__PURE__*/React.createElement("div", {
    className: "row gap-8",
    style: {
      marginBottom: 14,
      flexWrap: 'wrap',
      overflowX: 'auto'
    }
  }, statusOpts.map(([v, l]) => /*#__PURE__*/React.createElement("button", {
    key: v,
    className: 'chip' + (status === v ? ' chip-on' : ''),
    onClick: () => setStatus(v),
    style: status === v ? {
      background: 'var(--ink)',
      color: '#fff',
      cursor: 'pointer'
    } : {
      cursor: 'pointer'
    }
  }, l))), /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      overflow: 'hidden'
    }
  }, list.length === 0 ? /*#__PURE__*/React.createElement(EmptyState, {
    icon: "search",
    title: "Sin resultados",
    body: "Prueba con otro nombre, fecha o estado. Tambi\xE9n puedes crear una reserva nueva.",
    action: /*#__PURE__*/React.createElement("button", {
      className: "btn btn-primary btn-sm",
      onClick: onNewRes
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "plus",
      size: 15
    }), " Nueva reservaci\xF3n")
  }) : /*#__PURE__*/React.createElement("table", {
    className: "tbl"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Hora"), /*#__PURE__*/React.createElement("th", null, "Cliente"), /*#__PURE__*/React.createElement("th", {
    className: "hide-sm"
  }, "D\xEDa"), /*#__PURE__*/React.createElement("th", {
    className: "hide-sm"
  }, "Pers."), /*#__PURE__*/React.createElement("th", {
    className: "hide-sm"
  }, "Mesa"), /*#__PURE__*/React.createElement("th", {
    className: "hide-sm"
  }, "Canal"), /*#__PURE__*/React.createElement("th", null, "Estado"), /*#__PURE__*/React.createElement("th", null))), /*#__PURE__*/React.createElement("tbody", null, list.map(r => {
    const cl = clientById(r.clientId);
    return /*#__PURE__*/React.createElement("tr", {
      key: r.id,
      style: {
        cursor: 'pointer'
      },
      onClick: () => onOpen(r)
    }, /*#__PURE__*/React.createElement("td", {
      style: {
        width: 70
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "display",
      style: {
        fontWeight: 600,
        fontSize: 15
      }
    }, r.time)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
      className: "row gap-10"
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: cl.name,
      size: 32
    }), /*#__PURE__*/React.createElement("div", {
      className: "col",
      style: {
        gap: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "row gap-6",
      style: {
        fontWeight: 600,
        fontSize: 14
      }
    }, cl.name, cl.tags.includes('VIP') && /*#__PURE__*/React.createElement(VipTag, null)), /*#__PURE__*/React.createElement("span", {
      className: "faint",
      style: {
        fontSize: 12.5
      }
    }, cl.phone)))), /*#__PURE__*/React.createElement("td", {
      className: "hide-sm"
    }, /*#__PURE__*/React.createElement("span", {
      className: "muted",
      style: {
        fontSize: 13.5
      }
    }, r.dayLabel)), /*#__PURE__*/React.createElement("td", {
      className: "hide-sm"
    }, /*#__PURE__*/React.createElement("span", {
      className: "mono-num"
    }, r.people)), /*#__PURE__*/React.createElement("td", {
      className: "hide-sm"
    }, /*#__PURE__*/React.createElement("span", {
      className: "muted"
    }, r.table)), /*#__PURE__*/React.createElement("td", {
      className: "hide-sm"
    }, /*#__PURE__*/React.createElement(ChannelTag, {
      channel: r.channel,
      showLabel: false
    })), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(StatusBadge, {
      status: r.status
    })), /*#__PURE__*/React.createElement("td", {
      style: {
        width: 150
      }
    }, /*#__PURE__*/React.createElement(QuickActions, {
      res: r,
      onAction: onAction
    })));
  }))), list.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "row",
    style: {
      justifyContent: 'space-between',
      padding: '13px 18px',
      borderTop: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "faint",
    style: {
      fontSize: 13
    }
  }, "Mostrando ", list.length, " de ", reservations.length), /*#__PURE__*/React.createElement("div", {
    className: "row gap-6"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-sm btn-icon",
    disabled: true
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevronLeft",
    size: 16
  })), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-soft btn-sm",
    style: {
      minWidth: 33
    }
  }, "1"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    style: {
      minWidth: 33
    }
  }, "2"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-sm btn-icon"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevronRight",
    size: 16
  }))))));
}
Object.assign(window, {
  Reservaciones,
  ReservationDrawer
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/fluvio-app/screens-reservaciones.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Logo = __ds_scope.Logo;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Chip = __ds_scope.Chip;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.StatCard = __ds_scope.StatCard;

})();
