import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(request: Request) {
  const { photos } = await request.json();

  const prompt = `Eres un experto en viajes y fotografía. El usuario ha compartido fotos de su viaje con estas ubicaciones GPS y nombres de archivo:

${photos.map((p: { name: string; lat?: number; lng?: number }, i: number) => 
  `Foto ${i + 1}: ${p.name} ${p.lat ? `(lat: ${p.lat}, lng: ${p.lng})` : "(sin GPS)"}`
).join("\n")}

Para cada foto, identifica el lugar más probable y genera contenido para su libro de viaje.

Responde ÚNICAMENTE con JSON puro, sin markdown ni texto extra:
{
  "title": "título evocador del viaje completo",
  "summary": "resumen del viaje en 2-3 frases",
  "photos": [
    {
      "index": 0,
      "place_name": "nombre del lugar identificado",
      "country": "país",
      "curiosity": "curiosidad interesante sobre ese lugar",
      "caption": "pie de foto poético y evocador",
      "emoji": "emoji representativo",
      "lat": latitud,
      "lng": longitud
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