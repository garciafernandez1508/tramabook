"use client";
import { useState, useRef } from "react";
import { TravelMap } from "./TravelMap";

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

type BookViewerProps = {
  photos: PhotoResult[];
  previews: string[];
  title: string;
  summary: string;
  coverImage: string;
  coverTemplate: "cine" | "revista" | "minimal";
};

type Theme = "light" | "dark";

type Slide =
  | { type: "cover" }
  | { type: "map" }
  | { type: "editorial"; photo: PhotoResult; preview: string }
  | { type: "double"; photos: PhotoResult[]; previews: string[] }
  | { type: "magazine"; photo: PhotoResult; preview: string }
  | { type: "share" };

const LAYOUT_SEQUENCES = [
  ["editorial", "magazine", "double", "editorial", "magazine", "double"],
  ["magazine", "double", "editorial", "magazine", "double", "editorial"],
  ["double", "editorial", "magazine", "double", "editorial", "magazine"],
  ["editorial", "editorial", "double", "magazine", "magazine", "double"],
];

function buildSlides(photos: PhotoResult[], previews: string[], hasMap: boolean, seed = 0): Slide[] {
  const slides: Slide[] = [{ type: "cover" }];
  if (hasMap) slides.push({ type: "map" });

  const valid = photos.filter(p => previews[p.index]);
  const sequence = LAYOUT_SEQUENCES[seed % LAYOUT_SEQUENCES.length];

  let i = 0;
  let seqIdx = 0;
  while (i < valid.length) {
    const remaining = valid.length - i;
    const layout = sequence[seqIdx % sequence.length];

    if (layout === "double" && remaining >= 2) {
      slides.push({ type: "double", photos: valid.slice(i, i + 2), previews: valid.slice(i, i + 2).map(p => previews[p.index]) });
      i += 2;
    } else if (layout === "magazine") {
      slides.push({ type: "magazine", photo: valid[i], preview: previews[valid[i].index] });
      i += 1;
    } else {
      slides.push({ type: "editorial", photo: valid[i], preview: previews[valid[i].index] });
      i += 1;
    }
    seqIdx++;
  }

  slides.push({ type: "share" });
  return slides;
}

function EditableText({ value, onChange, className, multiline }: {
  value: string; onChange: (v: string) => void; className: string; multiline?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  if (editing) {
    return multiline ? (
      <textarea
        autoFocus
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={() => setEditing(false)}
        className={`${className} bg-transparent border-b border-current outline-none resize-none w-full`}
        rows={3}
      />
    ) : (
      <input
        autoFocus
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={() => setEditing(false)}
        className={`${className} bg-transparent border-b border-current outline-none w-full`}
      />
    );
  }
  return (
    <span
      className={`${className} cursor-text border-b border-transparent hover:border-current transition-colors`}
      onClick={() => setEditing(true)}
    >
      {value || "Toca para escribir..."}
    </span>
  );
}

function TextOrImagePanel({ theme, defaultText }: { theme: Theme; defaultText: string }) {
  const [mode, setMode] = useState<"text" | "image">("text");
  const [text, setText] = useState(defaultText);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const muted = theme === "dark" ? "text-white/40" : "text-gray-300";
  const textColor = theme === "dark" ? "text-white/70" : "text-gray-500";
  const border = theme === "dark" ? "border-white/10" : "border-gray-100";

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setImgSrc(URL.createObjectURL(file));
  }

  return (
    <div className={`flex-1 flex flex-col items-center justify-center border ${border} rounded-2xl p-4`}>
      <div className="flex gap-2 mb-3">
        <button onClick={() => setMode("text")} className={`text-xs px-3 py-1 rounded-full border ${mode === "text" ? "bg-gray-800 text-white border-gray-800" : `${muted} border-current`}`}>Texto</button>
        <button onClick={() => setMode("image")} className={`text-xs px-3 py-1 rounded-full border ${mode === "image" ? "bg-gray-800 text-white border-gray-800" : `${muted} border-current`}`}>Foto</button>
      </div>
      {mode === "text" ? (
        <EditableText value={text} onChange={setText} className={`text-sm ${textColor} text-center leading-relaxed`} multiline />
      ) : imgSrc ? (
        <img src={imgSrc} className="w-full h-full object-cover rounded-xl" />
      ) : (
        <label className={`cursor-pointer text-xs ${muted} text-center`}>
          <span>Toca para añadir foto</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
        </label>
      )}
    </div>
  );
}

