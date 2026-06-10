import * as React from 'react';

/**
 * Fluvio Logo — three-wave mark (violet → medium violet → coral), optionally
 * locked up with the FLUVIO wordmark. Use "mono" on the dark plum sidebar.
 *
 * @startingPoint section="Brand" subtitle="Three-wave mark + FLUVIO lockup, color / mono" viewport="700x120"
 */
export interface LogoProps {
  /** Mark height in px. @default 28 */
  size?: number;
  /** "color" for light backgrounds, "mono" (all white) for dark. @default "color" */
  variant?: 'color' | 'mono';
  /** Render the horizontal FLUVIO lockup. @default false */
  wordmark?: boolean;
}

export function Logo(props: LogoProps): JSX.Element;
