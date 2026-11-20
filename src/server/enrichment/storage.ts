import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Черновые AI-иллюстрации складываются в public/uploads/enrichment/ — тот
 * же каталог, который scripts/deploy.sh уже создаёт на сервере
 * (mkdir -p var public/uploads) и исключает из rsync --delete, так что
 * сгенерированные файлы не теряются между деплоями.
 */
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "enrichment");

export async function saveDraftImage(draftId: string, bytes: Buffer): Promise<string> {
  await mkdir(UPLOAD_DIR, { recursive: true });
  const filename = `${draftId}.png`;
  await writeFile(path.join(UPLOAD_DIR, filename), bytes);
  return `/uploads/enrichment/${filename}`;
}
