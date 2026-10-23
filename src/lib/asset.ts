// Prefixes public/ paths with the deploy base path (e.g. "/cupofhope" on GitHub Pages).
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function asset(path: string) {
  return path.startsWith("/") ? `${basePath}${path}` : path;
}
