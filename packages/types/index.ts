// Tipos compartidos — alineados con el esquema SQL de packages/database

export type BusinessTipo = 'restaurante' | 'salon' | 'clinica' | 'otro'
export type BusinessPlan = 'starter' | 'pro' | 'premium'
export type UserRol = 'owner' | 'manager' | 'staff'
export type ReservationEstado = 'pendiente' | 'confirmada' | 'sentada' | 'no_show' | 'cancelada'
export type ReservationCanal = 'whatsapp' | 'web' | 'telefono' | 'manual'

export interface Business {
  id: string
  nombre: string
  tipo: BusinessTipo
  telefono_whatsapp: string | null
  zona_horaria: string
  idioma_default: string
  plan: BusinessPlan
  activo: boolean
  created_at: string
}

export interface User {
  id: string
  business_id: string
  nombre: string
  email: string
  rol: UserRol
  activo: boolean
  created_at: string
}

export interface Table {
  id: string
  business_id: string
  nombre: string
  capacidad: number
  zona: string | null
  activo: boolean
  created_at: string
}

export interface Customer {
  id: string
  business_id: string
  nombre: string
  telefono: string
  idioma: string
  visitas: number
  ultima_visita: string | null
  notas: string | null
  created_at: string
}

export interface Reservation {
  id: string
  business_id: string
  customer_id: string
  table_id: string | null
  fecha_hora: string
  personas: number
  estado: ReservationEstado
  notas: string | null
  canal: ReservationCanal
  recordatorio_24h: boolean
  recordatorio_2h: boolean
  created_at: string
  updated_at: string
  // Joins opcionales
  customers?: Pick<Customer, 'nombre' | 'telefono'>
  tables?: Pick<Table, 'nombre' | 'zona'>
}

export interface Event {
  id: string
  business_id: string
  titulo: string
  descripcion: string | null
  fecha_inicio: string
  fecha_fin: string
  activo: boolean
  created_at: string
}
