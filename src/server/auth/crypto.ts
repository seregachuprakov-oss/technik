import { randomBytes, createHash, timingSafeEqual } from "node:crypto";

export function randomToken(): string {
  return randomBytes(32).toString("base64url");
}
export function sha256Hex(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}
/** Константное по времени сравнение — для сравнения пароля админа из env. */
export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}
