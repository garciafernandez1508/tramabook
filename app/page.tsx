"use client";
import { useState } from "react";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("./components/Map"), { ssr: false });

type Place = {
  name: string;
  photo_tip: string;
  best_time: string;
  curiosity: string;
  emoji: string;
  lat: number;
  lng: number;
};

export default function Home() {
  const [location, setLocation] = useState("");
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);

  async function generate() {
    if (!location) return;
    setLoading(true);
    setPlaces([]);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location, mode: "plan" }),
      });
      const data = await res.json();
      setPlaces(data.places || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-white px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Tramabook</h1>
          <p className="text-xl text-gray-500">
            Descubre los mejores lugares para fotografiar en tu próximo viaje
          </p>
        </div>

        <div className="flex gap-3 mb-12">
          <input
            type="text"
            placeholder="¿A dónde viajas? Ej: La Habana, Kioto, Marrakech..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && generate()}
            className="flex-1 border border-gray-200 rounded-2xl px-6 py-4 text-lg outline-none focus:border-gray-400"
          />
          <button
            onClick={generate}
            disabled={loading}
            className="bg-black text-white px-8 py-4 rounded-2xl text-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {loading ? "Buscando..." : "Explorar"}
          </button>
        </div>

        {loading && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">
              Preparando tu guía de fotografía...
            </p>
          </div>
        )}

        {places.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Los 5 mejores lugares para fotografiar en {location}
            </h2>

            <div className="mb-8 rounded-2xl overflow-hidden border border-gray-100">
              <Map places={places} />
            </div>

            <div className="flex flex-col gap-4">
              {places.map((place, i) => (
                <div
                  key={i}
                  className="border border-gray-100 rounded-2xl p-6 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <span className="text-4xl">{place.emoji}</span>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {place.name}
                      </h3>
                      <p className="text-gray-500 text-sm mb-3">
                        Mejor momento: {place.best_time}
                      </p>
                      <p className="text-gray-700 mb-2">
                        📷 {place.photo_tip}
                      </p>
                      <p className="text-gray-500 text-sm italic">
                        ✨ {place.curiosity}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}