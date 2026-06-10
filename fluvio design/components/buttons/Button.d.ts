import * as React from 'react';

/**
 * Fluvio Button — the action primitive.
 * Primary (coral) is the single action color; use it sparingly for the one
 * key action per view. Violet is secondary/brand; soft/ghost/subtle for the rest.
 *
 * @startingPoint section="Core" subtitle="Coral CTA + violet / soft / ghost variants, 3 sizes, icon support" viewport="700x150"
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual emphasis. @default "primary" */
  variant?: 'primary' | 'violet' | 'soft' | 'ghost' | 'subtle' | 'danger';
  /** @default "md" */
  size?: 'sm' | 'md' | 'lg';
  /** Leading icon node (e.g. an inline SVG). */
  icon?: React.ReactNode;
  /** Trailing icon node. */
  iconRight?: React.ReactNode;
  /** Stretch to fill container width. @default false */
  block?: boolean;
  children?: React.ReactNode;
}

export function Button(props: ButtonProps): JSX.Element;
