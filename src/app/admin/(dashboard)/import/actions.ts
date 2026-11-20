"use server";
import { revalidatePath } from "next/cache";
import { runImport, type ImportSummary } from "@/server/import/run";

export async function uploadImport(formData: FormData): Promise<ImportSummary> {
  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error("Файл не выбран");
  const text = await file.text();
  const summary = await runImport(text, file.name, "admin");
  revalidatePath("/admin/import");
  revalidatePath("/admin/products");
  revalidatePath("/admin");
  return summary;
}
