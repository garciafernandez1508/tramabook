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
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const PAD = 70;

    ctx.clearRect(0, 0, W, H);

    const bg = dark ? "#111" : "#fff";
    const lineColor = dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)";
    const dotColor = dark ? "#fff" : "#111";
    const dotBorder = dark ? "#111" : "#fff";
    const textColor = dark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.65)";

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Filtrar puntos válidos — sin null ni undefined
    const validPoints = points.filter(p =>
      p && typeof p.lat === "number" && typeof p.lng === "number" &&
      p.name && p.name !== "null" && p.name !== "undefined"
    );

    if (validPoints.length === 0) {
      ctx.font = "13px sans-serif";
      ctx.fillStyle = textColor;
      ctx.textAlign = "center";
      ctx.fillText("Sin ubicaciones GPS", W / 2, H / 2);
      return;
    }

    if (validPoints.length === 1) {
      const p = validPoints[0];
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, 7, 0, Math.PI * 2);
      ctx.fillStyle = dotColor;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, 7, 0, Math.PI * 2);
      ctx.strokeStyle = dotBorder;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.font = "12px sans-serif";
      ctx.fillStyle = textColor;
      ctx.textAlign = "center";
      ctx.fillText(`${p.emoji || "📍"} ${p.name.split(",")[0]}`, W / 2, H / 2 + 24);
      return;
    }

    const lats = validPoints.map(p => p.lat);
    const lngs = validPoints.map(p => p.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const rangeX = maxLng - minLng || 0.01;
    const rangeY = maxLat - minLat || 0.01;
    const aspect = rangeX / rangeY;

    // Ajustar padding según aspect ratio
    const padX = aspect > 2 ? PAD * 0.6 : PAD;
    const padY = aspect < 0.5 ? PAD * 0.6 : PAD;

    function project(lat: number, lng: number): [number, number] {
      const x = padX + ((lng - minLng) / rangeX) * (W - padX * 2);
      const y = H - padY - ((lat - minLat) / rangeY) * (H - padY * 2);
      return [x, y];
    }

    const projected = validPoints.map(p => project(p.lat, p.lng));

    // Dibujar línea punteada
    ctx.beginPath();
    ctx.moveTo(projected[0][0], projected[0][1]);
    for (let i = 1; i < projected.length; i++) {
      const [x1, y1] = projected[i - 1];
      const [x2, y2] = projected[i];
      const cx = (x1 + x2) / 2;
      const cy = (y1 + y2) / 2;
      ctx.quadraticCurveTo(x1, y1, cx, cy);
    }
    ctx.lineTo(projected[projected.length - 1][0], projected[projected.length - 1][1]);
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Calcular posiciones de etiquetas sin solapamiento
    const labelPositions: Array<{ x: number; y: number; above: boolean }> = [];

    projected.forEach(([x, y], i) => {
      // Determinar si la etiqueta va arriba o abajo según posición relativa
      let above = y > H * 0.5;

      // Evitar solapamiento con etiquetas anteriores
      for (const prev of labelPositions) {
        const dx = Math.abs(prev.x - x);
        const dy = Math.abs(prev.y - y);
        if (dx < 80 && dy < 30) {
          above = !prev.above;
          break;
        }
      }
      labelPositions.push({ x, y, above });
    });

    // Dibujar puntos y etiquetas
    projected.forEach(([x, y], i) => {
      // Punto con borde
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = dotColor;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.strokeStyle = dotBorder;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Etiqueta
      const { above } = labelPositions[i];
      const label = `${validPoints[i].emoji || "📍"} ${validPoints[i].name.split(",")[0]}`;
      const labelY = above ? y - 14 : y + 22;

      // Fondo para legibilidad
      ctx.font = "11px sans-serif";
      const metrics = ctx.measureText(label);
      const lw = metrics.width + 8;
      const lh = 16;
      const lx = Math.max(4, Math.min(W - lw - 4, x - lw / 2));
      const ly = above ? labelY - lh + 2 : labelY - 13;

      ctx.fillStyle = dark ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.85)";
      ctx.beginPath();
      ctx.roundRect(lx, ly, lw, lh, 4);
      ctx.fill();

      ctx.fillStyle = textColor;
      ctx.textAlign = "center";
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