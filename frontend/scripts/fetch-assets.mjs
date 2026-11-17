// Downloads the files the emulator needs into public/v86/.
// Runs automatically before `npm run dev` and `npm run build`; skips files already present.
import { mkdir, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "v86");

const assets = [
  ["seabios.bin", "https://raw.githubusercontent.com/copy/v86/master/bios/seabios.bin"],
  ["vgabios.bin", "https://raw.githubusercontent.com/copy/v86/master/bios/vgabios.bin"],
  // Buildroot Linux kernel + root filesystem published by the v86 project (~10 MB).
  ["linux.bin", "https://i.copy.sh/buildroot-bzimage68.bin"],
];

await mkdir(outDir, { recursive: true });

for (const [name, url] of assets) {
  const file = join(outDir, name);
  if (await stat(file).then((s) => s.size > 0, () => false)) continue;

  console.log(`Downloading ${name} ...`);
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`Failed to download ${url}: HTTP ${res.status}`);
    process.exit(1);
  }
  await writeFile(file, Buffer.from(await res.arrayBuffer()));
}
