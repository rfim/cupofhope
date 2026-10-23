import { asset } from "./asset";

// Static export has no image optimizer, so serve the original file from public/.
export default function imageLoader({ src, width }: { src: string; width: number }) {
  return `${asset(src)}?w=${width}`;
}
