import React from 'react';

const STATUS = {
  confirmada: { cls: 'badge-conf', label: 'Confirmada' },
  pendiente:  { cls: 'badge-pend', label: 'Pendiente' },
  sentada:    { cls: 'badge-seat', label: 'Sentada' },
  no_show:    { cls: 'badge-no',   label: 'No-show' },
  cancelada:  { cls: 'badge-canc', label: 'Cancelada' },
};

/**
 * Fluvio Badge — small status pill with a leading dot.
 * Pass `status` for a reservation state (maps to the brand status palette),
 * or `variant` + children for a custom pill.
 */
export function Badge({ status, variant, dot = true, className = '', children, ...rest }) {
  if (status) {
    const s = STATUS[status] || STATUS.pendiente;
    return (
      <span className={['badge', s.cls, className].filter(Boolean).join(' ')} {...rest}>
        {dot && <span className="dot" />}{children || s.label}
      </span>
    );
  }
  const variantClass = {
    conf: 'badge-conf', pend: 'badge-pend', seat: 'badge-seat',
    no: 'badge-no', canc: 'badge-canc',
  }[variant] || 'badge-pend';
  return (
    <span className={['badge', variantClass, className].filter(Boolean).join(' ')} {...rest}>
      {dot && <span className="dot" />}{children}
    </span>
  );
}
