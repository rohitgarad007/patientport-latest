export async function openAIChat(
  userText: string,
  history: Array<{ role: "user" | "assistant"; content: string }>,
  options?: { model?: string; temperature?: number }
): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing VITE_OPENAI_API_KEY in .env");
  }

  const model = options?.model ?? "gpt-4o-mini";
  const temperature = options?.temperature ?? 0.7;

  const messages = [
    { role: "system", content: "You are a helpful hospital assistant." },
    ...history,
    { role: "user", content: userText },
  ];

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
    }),
  });

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`OpenAI error: ${res.status} ${t}`);
  }

  const json = await res.json();
  const text =
    json?.choices?.[0]?.message?.content ??
    "Sorry, I couldn't generate a response.";
  return text;
}

export async function openAIChatJSON(
  userText: string,
  history: Array<{ role: "user" | "assistant"; content: string }>,
  options?: { model?: string; temperature?: number }
): Promise<{ intent: "book_appointment" | "hospital_info" | "contact_info" | "none"; confidence?: number; fields?: Record<string, any> }> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    // No key: caller should use mock fallback.
    return { intent: "none", confidence: 0.0, fields: {} };
  }

  const model = options?.model ?? "gpt-4o-mini";
  const temperature = options?.temperature ?? 0.0;

  const system = [
    "You are an assistant that ONLY returns compact JSON.",
    "Allowed intents: book_appointment, hospital_info, contact_info.",
    "If unclear, return intent: \"none\".",
    "Output exactly: {\"intent\":\"...\",\"confidence\":0.0-1.0,\"fields\":{}} with no extra text."
  ].join(" ");

  const messages = [
    { role: "system", content: system },
    ...history,
    { role: "user", content: userText },
  ];

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`OpenAI error: ${res.status} ${t}`);
  }

  const json = await res.json();
  const content: string = json?.choices?.[0]?.message?.content ?? "{}";

  try {
    const parsed = JSON.parse(content);
    const intent = ["book_appointment", "hospital_info", "contact_info"].includes(parsed.intent)
      ? parsed.intent
      : "none";
    return {
      intent,
      confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.0,
      fields: typeof parsed.fields === "object" && parsed.fields ? parsed.fields : {},
    };
  } catch {
    return { intent: "none", confidence: 0.0, fields: {} };
  }
}