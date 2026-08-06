const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB decoded

/**
 * Validate a base64 data-URI image before Cloudinary upload.
 * Rejects SVG and non-image payloads (XSS / polyglot risk).
 */
export function validateBase64Image(dataUri) {
  if (typeof dataUri !== "string" || !dataUri.startsWith("data:")) {
    return { ok: false, message: "Image must be a base64 data URI." };
  }

  const match = /^data:(image\/(?:jpeg|png|webp|gif));base64,([A-Za-z0-9+/=\r\n]+)$/i.exec(
    dataUri.trim()
  );

  if (!match) {
    return {
      ok: false,
      message: "Only JPEG, PNG, WebP, or GIF images are allowed.",
    };
  }

  const mime = match[1].toLowerCase();
  if (!ALLOWED_MIME.has(mime)) {
    return { ok: false, message: "Unsupported image type." };
  }

  const base64Body = match[2].replace(/\s/g, "");
  const estimatedBytes = Math.floor((base64Body.length * 3) / 4);

  if (estimatedBytes > MAX_BYTES) {
    return { ok: false, message: "Image exceeds the 5 MB size limit." };
  }

  return { ok: true, mime, dataUri: `data:${mime};base64,${base64Body}` };
}
