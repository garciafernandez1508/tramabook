"use client";
import { useState } from "react";

export default function Home() {
  const [location, setLocation] = useState("");
  const [curiosity, setCuriosity] = useState("");
  const [loading, setLoading] = useState(false);

  async function generate() {
    if (!location) return;
    setLoading(true);
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ location }),
    });
    const data = await res.json();
    setCuriosity(data.curiosity);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">Tramabook</h1>
        <p className="text-xl text-gray-500 mb-8">
          Convierte tus fotos de viaje en libros interactivos con IA
        </p>
        <input
          type="text"
          placeholder="¿Dónde viajaste? Ej: Tokyo, París, Marruecos..."
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full border border-gray-200 rounded-2xl px-6 py-4 text-lg mb-4 outline-none focus:border-gray-400"
        />
        <button
          onClick={generate}
          disabled={loading}
          className="bg-black text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {loading ? "Generando..." : "Crear mi primer libro"}
        </button>
        {curiosity && (
          <div className="mt-8 bg-gray-50 rounded-2xl p-6 text-left">
            <p className="text-sm text-gray-400 mb-2">Curiosidad generada por IA</p>
            <p className="text-gray-800 text-lg leading-relaxed">{curiosity}</p>
          </div>
        )}
      </div>
    </main>
  );
}