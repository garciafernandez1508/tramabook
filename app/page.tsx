"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import exifr from "exifr";
import { CoverPreview } from "./components/BookCover";
import { BookViewer } from "./components/BookViewer";

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
  destinationCoords?: { lat: number; lng: number } | null;
  destination?: string | null;
};

export default function Home() {
  const [mode, setMode] = useState<"home" | "plan" | "book">("home");
  const [location, setLocation] = useState("");
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [book, setBook] = useState<BookResult | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [organize, setOrganize] = useState<"ai" | "date" | "place">("ai");
  const [destination, setDestination] = useState("");
  const [coverTemplate, setCoverTemplate] = useState<"cine" | "revista" | "minimal">("cine");
  const [bookTitle, setBookTitle] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [step, setStep] = useState<"upload" | "cover" | "book">("upload");
  const [addingMore, setAddingMore] = useState(false);

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
    setFiles(prev => [...prev, ...arr]);
    setPreviews(prev => [...prev, ...arr.map((f) => URL.createObjectURL(f))]);
  }

  function removeFile(index: number) {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  }

  async function addMorePhotos(selected: FileList) {
    const arr = Array.from(selected);
    const newPreviews = arr.map((f) => URL.createObjectURL(f));
    const startIndex = files.length;
    setFiles(prev => [...prev, ...arr]);
    setPreviews(prev => [...prev, ...newPreviews]);
    setAddingMore(true);
    try {
      const photosData = await Promise.all(
        arr.map(async (f) => {
          try {
            const gps = await exifr.gps(f);
            const date = await exifr.parse(f, ["DateTimeOriginal"]);
            return { name: f.name, lat: gps?.latitude, lng: gps?.longitude, date: date?.DateTimeOriginal?.toString() || null };
          } catch {
            return { name: f.name };
          }
        })
      );
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photos: photosData, organize, destination }),
      });
      const data = await res.json();
      const newPhotos = (data.photos || []).map((p: PhotoResult) => ({ ...p, index: startIndex + p.index }));
      setBook(prev => prev ? { ...prev, photos: [...prev.photos, ...newPhotos] } : data);
    } catch (e) {
      console.error(e);
    }
    setAddingMore(false);
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
            const date = await exifr.parse(f, ["DateTimeOriginal"]);
            return { name: f.name, lat: gps?.latitude, lng: gps?.longitude, date: date?.DateTimeOriginal?.toString() || null };
          } catch {
            return { name: f.name };
          }
        })
      );
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photos: photosData, organize, destination }),
      });
      const data = await res.json();
      setBook(data);
      setBookTitle(data.title);
      setStep("cover");
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  function resetAll() {
    setMode("home");
    setPlaces([]);
    setBook(null);
    setFiles([]);
    setPreviews([]);
    setDestination("");
    setStep("upload");
    setBookTitle("");
  }

  return (
    <main className="min-h-screen bg-white px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Tramabook</h1>
          <p className="text-xl text-gray-500 mb-8">Tu compañero de viaje con IA</p>
          {mode === "home" && (
            <div className="flex gap-4 justify-center">
              <button onClick={() => setMode("plan")} className="bg-black text-white px-8 py-4 rounded-2xl text-lg font-medium hover:bg-gray-800 transition-colors">
                Voy a viajar
              </button>
              <button onClick={() => setMode("book")} className="border border-gray-200 text-gray-800 px-8 py-4 rounded-2xl text-lg font-medium hover:border-gray-400 transition-colors">
                Ya viajé
              </button>
            </div>
          )}
          {mode !== "home" && (
            <button onClick={resetAll} className="text-gray-400 hover:text-gray-600 text-sm">← Volver</button>
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
              <button onClick={generatePlan} disabled={loading} className="bg-black text-white px-8 py-4 rounded-2xl text-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 whitespace-nowrap">
                {loading ? "Buscando..." : "Explorar"}
              </button>
            </div>
            {loading && <div className="text-center py-20"><p className="text-gray-400 text-lg">Preparando tu guía de fotografía...</p></div>}
            {places.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Los 5 mejores lugares para fotografiar en {location}</h2>
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

        {mode === "book" && step === "upload" && (
          <div>
            <div className="mb-6">
              <input
                type="text"
                placeholder="¿Dónde fue este viaje? Ej: Móstoles, Madrid (opcional)"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full border border-gray-200 rounded-2xl px-6 py-4 text-lg outline-none focus:border-gray-400"
              />
            </div>
            <div
              className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center mb-6 hover:border-gray-400 transition-colors cursor-pointer"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
              onClick={() => document.getElementById("fileInput")?.click()}
            >
              <p className="text-gray-400 text-lg mb-1">Arrastra tus fotos aquí</p>
              <p className="text-gray-300 text-sm mb-3">o haz clic para seleccionarlas</p>
              {files.length > 0 && <p className="text-gray-500 text-sm font-medium">{files.length} fotos seleccionadas</p>}
              <input id="fileInput" type="file" multiple accept="image/*" className="hidden" onChange={(e) => e.target.files && handleFiles(e.target.files)} />
            </div>

            {previews.length > 0 && !loading && (
              <div>
                <div className="grid grid-cols-4 gap-2 mb-6">
                  {previews.map((src, i) => (
                    <div key={i} className="relative group">
                      <img src={src} className="w-full h-24 object-cover rounded-xl" />
                      <button
                        onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >✕</button>
                    </div>
                  ))}
                </div>
                <div className="mb-6">
                  <p className="text-gray-600 text-sm font-medium mb-3">Organizar el libro por:</p>
                  <div className="flex gap-3">
                    {[{ value: "ai", label: "IA decide" }, { value: "date", label: "Por día" }, { value: "place", label: "Por lugar" }].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setOrganize(opt.value as "ai" | "date" | "place")}
                        className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${organize === opt.value ? "bg-black text-white" : "border border-gray-200 text-gray-600 hover:border-gray-400"}`}
                      >{opt.label}</button>
                    ))}
                  </div>
                </div>
                <button onClick={generateBook} disabled={loading} className="w-full bg-black text-white py-4 rounded-2xl text-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50">
                  Crear mi libro de viaje
                </button>
              </div>
            )}
            {loading && (
              <div className="text-center py-20">
                <p className="text-gray-400 text-lg">Tramabook está creando tu libro...</p>
              </div>
            )}
          </div>
        )}

        {mode === "book" && step === "cover" && book && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Elige la portada de tu libro</h2>
            <p className="text-gray-400 text-sm mb-8">Selecciona el estilo que más te gusta</p>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {(["cine", "revista", "minimal"] as const).map((t) => (
                <CoverPreview key={t} template={t} title={bookTitle} summary={book.summary} coverImage={previews[0]} date={new Date().getFullYear().toString()} selected={coverTemplate === t} onClick={() => setCoverTemplate(t)} />
              ))}
            </div>
            <div className="mb-6">
              <p className="text-gray-600 text-sm font-medium mb-2">Título del libro:</p>
              <div className="flex gap-3">
                {editingTitle ? (
                  <input value={bookTitle} onChange={(e) => setBookTitle(e.target.value)} className="flex-1 border border-gray-300 rounded-2xl px-6 py-3 text-lg outline-none focus:border-gray-500" />
                ) : (
                  <p className="flex-1 px-6 py-3 bg-gray-50 rounded-2xl text-lg text-gray-800">{bookTitle}</p>
                )}
                <button onClick={() => setEditingTitle(!editingTitle)} className="border border-gray-200 px-5 py-3 rounded-2xl text-sm hover:border-gray-400 transition-colors">
                  {editingTitle ? "Guardar" : "Editar"}
                </button>
              </div>
            </div>
            <button onClick={() => setStep("book")} className="w-full bg-black text-white py-4 rounded-2xl text-lg font-medium hover:bg-gray-800 transition-colors">
              Ver mi libro completo →
            </button>
          </div>
        )}

        {mode === "book" && step === "book" && book && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <button onClick={() => setStep("cover")} className="text-gray-400 hover:text-gray-600 text-sm">← Cambiar portada</button>
              <button
                onClick={() => document.getElementById("addMoreInput")?.click()}
                disabled={addingMore}
                className="border border-gray-200 text-gray-600 px-5 py-2 rounded-full text-sm hover:border-gray-400 transition-colors disabled:opacity-50"
              >
                {addingMore ? "Analizando..." : "+ Añadir fotos"}
              </button>
              <input id="addMoreInput" type="file" multiple accept="image/*" className="hidden" onChange={(e) => e.target.files && addMorePhotos(e.target.files)} />
            </div>

            {addingMore && <div className="text-center py-4 mb-6"><p className="text-gray-400 text-sm">Tramabook está añadiendo tus fotos...</p></div>}

            <BookViewer
              photos={book.photos}
              previews={previews}
              title={bookTitle}
              summary={book.summary}
              coverImage={previews[0]}
              coverTemplate={coverTemplate}
              destinationCoords={book.destinationCoords}
              destination={book.destination}
            />

            <div className="mt-8 text-center">
              <button className="bg-black text-white px-10 py-4 rounded-full text-lg font-medium hover:bg-gray-800 transition-colors">
                Compartir mi libro
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}