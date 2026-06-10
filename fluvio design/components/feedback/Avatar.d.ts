import * as React from 'react';

/**
 * Fluvio Avatar — circular initials chip in violet-light with Syne initials.
 */
export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Full name — initials are derived from the first two words. */
  name: string;
  /** Diameter in px. @default 34 */
  size?: number;
  /** Coral ring for VIP clients. @default false */
  vip?: boolean;
}

export function Avatar(props: AvatarProps): JSX.Element;
