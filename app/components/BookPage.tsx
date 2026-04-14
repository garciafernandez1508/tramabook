"use client";
import { useState } from "react";

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

type BookPageProps = {
  photo: PhotoResult;
  preview: string;
  pageNumber: number;
  template: "grande" | "lateral" | "inmersiva";
};

export function BookPage({ photo, preview, pageNumber, template }: BookPageProps) {
  const [editing, setEditing] = useState(false);
  const [caption, setCaption] = useState(photo.caption);
  const [curiosity, setCuriosity] = useState(photo.curiosity);
  const [placeName, setPlaceName] = useState(photo.place_name);

  if (template === "grande") {
    return (
      <div className="border border-gray-100 rounded-2xl overflow-hidden">
        <img src={preview} className="w-full h-72 object-cover" />
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{photo.emoji}</span>
              {editing ? (
                <input
                  value={placeName}
                  onChange={(e) => setPlaceName(e.target.value)}
                  className="text-xl font-semibold border-b border-gray-300 outline-none"
                />
              ) : (
                <h3 className="text-xl font-semibold text-gray-900">{placeName}</h3>
              )}
              <span className="text-gray-400 text-sm">{photo.country}</span>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className="text-xs text-gray-400 hover:text-gray-600 border border-gray-200 px-3 py-1 rounded-full"
            >
              {editing ? "Guardar" : "Editar"}
            </button>
          </div>
          {editing ? (
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full text-gray-700 italic border border-gray-200 rounded-xl p-3 outline-none text-sm mb-3"
              rows={2}
            />
          ) : (
            <p className="text-gray-700 italic mb-3">"{caption}"</p>
          )}
          {curiosity && (
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
        <img src={preview} className="w-1/2 h-64 object-cover" />
        <div className="w-1/2 p-6 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">{photo.emoji}</span>
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
            <button
              onClick={() => setEditing(!editing)}
              className="text-xs text-gray-400 hover:text-gray-600 border border-gray-200 px-3 py-1 rounded-full"
            >
              {editing ? "✓" : "✎"}
            </button>
          </div>
          <span className="text-gray-400 text-xs mb-3">{photo.country}</span>
          {editing ? (
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full text-gray-700 italic border border-gray-200 rounded-xl p-2 outline-none text-sm mb-2"
              rows={2}
            />
          ) : (
            <p className="text-gray-700 italic text-sm mb-3">"{caption}"</p>
          )}
          {curiosity && (
            editing ? (
              <textarea
                value={curiosity}
                onChange={(e) => setCuriosity(e.target.value)}
                className="w-full text-gray-500 text-xs border border-gray-200 rounded-xl p-2 outline-none"
                rows={2}
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
    <div className="relative rounded-2xl overflow-hidden h-80">
      <img src={preview} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">{photo.emoji}</span>
            <h3 className="text-lg font-semibold">{placeName}</h3>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className="text-xs text-white/70 hover:text-white border border-white/30 px-3 py-1 rounded-full"
          >
            {editing ? "✓" : "✎"}
          </button>
        </div>
        {editing ? (
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full text-white bg-white/20 border border-white/30 rounded-xl p-2 outline-none text-sm"
            rows={2}
          />
        ) : (
          <p className="text-white/90 italic text-sm">"{caption}"</p>
        )}
      </div>
    </div>
  );
}