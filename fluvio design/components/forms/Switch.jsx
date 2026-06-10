import React from 'react';

/**
 * Fluvio Switch — on/off toggle. Violet when on. Controlled via `checked`.
 */
export function Switch({ checked = false, onChange, disabled = false, className = '', ...rest }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange && onChange(!checked)}
      className={['switch', checked ? 'on' : '', className].filter(Boolean).join(' ')}
      style={{ border: 'none', opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
      {...rest}
    />
  );
}
