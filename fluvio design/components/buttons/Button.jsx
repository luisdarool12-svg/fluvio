import React from 'react';

/**
 * Fluvio Button — the action primitive.
 * Primary = Coral (the action color, use sparingly). Violet = secondary/brand.
 * Soft / ghost / subtle / danger for lower-emphasis actions.
 */
export function Button({
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
    primary: 'btn-primary',   // Coral CTA — "Nueva reservación", "Mejorar plan"
    violet: 'btn-violet',     // brand / secondary
    soft: 'btn-soft',
    ghost: 'btn-ghost',
    subtle: 'btn-subtle',
    danger: 'btn-danger',
  }[variant] || 'btn-primary';

  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';
  const iconOnly = !children && (icon || iconRight);

  const cls = [
    'btn',
    variantClass,
    sizeClass,
    iconOnly ? 'btn-icon' : '',
    block ? 'btn-block' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button type={type} className={cls} disabled={disabled} {...rest}>
      {icon}
      {children && <span>{children}</span>}
      {iconRight}
    </button>
  );
}
