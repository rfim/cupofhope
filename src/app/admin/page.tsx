import fs from "node:fs";
import path from "node:path";
import AdminApp from "@/admin/AdminApp";
import { site } from "@/data";

// Runs at build time: lists every image in public/images for the admin's image picker.
function imageLibrary() {
  const root = path.join(process.cwd(), "public");
  const walk = (dir: string): string[] =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
      const full = path.join(dir, d.name);
      if (d.isDirectory()) return walk(full);
      return /\.(png|jpe?g|webp|gif|svg)$/i.test(d.name) ? ["/" + path.relative(root, full).split(path.sep).join("/")] : [];
    });
  return walk(path.join(root, "images"))
    .filter((p) => !p.startsWith("/images/favicon/") && !p.startsWith("/images/logos/"))
    .sort((a, b) => Number(b.startsWith("/images/uploads/")) - Number(a.startsWith("/images/uploads/")) || a.localeCompare(b));
}

export default function AdminPage() {
  return <AdminApp initial={site} library={imageLibrary()} />;
}
