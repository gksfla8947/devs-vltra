export class GenerationError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

export async function generateJson(input: unknown, instruction: string, schema: Record<string, unknown>, modelOverride?: string): Promise<unknown> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new GenerationError("서버에 GEMINI_API_KEY 설정이 필요합니다.", 503);
  const model = modelOverride || process.env.GEMINI_MODEL || "gemini-3.8-flash";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      signal: AbortSignal.timeout(25_000),
      cache: "no-store",
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: instruction }] },
        contents: [{ role: "user", parts: [{ text: JSON.stringify(input) }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: schema,
        },
      }),
    },
  );
  if (!response.ok) {
    if (response.status === 429) throw new GenerationError("Gemini 사용량 한도에 도달했습니다. 잠시 후 다시 시도해주세요.", 429);
    if ([400, 401, 403, 404].includes(response.status)) throw new GenerationError("Gemini 키·모델 설정 또는 API 사용 권한을 확인해주세요.", 502);
    throw new GenerationError("Gemini 서비스에 연결하지 못했습니다. 다시 시도해주세요.", 502);
  }
  const data = await response.json();
  const candidate = data.candidates?.[0];
  if (candidate?.finishReason !== "STOP") throw new GenerationError("AI 생성을 완료하지 못했습니다. 본문을 확인하고 다시 시도해주세요.", 502);
  const text = candidate.content?.parts?.filter((part: { text?: string; thought?: boolean }) => !part.thought && typeof part.text === "string").map((part: { text: string }) => part.text).join("");
  return JSON.parse(text || "{}");
}
