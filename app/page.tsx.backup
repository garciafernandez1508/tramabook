"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import exifr from "exifr";

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

type PhotoResult = {
  index: number;
  place_name: string;
  country: string;
  curiosity: string;
  caption: string;
  emoji: string;
  lat: number;
  lng: number;
};

type BookResult = {
  title: string;
  summary: string;
  photos: PhotoResult[];
};

export default function Home() {
  const [mode, setMode] = useState<"home" | "plan" | "book">("home");
  const [location, setLocation] = useState("");
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [book, setBook] = useState<BookResult | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  async function generatePlan() {
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

  async function handleFiles(selected: FileList) {
    const arr = Array.from(selected);
    setFiles(arr);
    setPreviews(arr.map((f) => URL.createObjectURL(f)));
  }

  async function generateBook() {
    if (files.length === 0) return;
    setLoading(true);
    setBook(null);
    try {
      const photosData = await Promise.all(
        files.map(async (f) => {
          try {
            const gps = await exifr.gps(f);
            return { name: f.name, lat: gps?.latitude, lng: gps?.longitude };
          } catch {
            return { name: f.name };
          }
        })
      );
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photos: photosData }),
      });
      const data = await res.json();
      setBook(data);
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
          <p className="text-xl text-gray-500 mb-8">
            Tu compañero de viaje con IA
          </p>
          {mode === "home" && (
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setMode("plan")}
                className="bg-black text-white px-8 py-4 rounded-2xl text-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Voy a viajar
              </button>
              <button
                onClick={() => setMode("book")}
                className="border border-gray-200 text-gray-800 px-8 py-4 rounded-2xl text-lg font-medium hover:border-gray-400 transition-colors"
              >
                Ya viajé
              </button>
            </div>
          )}
          {mode !== "home" && (
            <button
              onClick={() => { setMode("home"); setPlaces([]); setBook([]  as unknown as BookResult); setFiles([]); setPreviews([]); }}
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              ← Volver
            </button>
          )}
        </div>

        {mode === "plan" && (
          <div>
            <div className="flex gap-3 mb-8">
              <input
                type="text"
                placeholder="¿A dónde viajas? Ej: La Habana, Kioto, Marrakech..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && generatePlan()}
                className="flex-1 border border-gray-200 rounded-2xl px-6 py-4 text-lg outline-none focus:border-gray-400"
              />
              <button
                onClick={generatePlan}
                disabled={loading}
                className="bg-black text-white px-8 py-4 rounded-2xl text-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {loading ? "Buscando..." : "Explorar"}
              </button>
            </div>

            {loading && (
              <div className="text-center py-20">
                <p className="text-gray-400 text-lg">Preparando tu guía de fotografía...</p>
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
                    <div key={i} className="border border-gray-100 rounded-2xl p-6 hover:border-gray-300 transition-colors">
                      <div className="flex items-start gap-4">
                        <span className="text-4xl">{place.emoji}</span>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">{place.name}</h3>
                          <p className="text-gray-500 text-sm mb-3">Mejor momento: {place.best_time}</p>
                          <p className="text-gray-700 mb-2">📷 {place.photo_tip}</p>
                          <p className="text-gray-500 text-sm italic">✨ {place.curiosity}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {mode === "book" && (
          <div>
            <div
              className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center mb-8 hover:border-gray-400 transition-colors cursor-pointer"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
              onClick={() => document.getElementById("fileInput")?.click()}
            >
              <p className="text-gray-400 text-lg mb-2">Arrastra tus fotos aquí</p>
              <p className="text-gray-300 text-sm">o haz clic para seleccionarlas</p>
              <input
                id="fileInput"
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
              />
            </div>

            {previews.length > 0 && (
              <div>
                <div className="grid grid-cols-4 gap-2 mb-6">
                  {previews.map((src, i) => (
                    <img key={i} src={src} className="w-full h-24 object-cover rounded-xl" />
                  ))}
                </div>
                <p className="text-gray-500 text-sm mb-6 text-center">{files.length} fotos seleccionadas</p>
                <button
                  onClick={generateBook}
                  disabled={loading}
                  className="w-full bg-black text-white py-4 rounded-2xl text-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {loading ? "Creando tu libro..." : "Crear mi libro de viaje"}
                </button>
              </div>
            )}

            {loading && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">Claude está analizando tu viaje...</p>
              </div>
            )}

            {book && (
              <div className="mt-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h2>
                <p className="text-gray-500 mb-8">{book.summary}</p>
                {book.photos && book.photos.some(p => p.lat && p.lng) && (
                  <div className="mb-8 rounded-2xl overflow-hidden border border-gray-100">
                    <Map places={book.photos.filter(p => p.lat && p.lng).map(p => ({
                      name: p.place_name,
                      photo_tip: p.caption,
                      best_time: "",
                      curiosity: p.curiosity,
                      emoji: p.emoji,
                      lat: p.lat,
                      lng: p.lng,
                    }))} />
                  </div>
                )}
                <div className="flex flex-col gap-6">
                  {book.photos && book.photos.map((photo, i) => (
                    <div key={i} className="border border-gray-100 rounded-2xl overflow-hidden">
                      {previews[photo.index] && (
                        <img src={previews[photo.index]} className="w-full h-64 object-cover" />
                      )}
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{photo.emoji}</span>
                          <h3 className="text-xl font-semibold text-gray-900">{photo.place_name}</h3>
                          <span className="text-gray-400 text-sm">{photo.country}</span>
                        </div>
                        <p className="text-gray-700 italic mb-3">"{photo.caption}"</p>
                        <p className="text-gray-500 text-sm">✨ {photo.curiosity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}