function CoverSlide({ title, summary, coverImage, template, theme }: {
  title: string; summary: string; coverImage: string;
  template: "cine" | "revista" | "minimal"; theme: Theme;
}) {
  const bg = theme === "dark" ? "bg-black" : "bg-white";
  const text = theme === "dark" ? "text-white" : "text-gray-900";
  const muted = theme === "dark" ? "text-white/50" : "text-gray-400";

  if (template === "cine") {
    return (
      <div className="w-full h-full relative">
        <img src={coverImage} className="w-full h-full object-cover" />
        <div className={`absolute inset-0 ${theme === "dark" ? "bg-black/60" : "bg-black/40"}`} />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-white text-center">
          <p className="text-xs tracking-[0.3em] uppercase opacity-50 mb-4">Tramabook</p>
          <h1 className="text-3xl font-bold leading-tight mb-4">{title}</h1>
          <div className="w-10 h-px bg-white/40 mb-4" />
          <p className="text-sm text-white/70 leading-relaxed">{summary}</p>
        </div>
      </div>
    );
  }

  if (template === "revista") {
    return (
      <div className={`w-full h-full flex flex-col ${bg}`}>
        <div className="flex-[1.6] relative overflow-hidden">
          <img src={coverImage} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 p-6 flex flex-col justify-center">
          <p className={`text-xs tracking-widest uppercase ${muted} mb-2`}>Tramabook</p>
          <h1 className={`text-2xl font-bold ${text} leading-tight mb-3`}>{title}</h1>
          <p className={`text-sm ${muted} leading-relaxed`}>{summary}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full ${bg} flex flex-col p-8`}>
      <p className={`text-xs tracking-widest uppercase ${muted} mb-6 mt-8`}>Tramabook</p>
      <h1 className={`text-4xl font-bold ${text} leading-tight mb-4`}>{title}</h1>
      <div className={`w-8 h-px ${theme === "dark" ? "bg-white/20" : "bg-gray-200"} mb-5`} />
      <p className={`text-sm ${muted} leading-relaxed mb-8`}>{summary}</p>
      <div className="flex-1 rounded-2xl overflow-hidden">
        <img src={coverImage} className="w-full h-full object-cover" />
      </div>
    </div>
  );
}

function MapSlide({ photos, theme }: { photos: PhotoResult[]; theme: Theme }) {
  const validPoints = photos.filter(p => p.lat && p.lng).map(p => ({
    lat: p.lat, lng: p.lng, name: p.place_name, emoji: p.emoji,
  }));
  const bg = theme === "dark" ? "bg-black" : "bg-white";
  const muted = theme === "dark" ? "text-white/40" : "text-gray-400";

  return (
    <div className={`w-full h-full flex flex-col ${bg} p-6`}>
      <p className={`text-xs tracking-widest uppercase ${muted} mb-4`}>Tramabook · Ruta del viaje</p>
      <div className="flex-1 rounded-2xl overflow-hidden">
        <TravelMap points={validPoints} dark={theme === "dark"} />
      </div>
      <p className={`text-xs ${muted} mt-4`}>{validPoints.length} lugares visitados</p>
    </div>
  );
}

function EditorialSlide({ photo, preview, theme }: { photo: PhotoResult; preview: string; theme: Theme }) {
  const [showText, setShowText] = useState(true);
  const [place, setPlace] = useState(photo.place_name || "");
  const [caption, setCaption] = useState(photo.caption || "");
  const [curiosity, setCuriosity] = useState(photo.curiosity || "");
  const bg = theme === "dark" ? "bg-black" : "bg-white";
  const text = theme === "dark" ? "text-white" : "text-gray-900";
  const muted = theme === "dark" ? "text-white/50" : "text-gray-400";
  const borderColor = theme === "dark" ? "border-white/10" : "border-gray-100";

  return (
    <div className={`w-full h-full flex flex-col ${bg} p-5`}>
      <div className={`flex-[1.4] rounded-2xl overflow-hidden border ${borderColor}`}>
        <img src={preview} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 pt-3 flex flex-col justify-center">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs ${muted}`}>toca para editar</span>
          <button onClick={() => setShowText(v => !v)} className={`text-xs ${muted} border border-current px-2 py-0.5 rounded-full`}>
            {showText ? "ocultar" : "personalizar"}
          </button>
        </div>
        {showText ? (
          <>
            {place && (
              <p className={`text-base font-semibold ${text} mb-1`}>
                {photo.emoji} <EditableText value={place} onChange={setPlace} className={`text-base font-semibold ${text}`} />
              </p>
            )}
            {caption && (
              <p className={`text-sm italic ${muted} leading-relaxed mb-2`}>
                "<EditableText value={caption} onChange={setCaption} className={`text-sm italic ${muted}`} multiline />"
              </p>
            )}
            {curiosity && place && (
              <p className={`text-xs ${muted} leading-relaxed`}>
                ✨ <EditableText value={curiosity} onChange={setCuriosity} className={`text-xs ${muted}`} multiline />
              </p>
            )}
          </>
        ) : (
          <TextOrImagePanel theme={theme} defaultText="" />
        )}
      </div>
    </div>
  );
}

