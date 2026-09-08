/**
 * Cloudinary image uploads (unsigned preset).
 * Never put CLOUDINARY_API_SECRET in client code.
 * Flow: validate → upload to Cloudinary → save secure_url in Firestore.
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
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dozqfm7t";
  const transforms: string[] = [];
  if (opts?.width) transforms.push(`w_${opts.width}`);
  if (opts?.height) transforms.push(`h_${opts.height}`);
  if (opts?.crop) transforms.push(`c_${opts.crop}`);
  transforms.push(`q_${opts?.quality || "auto"}`, "f_auto");
  return `https://res.cloudinary.com/${cloud}/image/upload/${transforms.join(",")}/${publicId}`;
}

export async function uploadImage(file: File): Promise<CloudinaryUploadResult> {
  const err = validateImageFile(file);
  if (err) throw new Error(err);

  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloud || !preset) {
    throw new Error("Cloudinary is not configured (cloud name / upload preset missing)");
  }

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", preset);
  form.append("folder", "sirbax");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloud}/image/upload`,
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
  return {
    publicId: data.public_id as string,
    secureUrl: data.secure_url as string,
    width: data.width as number,
    height: data.height as number,
    format: data.format as string,
    bytes: data.bytes as number,
  };
}
