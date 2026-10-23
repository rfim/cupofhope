// Resizes an uploaded photo in the browser and returns it as base64 WebP, ready to commit.

const MAX_SIDE = 1600;
const MAX_BYTES = 15 * 1024 * 1024;

export async function prepareImage(file: File): Promise<{ base64: string; previewUrl: string; ext: string }> {
  if (!file.type.startsWith("image/")) throw new Error("File harus berupa gambar.");
  if (file.size > MAX_BYTES) throw new Error("Gambar terlalu besar (maks. 15 MB).");

  // SVGs and GIFs are kept as-is so they stay crisp / animated.
  if (file.type === "image/svg+xml" || file.type === "image/gif") {
    const buf = new Uint8Array(await file.arrayBuffer());
    let binary = "";
    for (let i = 0; i < buf.length; i += 0x8000) binary += String.fromCharCode(...buf.subarray(i, i + 0x8000));
    return { base64: btoa(binary), previewUrl: URL.createObjectURL(file), ext: file.type === "image/gif" ? "gif" : "svg" };
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Gagal memproses gambar."))), "image/webp", 0.85),
  );
  const dataUrl = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
  return { base64: dataUrl.split(",")[1], previewUrl: URL.createObjectURL(blob), ext: "webp" };
}

export function uploadPath(fileName: string, ext: string) {
  const base = fileName.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "image";
  return `/images/uploads/${Date.now().toString(36)}-${base}.${ext}`;
}
