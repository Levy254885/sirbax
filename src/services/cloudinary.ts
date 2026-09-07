/**
 * Cloudinary upload architecture
 *
 * Client flow:
 * 1. Validate file type/size on client
 * 2. Optionally compress with canvas
 * 3. POST to /api/upload (server signs) OR use unsigned upload preset
 * 4. Receive { secure_url, public_id, width, height, format, bytes }
 * 5. Store metadata in Firestore with the post/profile
 *
 * Never expose CLOUDINARY_API_SECRET in client code.
 */

export interface CloudinaryUploadResult {
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export function cloudinaryUrl(
  publicId: string,
  opts?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
  }
): string {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo";
  const transforms: string[] = [];
  if (opts?.width) transforms.push(`w_${opts.width}`);
  if (opts?.height) transforms.push(`h_${opts.height}`);
  if (opts?.crop) transforms.push(`c_${opts.crop}`);
  transforms.push(`q_${opts?.quality || "auto"}`, "f_auto");
  const t = transforms.join(",");
  return `https://res.cloudinary.com/${cloud}/image/upload/${t}/${publicId}`;
}

export async function uploadImage(
  file: File
): Promise<CloudinaryUploadResult> {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloud || !preset) {
    return {
      publicId: `demo/${Date.now()}`,
      secureUrl: URL.createObjectURL(file),
      width: 800,
      height: 600,
      format: file.type.split("/")[1] || "jpg",
      bytes: file.size,
    };
  }

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", preset);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloud}/image/upload`,
    { method: "POST", body: form }
  );

  if (!res.ok) {
    throw new Error("Image upload failed");
  }

  const data = await res.json();
  return {
    publicId: data.public_id,
    secureUrl: data.secure_url,
    width: data.width,
    height: data.height,
    format: data.format,
    bytes: data.bytes,
  };
}
