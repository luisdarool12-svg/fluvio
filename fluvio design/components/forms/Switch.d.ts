import * as React from 'react';

/**
 * Fluvio Switch — on/off toggle, violet when on.
 */
export interface SwitchProps {
  /** On/off state. @default false */
  checked?: boolean;
  /** Called with the next boolean when toggled. */
  onChange?: (next: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Switch(props: SwitchProps): JSX.Element;
