import React from 'react';

/**
 * Fluvio Chip — pill filter/tab. Active = violet fill; inactive = mist text
 * that darkens on hover. Use in groups inside cards (filter tabs).
 */
export function Chip({ active = false, icon, className = '', children, ...rest }) {
  return (
    <button
      type="button"
      className={['ftab', active ? 'on' : '', className].filter(Boolean).join(' ')}
      {...rest}
    >
      {icon}{children}
    </button>
  );
}
