import React from 'react';

function initials(name = '') {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] || '') + (p[1]?.[0] || '')).toUpperCase() || '?';
}

/**
 * Fluvio Avatar — circular initials chip. Uniform violet-light fill with
 * violet-dark initials in Syne (per brand). Optional VIP ring.
 */
export function Avatar({ name = '', size = 34, vip = false, className = '', style = {}, ...rest }) {
  return (
    <span
      className={['avatar', className].filter(Boolean).join(' ')}
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.34),
        ...(vip ? { boxShadow: '0 0 0 2px var(--surface), 0 0 0 3.5px var(--coral)' } : {}),
        ...style,
      }}
      {...rest}
    >
      {initials(name)}
    </span>
  );
}
