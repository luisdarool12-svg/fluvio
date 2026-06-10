import * as React from 'react';

/**
 * Fluvio status Badge — a small pill with a leading dot, used for reservation
 * states (Confirmada, Pendiente, Sentada, No-show, Cancelada).
 *
 * @startingPoint section="Core" subtitle="Reservation status pills with brand status palette" viewport="700x120"
 */
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Reservation status — auto-labels and colors the pill. */
  status?: 'confirmada' | 'pendiente' | 'sentada' | 'no_show' | 'cancelada';
  /** Raw color variant when not using `status` (needs children). */
  variant?: 'conf' | 'pend' | 'seat' | 'no' | 'canc';
  /** Show the leading dot. @default true */
  dot?: boolean;
  children?: React.ReactNode;
}

export function Badge(props: BadgeProps): JSX.Element;
