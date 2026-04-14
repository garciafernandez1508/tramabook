"use client";
import { useEffect, useRef } from "react";

type Point = {
  lat: number;
  lng: number;
  name: string;
  emoji: string;
};

type TravelMapProps = {
  points: Point[];
  dark?: boolean;
};

export function TravelMap({ points, dark = false }: TravelMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || points.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const PAD = 60;

    ctx.clearRect(0, 0, W, H);

    const bg = dark ? "#111" : "#fff";
    const lineColor = dark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.12)";
    const dotColor = dark ? "#fff" : "#111";
    const textColor = dark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.7)";

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    if (points.length < 2) {
      const p = points[0];
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, 6, 0, Math.PI * 2);
      ctx.fillStyle = dotColor;
      ctx.fill();
      ctx.font = "13px sans-serif";
      ctx.fillStyle = textColor;
      ctx.textAlign = "center";
      ctx.fillText(`${p.emoji} ${p.name}`, W / 2, H / 2 + 22);
      return;
    }

    const lats = points.map(p => p.lat);
    const lngs = points.map(p => p.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    function project(lat: number, lng: number): [number, number] {
      const rangeX = maxLng - minLng || 0.01;
      const rangeY = maxLat - minLat || 0.01;
      const x = PAD + ((lng - minLng) / rangeX) * (W - PAD * 2);
      const y = H - PAD - ((lat - minLat) / rangeY) * (H - PAD * 2);
      return [x, y];
    }

    const projected = points.map(p => project(p.lat, p.lng));

    ctx.beginPath();
    ctx.moveTo(projected[0][0], projected[0][1]);
    for (let i = 1; i < projected.length; i++) {
      const [x1, y1] = projected[i - 1];
      const [x2, y2] = projected[i];
      const cx = (x1 + x2) / 2;
      const cy = (y1 + y2) / 2;
      ctx.quadraticCurveTo(x1, y1, cx, cy);
    }
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    projected.forEach(([x, y], i) => {
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = dotColor;
      ctx.fill();

      ctx.font = "11px sans-serif";
      ctx.fillStyle = textColor;
      ctx.textAlign = "center";
      const label = `${points[i].emoji} ${points[i].name.split(",")[0]}`;
      const labelY = y > H / 2 ? y - 14 : y + 20;
      ctx.fillText(label, x, labelY);
    });

  }, [points, dark]);

  return (
    <canvas
      ref={canvasRef}
      width={360}
      height={540}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}