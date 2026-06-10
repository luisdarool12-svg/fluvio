import React from 'react';

/**
 * Fluvio Card — the base surface. White, 1px line border, 12px radius.
 * Elevation is the border, never a shadow (overlays excepted).
 */
export function Card({ prominent = false, pad = 'md', className = '', children, ...rest }) {
  const padClass = pad === 'lg' ? 'card-pad-lg' : pad === 'none' ? '' : 'card-pad';
  const cls = [
    'card',
    prominent ? 'card-prominent' : '',
    padClass,
    className,
  ].filter(Boolean).join(' ');
  return <div className={cls} {...rest}>{children}</div>;
}
