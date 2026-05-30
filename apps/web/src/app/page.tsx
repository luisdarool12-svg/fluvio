import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-md text-center">
        <h1 className="text-4xl font-bold mb-4">OptimizaAI</h1>
        <p className="text-gray-600 mb-8">
          Plataforma de reservaciones con IA para restaurantes
        </p>
        <Link
          href="/dashboard"
          className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Ir al Panel
        </Link>
      </div>
    </main>
  )
}
