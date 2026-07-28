const MAX_BYTES = 8 * 1024 * 1024; // 8MB

const SIGNATURES: Array<{ contentType: string; extension: string; matches: (buf: Buffer) => boolean }> = [
  {
    contentType: "image/jpeg",
    extension: "jpg",
    matches: (buf) => buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff,
  },
  {
    contentType: "image/png",
    extension: "png",
    matches: (buf) =>
      buf.length >= 8 &&
      buf[0] === 0x89 &&
      buf[1] === 0x50 &&
      buf[2] === 0x4e &&
      buf[3] === 0x47 &&
      buf[4] === 0x0d &&
      buf[5] === 0x0a &&
      buf[6] === 0x1a &&
      buf[7] === 0x0a,
  },
  {
    contentType: "image/webp",
    extension: "webp",
    matches: (buf) =>
      buf.length >= 12 &&
      buf.subarray(0, 4).toString("ascii") === "RIFF" &&
      buf.subarray(8, 12).toString("ascii") === "WEBP",
  },
  {
    contentType: "image/gif",
    extension: "gif",
    matches: (buf) => {
      const header = buf.subarray(0, 6).toString("ascii");
      return header === "GIF87a" || header === "GIF89a";
    },
  },
];

export type ValidatedImage = {
  contentType: string;
  extension: string;
};

export class InvalidImageError extends Error {}

/**
 * Sniffs the actual file signature rather than trusting the client-declared
 * MIME type/extension — a malicious upload could label anything as
 * "image/png". This is the write-time gate before anything is stored in
 * Cloud Storage or referenced from a public blog post.
 */
export function validateImageBuffer(buffer: Buffer): ValidatedImage {
  if (buffer.byteLength === 0) {
    throw new InvalidImageError("Empty file.");
  }
  if (buffer.byteLength > MAX_BYTES) {
    throw new InvalidImageError(`File exceeds the ${MAX_BYTES / (1024 * 1024)}MB limit.`);
  }

  const match = SIGNATURES.find((sig) => sig.matches(buffer));
  if (!match) {
    throw new InvalidImageError("Unsupported file type. Use JPEG, PNG, WebP, or GIF.");
  }

  return { contentType: match.contentType, extension: match.extension };
}
