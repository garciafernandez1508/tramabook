"use client";
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

type Place = {
  name: string;
  photo_tip: string;
  best_time: string;
  curiosity: string;
  emoji: string;
  lat: number;
  lng: number;
};

export default function Map({ places }: { places: Place[] }) {
  const center = places.length > 0
    ? [places[0].lat, places[0].lng] as [number, number]
    : [20, 0] as [number, number];

  return (
    <MapContainer
      center={center}
      zoom={10}
      style={{ height: "400px", width: "100%", borderRadius: "16px" }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {places.map((place, i) => (
        <Marker key={i} position={[place.lat, place.lng]} icon={icon}>
          <Popup>
            <strong>{place.emoji} {place.name}</strong>
            <br />
            <span style={{ fontSize: "12px" }}>{place.best_time}</span>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}