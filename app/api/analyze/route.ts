import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

async function geocodeDestination(destination: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destination)}&format=json&limit=1`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Tramabook/1.0" }
    });
    const data = await res.json();
    if (data && data[0]) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
    return null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const { photos, organize, destination } = await request.json();

  let destinationCoords: { lat: number; lng: number } | null = null;
  if (destination) {
    destinationCoords = await geocodeDestination(destination);
  }

  const prompt = `Eres un experto en fotografía y escritura creativa de viajes.

El usuario ha compartido ${photos.length} fotos de su viaje${destination ? ` a ${destination}` : ""}.

Datos de las fotos:
${photos.map((p: { name: string; lat?: number; lng?: number; date?: string }, i: number) =>
  `Foto ${i + 1}: ${p.name} ${p.lat ? `(GPS: lat ${p.lat}, lng ${p.lng})` : "(sin GPS)"} ${p.date ? `(fecha: ${p.date})` : ""}`
).join("\n")}

Organización solicitada: ${organize === "date" ? "por día" : organize === "place" ? "por lugar" : "la que consideres mejor"}

INSTRUCCIONES IMPORTANTES:
- NO identifiques ni nombres el lugar de cada foto
- Solo añade caption a UNA de cada 3 fotos aproximadamente
- El caption debe ser muy corto: máximo 1 frase poética
- Si no hay nada especial que decir de una foto, pon caption como null
- place_name, country y curiosity siempre null
- El título y resumen SÍ pueden mencionar el destino si el usuario lo indicó
- lat y lng: usa los del GPS si existen, si no pon null

Responde ÚNICAMENTE con JSON puro:
{
  "title": "título evocador del viaje",
  "summary": "resumen breve en 1-2 frases",
  "photos": [
    {
      "index": 0,
      "place_name": null,
      "country": null,
      "curiosity": null,
      "caption": "frase poética corta o null",
      "emoji": "emoji del ambiente",
      "lat": numero o null,
      "lng": numero o null
    }
  ]
}`;

  const message = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    
    // Añadir coordenadas del destino al resultado
    return Response.json({
      ...parsed,
      destinationCoords,
      destination: destination || null,
    });
  } catch {
    return Response.json({ error: "Error procesando respuesta" }, { status: 500 });
  }
}