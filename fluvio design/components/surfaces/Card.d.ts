import * as React from 'react';

/**
 * Fluvio Card — base white surface; elevation is a 1px line border, not a shadow.
 *
 * @startingPoint section="Core" subtitle="Base white surface — border-only elevation" viewport="700x180"
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Use the larger 14px radius for prominent cards. @default false */
  prominent?: boolean;
  /** Inner padding. @default "md" (18px) */
  pad?: 'none' | 'md' | 'lg';
  children?: React.ReactNode;
}

export function Card(props: CardProps): JSX.Element;
