"use client";
import { useState, useEffect, useRef } from "react";

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

type Template = "grande" | "lateral" | "inmersiva";

type BookPageProps = {
  photo: PhotoResult;
  preview: string;
  pageNumber: number;
  template: Template;
};

function detectOrientation(src: string, cb: (o: "horizontal" | "vertical" | "square") => void) {
  const img = new Image();
  img.onload = () => {
    const ratio = img.width / img.height;
    if (ratio > 1.2) cb("horizontal");
    else if (ratio < 0.85) cb("vertical");
    else cb("square");
  };
  img.src = src;
}

function autoTemplate(orientation: "horizontal" | "vertical" | "square"): Template {
  if (orientation === "horizontal") return "grande";
  if (orientation === "vertical") return "lateral";
  return "inmersiva";
}

const TEMPLATE_LABELS: Record<Template, string> = {
  grande: "Grande",
  lateral: "Lateral",
  inmersiva: "Inmersiva",
};

export function BookPage({ photo, preview, pageNumber, template: initialTemplate }: BookPageProps) {
  const [editing, setEditing] = useState(false);
  const [caption, setCaption] = useState(photo.caption || "");
  const [curiosity, setCuriosity] = useState(photo.curiosity || "");
  const [placeName, setPlaceName] = useState(photo.place_name || "");
  const [template, setTemplate] = useState<Template>(initialTemplate);
  const [showLayoutPicker, setShowLayoutPicker] = useState(false);
  const [orientation, setOrientation] = useState<"horizontal" | "vertical" | "square">("horizontal");

  useEffect(() => {
    detectOrientation(preview, (o) => {
      setOrientation(o);
      setTemplate(autoTemplate(o));
    });
  }, [preview]);

  const EditButton = ({ light = false }: { light?: boolean }) => (
    <button
      onClick={() => setEditing(!editing)}
      className={`text-xs border px-3 py-1 rounded-full transition-colors ${
        light
          ? "text-white/70 hover:text-white border-white/30"
          : "text-gray-400 hover:text-gray-600 border-gray-200"
      }`}
    >
      {editing ? "Guardar" : "✎ Editar"}
    </button>
  );

  const LayoutPicker = ({ light = false }: { light?: boolean }) => (
    <div className="relative">
      <button
        onClick={() => setShowLayoutPicker(!showLayoutPicker)}
        className={`text-xs border px-3 py-1 rounded-full transition-colors ${
          light
            ? "text-white/70 hover:text-white border-white/30"
            : "text-gray-400 hover:text-gray-600 border-gray-200"
        }`}
      >
        ⊞ Layout
      </button>
      {showLayoutPicker && (
        <div className="absolute right-0 top-8 bg-white border border-gray-100 rounded-xl shadow-lg z-10 overflow-hidden">
          {(["grande", "lateral", "inmersiva"] as Template[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTemplate(t); setShowLayoutPicker(false); }}
              className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                template === t ? "font-semibold text-gray-900" : "text-gray-600"
              }`}
            >
              {template === t ? "✓ " : "  "}{TEMPLATE_LABELS[t]}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  if (template === "grande") {
    return (
      <div className="border border-gray-100 rounded-2xl overflow-hidden">
        <img src={preview} className="w-full h-72 object-cover" />
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-2xl flex-shrink-0">{photo.emoji}</span>
              {editing ? (
                <input
                  value={placeName}
                  onChange={(e) => setPlaceName(e.target.value)}
                  className="text-xl font-semibold border-b border-gray-300 outline-none flex-1"
                />
              ) : (
                <h3 className="text-xl font-semibold text-gray-900 truncate">{placeName}</h3>
              )}
              {photo.country && <span className="text-gray-400 text-sm flex-shrink-0">{photo.country}</span>}
            </div>
            <div className="flex gap-2 ml-3 flex-shrink-0">
              <LayoutPicker />
              <EditButton />
            </div>
          </div>
          {caption && (
            editing ? (
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full text-gray-700 italic border border-gray-200 rounded-xl p-3 outline-none text-sm mb-3"
                rows={2}
              />
            ) : (
              <p className="text-gray-700 italic mb-3">"{caption}"</p>
            )
          )}
          {curiosity && orientation === "horizontal" && (
            editing ? (
              <textarea
                value={curiosity}
                onChange={(e) => setCuriosity(e.target.value)}
                className="w-full text-gray-500 text-sm border border-gray-200 rounded-xl p-3 outline-none"
                rows={2}
              />
            ) : (
              <p className="text-gray-500 text-sm">✨ {curiosity}</p>
            )
          )}
        </div>
      </div>
    );
  }

  if (template === "lateral") {
    return (
      <div className="border border-gray-100 rounded-2xl overflow-hidden flex">
        <img src={preview} className="w-2/5 object-cover" style={{ minHeight: "280px" }} />
        <div className="flex-1 p-6 flex flex-col justify-center">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-xl flex-shrink-0">{photo.emoji}</span>
              {editing ? (
                <input
                  value={placeName}
                  onChange={(e) => setPlaceName(e.target.value)}
                  className="text-lg font-semibold border-b border-gray-300 outline-none w-full"
                />
              ) : (
                <h3 className="text-lg font-semibold text-gray-900">{placeName}</h3>
              )}
            </div>
            <div className="flex gap-2 ml-2 flex-shrink-0">
              <LayoutPicker />
              <EditButton />
            </div>
          </div>
          {photo.country && <span className="text-gray-400 text-xs mb-3">{photo.country}</span>}
          {caption && (
            editing ? (
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full text-gray-700 italic border border-gray-200 rounded-xl p-2 outline-none text-sm mb-2"
                rows={3}
              />
            ) : (
              <p className="text-gray-700 italic text-sm mb-3">"{caption}"</p>
            )
          )}
          {curiosity && (
            editing ? (
              <textarea
                value={curiosity}
                onChange={(e) => setCuriosity(e.target.value)}
                className="w-full text-gray-500 text-xs border border-gray-200 rounded-xl p-2 outline-none"
                rows={3}
              />
            ) : (
              <p className="text-gray-500 text-xs">✨ {curiosity}</p>
            )
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden" style={{ minHeight: "320px" }}>
      <img src={preview} className="w-full h-full object-cover absolute inset-0" style={{ minHeight: "320px" }} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">{photo.emoji}</span>
            <h3 className="text-lg font-semibold">{placeName}</h3>
            {photo.country && <span className="text-white/60 text-xs">{photo.country}</span>}
          </div>
          <div className="flex gap-2">
            <LayoutPicker light />
            <EditButton light />
          </div>
        </div>
        {caption && (
          editing ? (
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full text-white bg-white/20 border border-white/30 rounded-xl p-2 outline-none text-sm mb-2"
              rows={2}
            />
          ) : (
            <p className="text-white/90 italic text-sm mb-2">"{caption}"</p>
          )
        )}
        {curiosity && orientation === "square" && (
          editing ? (
            <textarea
              value={curiosity}
              onChange={(e) => setCuriosity(e.target.value)}
              className="w-full text-white/80 bg-white/10 border border-white/20 rounded-xl p-2 outline-none text-xs"
              rows={2}
            />
          ) : (
            <p className="text-white/70 text-xs">✨ {curiosity}</p>
          )
        )}
      </div>
    </div>
  );
}