export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  const { messages, system } = req.body || {};
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content || '' }]
  }));

  const models = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-pro'];
  let lastError = null;

  for (const model of models) {
    try {
      const body = {
        contents,
        generationConfig: { maxOutputTokens: 500, temperature: 0.7 }
      };
      if (system) {
        body.system_instruction = { parts: [{ text: system }] };
      }
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      );
      const data = await response.json();
      if (!response.ok) { lastError = data.error?.message; continue; }
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text
        || "Je suis disponible pour répondre à vos questions !";
      return res.status(200).json({ reply });
    } catch (err) {
      lastError = err.message;
      continue;
    }
  }

  return res.status(500).json({ error: lastError || 'Service unavailable' });
}
