import * as React from 'react';

/**
 * Fluvio StatCard — KPI metric tile with uppercase label, large Syne number,
 * trend delta, and an optional violet progress ring.
 *
 * @startingPoint section="Core" subtitle="KPI metric tile — Syne number, trend delta, optional ring" viewport="700x160"
 */
export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Icon node shown in a violet-light chip. */
  icon?: React.ReactNode;
  /** Uppercase caption, e.g. "Reservas hoy". */
  label: string;
  /** Metric value (string or number). Ignored when `ring` is set. */
  value?: React.ReactNode;
  /** Trend caption, e.g. "+18%". */
  trend?: React.ReactNode;
  /** Color of the trend caption. @default "flat" */
  trendDir?: 'up' | 'down' | 'flat';
  /** Render a 0–100 progress ring instead of a number. */
  ring?: number;
}

export function StatCard(props: StatCardProps): JSX.Element;
