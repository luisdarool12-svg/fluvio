'use client'

export default function DashboardPage() {
  const today = new Date().toLocaleDateString('es-MX', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  return (
    <div className="min-h-screen p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Panel de Reservaciones</h1>
        <p className="text-gray-500 capitalize">{today}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard label="Reservas hoy" value="—" />
        <StatCard label="No-shows del mes" value="—" />
        <StatCard label="Tasa de confirmación" value="—" />
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-4">Reservas de hoy</h2>
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-400">
          Conecta tu cuenta para ver las reservas
        </div>
      </section>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  )
}
