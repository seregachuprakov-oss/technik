/**
 * Генерация ОРИГИНАЛЬНОЙ иллюстративной фотографии товара через Gemini
 * (gemini-2.5-flash-image, тот же «нано-банана», что уже проверен в
 * «Модный букет» и «Свое» — /var/www/svoe/src/server/media/ai-enhance.ts).
 *
 * Отличие от ai-enhance.ts соседнего проекта: там Gemini РЕДАКТИРУЕТ
 * реальное фото партнёра (image-to-image, inlineData на входе) — здесь
 * никакого реального фото нет, это генерация с нуля по текстовому описанию
 * (text-to-image). Поэтому результат ВСЕГДА помечается image_source =
 * 'ai_illustrative' в БД, и фронтенд должен показывать подпись
 * «Фото иллюстративное» — ровно та же конвенция, что в «Свое».
 *
 * НЕ копирует фото конкретного производителя/магазина — в промпте явно
 * запрещены логотипы, фирменный дизайн и текст на упаковке, чтобы это была
 * обобщённая иллюстрация, а не попытка воспроизвести чей-то реальный кадр.
 */
const RELAY_PATH = "/gemini-image";
const DIRECT_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent";

export function aiImageConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY || process.env.CONTENT_FACTORY_RELAY_URL);
}

export type GenerateIllustrationResult =
  | { ok: true; bytes: Buffer; mimeType: "image/png" }
  | { ok: false; error: string };

export async function generateIllustrativeProductImage(promptText: string): Promise<GenerateIllustrationResult> {
  if (!aiImageConfigured()) return { ok: false, error: "AI-генерация изображений не настроена (нет GEMINI_API_KEY / CONTENT_FACTORY_RELAY_URL)." };

  const apiKey = process.env.GEMINI_API_KEY;
  const relayUrl = process.env.CONTENT_FACTORY_RELAY_URL;
  const relaySecret = process.env.CONTENT_FACTORY_RELAY_SECRET ?? "";

  const url = relayUrl ? `${relayUrl.replace(/\/$/, "")}${RELAY_PATH}` : DIRECT_URL;
  const headers: Record<string, string> = relayUrl
    ? { "content-type": "application/json", "x-relay-secret": relaySecret }
    : { "content-type": "application/json", "x-goog-api-key": apiKey ?? "" };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error("[ai-image] Gemini error", res.status, detail.slice(0, 300));
      return { ok: false, error: `Gemini вернул ошибку ${res.status}: ${detail.slice(0, 200)}` };
    }

    const data = await res.json();
    const candidate = data.candidates?.[0];
    const parts: Array<{ inlineData?: { data?: string } }> = candidate?.content?.parts ?? [];
    const b64 = parts.find((p) => p.inlineData?.data)?.inlineData?.data;
    if (!b64) {
      const reason = candidate?.finishReason ? ` (${candidate.finishReason})` : "";
      console.error("[ai-image] Gemini вернул без изображения", reason);
      return { ok: false, error: `AI не вернул изображение${reason}.` };
    }
    return { ok: true, bytes: Buffer.from(b64, "base64"), mimeType: "image/png" };
  } catch (err) {
    console.error("[ai-image] запрос не удался", err);
    return { ok: false, error: `Сеть/AI недоступны: ${err instanceof Error ? err.message : String(err)}` };
  }
}