function DoubleSlide({ photos, previews, theme }: { photos: PhotoResult[]; previews: string[]; theme: Theme }) {
  const [show, setShow] = useState([true, true]);
  const [places, setPlaces] = useState(photos.map(p => p.place_name || ""));
  const [captions, setCaptions] = useState(photos.map(p => p.caption || ""));
  const bg = theme === "dark" ? "bg-black" : "bg-white";
  const text = theme === "dark" ? "text-white" : "text-gray-900";
  const muted = theme === "dark" ? "text-white/50" : "text-gray-400";

  return (
    <div className={`w-full h-full flex flex-col ${bg} p-4 gap-3`}>
      {previews.map((src, i) => (
        <div key={i} className="flex-1 flex gap-3 items-center">
          <div className="w-1/2 h-full rounded-xl overflow-hidden">
            <img src={src} className="w-full h-full object-cover" />
          </div>
          <div className="w-1/2 h-full flex flex-col justify-center pr-1">
            <div className="flex justify-end mb-1">
              <button onClick={() => setShow(prev => prev.map((v, idx) => idx === i ? !v : v))} className={`text-xs ${muted} border border-current px-1.5 py-0.5 rounded-full`}>
                {show[i] ? "ocultar" : "personalizar"}
              </button>
            </div>
            {show[i] ? (
              <>
                {places[i] && (
                  <p className={`text-sm font-semibold ${text} mb-1 leading-tight`}>
                    {photos[i].emoji} <EditableText value={places[i]} onChange={v => setPlaces(prev => prev.map((p, idx) => idx === i ? v : p))} className={`text-sm font-semibold ${text}`} />
                  </p>
                )}
                {captions[i] && (
                  <p className={`text-xs italic ${muted} leading-relaxed`}>
                    "<EditableText value={captions[i]} onChange={v => setCaptions(prev => prev.map((c, idx) => idx === i ? v : c))} className={`text-xs italic ${muted}`} multiline />"
                  </p>
                )}
              </>
            ) : (
              <TextOrImagePanel theme={theme} defaultText="" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function MagazineSlide({ photo, preview, theme }: { photo: PhotoResult; preview: string; theme: Theme }) {
  const [showText, setShowText] = useState(true);
  const [place, setPlace] = useState(photo.place_name || "");
  const [caption, setCaption] = useState(photo.caption || "");
  const [curiosity, setCuriosity] = useState(photo.curiosity || "");
  const bg = theme === "dark" ? "bg-black" : "bg-white";
  const text = theme === "dark" ? "text-white" : "text-gray-900";
  const muted = theme === "dark" ? "text-white/50" : "text-gray-400";
  const divider = theme === "dark" ? "bg-white/10" : "bg-gray-100";

  return (
    <div className={`w-full h-full flex flex-col ${bg}`}>
      <div className="flex-1 p-6 flex flex-col justify-center">
        <div className="flex items-center justify-between mb-3">
          <p className={`text-xs tracking-widest uppercase ${muted}`}>Tramabook</p>
          <button onClick={() => setShowText(v => !v)} className={`text-xs ${muted} border border-current px-2 py-0.5 rounded-full`}>
            {showText ? "ocultar" : "personalizar"}
          </button>
        </div>
        {showText ? (
          <>
            {place && (
              <h2 className={`text-2xl font-bold ${text} leading-tight mb-3`}>
                {photo.emoji} <EditableText value={place} onChange={setPlace} className={`text-2xl font-bold ${text}`} />
              </h2>
            )}
            <div className={`w-6 h-px ${divider} mb-3`} />
            {caption && (
              <p className={`text-sm italic ${muted} leading-relaxed mb-2`}>
                "<EditableText value={caption} onChange={setCaption} className={`text-sm italic ${muted}`} multiline />"
              </p>
            )}
            {curiosity && place && (
              <p className={`text-xs ${muted} leading-relaxed`}>
                ✨ <EditableText value={curiosity} onChange={setCuriosity} className={`text-xs ${muted}`} multiline />
              </p>
            )}
          </>
        ) : (
          <TextOrImagePanel theme={theme} defaultText="" />
        )}
      </div>
      <div className="flex-[1.2] overflow-hidden">
        <img src={preview} className="w-full h-full object-cover" />
      </div>
    </div>
  );
}

function ShareSlide({ title, theme }: { title: string; theme: Theme }) {
  const bg = theme === "dark" ? "bg-black" : "bg-white";
  const text = theme === "dark" ? "text-white" : "text-gray-900";
  const muted = theme === "dark" ? "text-white/40" : "text-gray-300";
  const border = theme === "dark" ? "border-white/10" : "border-gray-100";

  return (
    <div className={`w-full h-full ${bg} flex flex-col items-center justify-center p-8 text-center`}>
      <p className={`text-xs tracking-widest uppercase ${muted} mb-6`}>Creado con</p>
      <h2 className={`text-4xl font-bold ${text} mb-2`}>Tramabook</h2>
      <p className={`text-sm ${muted} mb-12`}>Tu compañero de viaje con IA</p>
      <div className={`w-full border ${border} rounded-2xl p-4 mb-6`}>
        <p className={`text-xs ${muted} mb-1`}>Este libro</p>
        <p className={`${text} font-medium`}>{title}</p>
      </div>
      <p className={`text-xs ${muted}`}>tramabook.com</p>
    </div>
  );
}

export function BookViewer({ photos, previews, title, summary, coverImage, coverTemplate }: BookViewerProps) {
  const hasMap = photos.some(p => p.lat && p.lng);
  const [seed, setSeed] = useState(0);
  const [slides, setSlides] = useState<Slide[]>(() => buildSlides(photos, previews, hasMap, 0));
  const [current, setCurrent] = useState(0);
  const [theme, setTheme] = useState<Theme>("light");
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const isDragging = useRef(false);

  function regenerate() {
    const newSeed = seed + 1;
    setSeed(newSeed);
    setSlides(buildSlides(photos, previews, hasMap, newSeed));
    setCurrent(0);
  }

  function goNext() { if (current < slides.length - 1) setCurrent(c => c + 1); }
  function goPrev() { if (current > 0) setCurrent(c => c - 1); }

  function handleTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    isDragging.current = false;
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (startX.current === null || startY.current === null) return;
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;
    if (!isDragging.current && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
      isDragging.current = true;
    }
    if (isDragging.current) {
      e.preventDefault();
      setDragOffset(dx);
    }
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (startX.current === null) return;
    const diff = startX.current - e.changedTouches[0].clientX;
    setDragOffset(0);
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
    startX.current = null;
    isDragging.current = false;
  }

  function handleMouseDown(e: React.MouseEvent) {
    startX.current = e.clientX;
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (startX.current === null || e.buttons !== 1) return;
    setDragOffset(e.clientX - startX.current);
  }

  function handleMouseUp(e: React.MouseEvent) {
    if (startX.current === null) return;
    const diff = startX.current - e.clientX;
    setDragOffset(0);
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
    startX.current = null;
  }

  const slide = slides[current];

  return (
    <div className="flex flex-col items-center select-none">
      <div className="flex gap-2 mb-4 flex-wrap justify-center">
        <button onClick={() => setTheme("light")} className={`px-4 py-1.5 rounded-full text-sm transition-colors ${theme === "light" ? "bg-gray-900 text-white" : "border border-gray-200 text-gray-500"}`}>
          Claro
        </button>
        <button onClick={() => setTheme("dark")} className={`px-4 py-1.5 rounded-full text-sm transition-colors ${theme === "dark" ? "bg-gray-900 text-white" : "border border-gray-200 text-gray-500"}`}>
          Oscuro
        </button>
        <button onClick={regenerate} className="px-4 py-1.5 rounded-full text-sm border border-gray-200 text-gray-500 hover:border-gray-400 transition-colors">
          ↺ Nuevo layout
        </button>
      </div>

      <div
        className="relative overflow-hidden rounded-3xl shadow-2xl cursor-grab active:cursor-grabbing"
        style={{
          width: "min(390px, 100%)",
          aspectRatio: "9/16",
          transform: `translateX(${dragOffset * 0.12}px)`,
          transition: dragOffset === 0 ? "transform 0.25s ease" : "none",
          background: theme === "dark" ? "#111" : "#fff",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {slide.type === "cover" && <CoverSlide title={title} summary={summary} coverImage={coverImage} template={coverTemplate} theme={theme} />}
        {slide.type === "map" && <MapSlide photos={photos} theme={theme} />}
        {slide.type === "editorial" && <EditorialSlide photo={slide.photo} preview={slide.preview} theme={theme} />}
        {slide.type === "double" && <DoubleSlide photos={slide.photos} previews={slide.previews} theme={theme} />}
        {slide.type === "magazine" && <MagazineSlide photo={slide.photo} preview={slide.preview} theme={theme} />}
        {slide.type === "share" && <ShareSlide title={title} theme={theme} />}

        <div className="absolute top-3 left-3 right-3 flex gap-1 z-20 pointer-events-none">
          {slides.map((_, i) => (
            <div key={i} className={`flex-1 h-0.5 rounded-full overflow-hidden ${theme === "dark" ? "bg-white/20" : "bg-black/10"}`}>
              <div className={`h-full transition-all duration-300 ${theme === "dark" ? "bg-white" : "bg-black"} ${i <= current ? "w-full" : "w-0"}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}