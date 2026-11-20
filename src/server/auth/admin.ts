import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { query, queryOne } from "@/server/db";
import { randomToken, sha256Hex, safeEqual } from "./crypto";

/**
 * Авторизация админки этой фазы — ОДИН пароль владельца из ADMIN_PASSWORD,
 * без таблицы пользователей (в отличие от globus/les). Сессия — случайный
 * токен в httpOnly-куке, хэш токена в admin_sessions, TTL 48 часов скользящим
 * окном (тот же паттерн, что в сиблингах).
 */
export const ADMIN_COOKIE = "tehnik_admin";
const IDLE_HOURS = 48;

export function isHttpsApp(): boolean {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "").startsWith("https://");
}

export async function loginAdmin(password: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !password || !safeEqual(password, expected)) return false;
  const token = randomToken();
  const expiresAt = new Date(Date.now() + IDLE_HOURS * 3600 * 1000);
  await query(`INSERT INTO admin_sessions (token_hash, expires_at) VALUES ($1, $2)`, [sha256Hex(token), expiresAt]);
  const store = await cookies();
  store.set(ADMIN_COOKIE, token, { httpOnly: true, secure: isHttpsApp(), sameSite: "lax", path: "/", expires: expiresAt });
  return true;
}

export async function logoutAdmin(): Promise<void> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (token) await query(`UPDATE admin_sessions SET revoked_at = now() WHERE token_hash = $1`, [sha256Hex(token)]);
  store.delete(ADMIN_COOKIE);
}

export const isAdminAuthenticated = cache(async (): Promise<boolean> => {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  const row = await queryOne<{ id: string }>(
    `SELECT id FROM admin_sessions WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > now()`,
    [sha256Hex(token)],
  );
  if (!row) return false;
  await query(`UPDATE admin_sessions SET expires_at = now() + interval '48 hours' WHERE id = $1`, [row.id]);
  return true;
});

export async function requireAdmin(): Promise<void> {
  const ok = await isAdminAuthenticated();
  if (!ok) redirect("/admin/login");
}
