import sharp from "sharp";
import { BodyError } from "./bounded-body";

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const formats = {
  jpeg: { mime: "image/jpeg", ext: "jpg", extensions: ["jpg", "jpeg"] },
  png: { mime: "image/png", ext: "png", extensions: ["png"] },
  webp: { mime: "image/webp", ext: "webp", extensions: ["webp"] },
  gif: { mime: "image/gif", ext: "gif", extensions: ["gif"] },
};

export async function validateUpload(file: File) {
  if (!file.size || file.size > MAX_UPLOAD_BYTES) throw new BodyError("0바이트를 초과하는 4MB 이하 이미지를 선택해주세요.", 413);
  const bytes = Buffer.from(await file.arrayBuffer());
  try {
    const image = sharp(bytes, { animated: true, limitInputPixels: 40_000_000, failOn: "warning" });
    const meta = await image.metadata();
    if (!meta.format || !(meta.format in formats)) throw new BodyError("JPG, PNG, WebP, GIF 이미지만 업로드할 수 있습니다.", 415);
    const format = meta.format as keyof typeof formats;
    const expected = formats[format];
    const extension = file.name.includes(".") ? file.name.split(".").pop()!.toLowerCase() : "";
    if ((file.type && file.type !== expected.mime) || (extension && !expected.extensions.includes(extension))) {
      throw new BodyError("파일 확장자·형식이 실제 이미지와 일치하지 않습니다.", 415);
    }
    if (!meta.width || !meta.height || meta.width * meta.height > 40_000_000 || (meta.pages ?? 1) > 200) {
      throw new BodyError("이미지 해상도나 프레임 수가 너무 큽니다.", 413);
    }
    // Fully decode/re-encode; strip metadata and trailing embedded payloads.
    const data = await image.toFormat(format).toBuffer();
    if (data.byteLength > MAX_UPLOAD_BYTES) throw new BodyError("처리된 이미지가 4MB를 초과합니다.", 413);
    return { data, contentType: expected.mime, extension: expected.ext };
  } catch (error) {
    if (error instanceof BodyError) throw error;
    throw new BodyError("손상되었거나 지원하지 않는 이미지입니다.", 415);
  }
}
