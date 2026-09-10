/**
 * Cloudinary image uploads (unsigned preset).
 * Flow: validate → upload → store secure_url only in Firebase.
 */

export interface CloudinaryUploadResult {
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const CLOUD =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dozqfm7t";
const PRESET =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "sir_bax";

export function validateImageFile(file: File): string | null {
  if (!ALLOWED.includes(file.type)) {
    return "Only JPEG, PNG, WebP, or GIF images are allowed";
  }
  if (file.size > MAX_BYTES) {
    return "Image must be under 8MB";
  }
  return null;
}

export function cloudinaryUrl(
  publicId: string,
  opts?: { width?: number; height?: number; crop?: string; quality?: string }
): string {
  const transforms: string[] = [];
  if (opts?.width) transforms.push(`w_${opts.width}`);
  if (opts?.height) transforms.push(`h_${opts.height}`);
  if (opts?.crop) transforms.push(`c_${opts.crop}`);
  transforms.push(`q_${opts?.quality || "auto"}`, "f_auto");
  return `https://res.cloudinary.com/${CLOUD}/image/upload/${transforms.join(",")}/${publicId}`;
}

export async function uploadImage(file: File): Promise<CloudinaryUploadResult> {
  const err = validateImageFile(file);
  if (err) throw new Error(err);

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", PRESET);
  form.append("folder", "sirbax");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`,
    { method: "POST", body: form }
  );

  if (!res.ok) {
    let message = "Image upload failed";
    try {
      const body = await res.json();
      if (body?.error?.message) message = body.error.message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  const data = await res.json();
  if (!data.secure_url) {
    throw new Error("Cloudinary did not return a secure URL");
  }

  return {
    publicId: data.public_id as string,
    secureUrl: data.secure_url as string,
    width: (data.width as number) || 0,
    height: (data.height as number) || 0,
    format: (data.format as string) || "jpg",
    bytes: (data.bytes as number) || 0,
  };
}

export async function uploadImages(files: File[]): Promise<CloudinaryUploadResult[]> {
  const out: CloudinaryUploadResult[] = [];
  for (const f of files) {
    out.push(await uploadImage(f));
  }
  return out;
}

/** High-quality display URL — avoids over-compression / blur */
export function displayImageUrl(url: string, width = 1200): string {
  if (!url) return url;
  if (!url.includes("res.cloudinary.com")) return url;
  if (url.includes("/upload/")) {
    return url.replace("/upload/", `/upload/q_auto:good,f_auto,c_limit,w_${width}/`);
  }
  return url;
}
