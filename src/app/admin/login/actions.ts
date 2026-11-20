"use server";
import { redirect } from "next/navigation";
import { loginAdmin } from "@/server/auth/admin";

export async function loginAction(formData: FormData): Promise<{ error?: string } | void> {
  const password = String(formData.get("password") ?? "");
  const ok = await loginAdmin(password);
  if (!ok) return { error: "Неверный пароль" };
  redirect("/admin");
}
