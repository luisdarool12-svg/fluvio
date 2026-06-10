import React from 'react';

/**
 * Fluvio Input — labeled text field. Violet focus ring, optional leading icon.
 */
export function Input({ label, icon, hint, id, className = '', style = {}, ...rest }) {
  const inputId = id || (label ? 'in-' + label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const field = (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      {icon && (
        <span style={{ position: 'absolute', left: 12, display: 'grid', placeItems: 'center', color: 'var(--ink-3)', pointerEvents: 'none' }}>
          {icon}
        </span>
      )}
      <input
        id={inputId}
        className={['input', className].filter(Boolean).join(' ')}
        style={{ ...(icon ? { paddingLeft: 38 } : {}), ...style }}
        {...rest}
      />
    </div>
  );
  if (!label && !hint) return field;
  return (
    <div className="field">
      {label && <label htmlFor={inputId}>{label}</label>}
      {field}
      {hint && <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{hint}</span>}
    </div>
  );
}
