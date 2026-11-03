export class BodyError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

// Content-Length can be missing or forged. Bound the actual stream as well.
export async function readBoundedBody(request: Request, maximum: number): Promise<Uint8Array> {
  if (Number(request.headers.get("content-length")) > maximum) throw new BodyError("요청 용량이 너무 큽니다.", 413);
  const reader = request.body?.getReader();
  if (!reader) throw new BodyError("요청 내용이 없습니다.", 400);
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maximum) {
        await reader.cancel();
        throw new BodyError("요청 용량이 너무 큽니다.", 413);
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const result = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.byteLength; }
  return result;
}
