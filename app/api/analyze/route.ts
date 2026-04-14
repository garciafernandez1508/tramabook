import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(request: Request) {
  const { photos, organize } = await request.json();

  const prompt = `Eres un experto en viajes y fotografía. El usuario ha compartido fotos de su viaje.

Datos de las fotos:
${photos.map((p: { name: string; lat?: number; lng?: number; date?: string }, i: number) =>
  `Foto ${i + 1}: ${p.name} ${p.lat ? `(GPS: lat ${p.lat}, lng ${p.lng})` : "(sin GPS)"} ${p.date ? `(fecha: ${p.date})` : ""}`
).join("\n")}

Organización solicitada: ${organize === "date" ? "por día" : organize === "place" ? "por lugar" : "la que consideres mejor"}

INSTRUCCIONES IMPORTANTES:
- Si la foto TIENE coordenadas GPS, identifica el lugar exacto y genera una curiosidad real sobre ese lugar
- Si la foto NO tiene GPS, pon place_name como null y solo genera un caption poético sobre lo que podría verse
- Nunca inventes una localización si no hay GPS
- El título y resumen deben basarse solo en las fotos con GPS conocido

Responde ÚNICAMENTE con JSON puro:
{
  "title": "título evocador del viaje",
  "summary": "resumen breve del viaje",
  "photos": [
    {
      "index": 0,
      "place_name": "nombre del lugar o null si no hay GPS",
      "country": "país o null",
      "curiosity": "curiosidad real del lugar o null si no hay GPS",
      "caption": "pie de foto poético",
      "emoji": "emoji representativo",
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
    return Response.json(parsed);
  } catch {
    return Response.json({ error: "Error procesando respuesta" }, { status: 500 });
  }
}