import * as React from 'react';

/**
 * Fluvio Chip — pill filter/tab. Active is a violet fill; inactive is mist text.
 */
export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Selected state — violet fill. @default false */
  active?: boolean;
  /** Optional leading icon node. */
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export function Chip(props: ChipProps): JSX.Element;
