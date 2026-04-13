export default function Home() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Tramabook
        </h1>
        <p className="text-xl text-gray-500 mb-8">
          Convierte tus fotos de viaje en libros interactivos con IA
        </p>
        <button className="bg-black text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-800 transition-colors">
          Crear mi primer libro
        </button>
      </div>
    </main>
  )
}