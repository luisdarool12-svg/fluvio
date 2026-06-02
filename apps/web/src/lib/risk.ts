// Niveles de riesgo de no-show. Espejo en frontend de `recommended_action`
// del backend (apps/api/modules/reservations/scoring.py) — misma frontera de rangos.

export interface RiskLevel {
  key: 'bajo' | 'medio' | 'alto' | 'critico'
  label: string
  action: string
  color: string
  bg: string
}

export function riskLevel(score: number): RiskLevel {
  if (score <= 30) {
    return {
      key: 'bajo',
      label: 'Bajo',
      action: 'Recordatorio estándar',
      color: 'var(--st-conf)',
      bg: 'var(--st-conf-bg)',
    }
  }
  if (score <= 60) {
    return {
      key: 'medio',
      label: 'Medio',
      action: 'Recordatorio + pedir confirmación',
      color: 'var(--st-pend)',
      bg: 'var(--st-pend-bg)',
    }
  }
  if (score <= 80) {
    return {
      key: 'alto',
      label: 'Alto',
      action: 'Confirmación requerida + avisar al dueño',
      color: '#C2410C',
      bg: '#FBEADD',
    }
  }
  return {
    key: 'critico',
    label: 'Crítico',
    action: 'Alerta al dueño + activar lista de espera',
    color: 'var(--st-no)',
    bg: 'var(--st-no-bg)',
  }
}
