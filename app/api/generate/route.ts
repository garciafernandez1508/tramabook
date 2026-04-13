import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(request: Request) {
  const { location, mode } = await request.json();

  const prompt = mode === "plan"
    ? `Eres un experto fotógrafo y viajero. Para el destino "${location}" dame los 5 lugares más impresionantes para fotografiar.
    
Responde ÚNICAMENTE con un JSON válido, sin texto antes ni después, sin markdown, sin bloques de código. Solo el JSON puro:
{
  "places": [
    {
      "name": "nombre del lugar",
      "photo_tip": "consejo para fotografiarlo",
      "best_time": "mejor momento del día",
      "curiosity": "curiosidad única",
      "emoji": "emoji representativo",
      "lat": latitud en número decimal,
      "lng": longitud en número decimal
    }
  ]
}`
    : `Genera una curiosidad interesante y breve sobre ${location}. Máximo 3 frases, en español.`;

  const message = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";

  if (mode === "plan") {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
      return Response.json(parsed);
    } catch {
      return Response.json({ error: "Error procesando respuesta", raw: text }, { status: 500 });
    }
  }

  return Response.json({ curiosity: text });
}