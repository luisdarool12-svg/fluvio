import * as React from 'react';

/**
 * Fluvio Input — labeled text field with violet focus ring and optional icon.
 *
 * @startingPoint section="Core" subtitle="Labeled text field — violet focus ring, optional leading icon" viewport="700x140"
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Field label rendered above the input. */
  label?: string;
  /** Leading icon node inside the field. */
  icon?: React.ReactNode;
  /** Helper text below the field. */
  hint?: string;
}

export function Input(props: InputProps): JSX.Element;
