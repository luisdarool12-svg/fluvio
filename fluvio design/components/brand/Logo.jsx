import React from 'react';

/**
 * Fluvio Logo — three flowing wave currents (violet → medium violet → coral),
 * the brand gradient expressed through the mark without a CSS gradient.
 * variant "color" for light backgrounds, "mono" (all white) for the dark sidebar.
 * Set `wordmark` to render the FLUVIO lockup.
 */
export function Logo({ size = 28, variant = 'color', wordmark = false }) {
  const mono = variant === 'mono';
  const c1 = mono ? '#FFFFFF' : '#6447F5';
  const c2 = mono ? '#FFFFFF' : '#9B8CF8';
  const c3 = mono ? '#FFFFFF' : '#FF6A38';
  const mark = (
    <svg width={size * 1.15} height={size} viewBox="0 0 46 40" fill="none" style={{ flex: 'none' }}>
      <path d="M5 12 C11 7.2 16 7.2 23 11.4 C30 15.6 35 15.6 41 10.6" stroke={c1} strokeWidth="6.2" strokeLinecap="round" />
      <path d="M6 21.4 C11.4 17.2 15.8 17.2 21.6 20.8 C27 24 31 24 36 20.4" stroke={c2} strokeOpacity={mono ? 0.65 : 1} strokeWidth="5.7" strokeLinecap="round" />
      <path d="M9.5 30.4 C13.6 27 17 27 21.6 29.8 C25.2 32 27.8 32 30.8 29.6" stroke={c3} strokeOpacity={mono ? 0.9 : 1} strokeWidth="5.4" strokeLinecap="round" />
    </svg>
  );
  if (!wordmark) return mark;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.46 }}>
      {mark}
      <span style={{
        fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: size * 0.82,
        letterSpacing: '0.04em', lineHeight: 1, color: mono ? '#FFFFFF' : '#6447F5',
      }}>FLUVIO</span>
    </span>
  );
}
