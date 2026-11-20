/**
 * Тонкий клиент Claude API для AI-обогащения карточек товара (см.
 * src/server/enrichment/*). ВАЖНО: AI готовит ЧЕРНОВИК, решение всегда за
 * сотрудником магазина (см. docs/TZ_MASTER.md) — ничего отсюда не идёт на
 * сайт напрямую, см. enrichment_drafts/pending_review.
 *
 * Сетевой путь скопирован у соседнего проекта «Свое»
 * (/var/www/svoe/src/server/ai/client.ts, раунд 12 их истории): прямой
 * api.anthropic.com из РФ обычно заблокирован, а HTTPS_PROXY у Node fetch
 * (undici) сам по себе не подхватывается — поэтому используется тот же
 * relay (CONTENT_FACTORY_RELAY_URL → /anthropic + заголовок x-relay-secret),
 * который уже оплачен и проверен на проде «Свое». Прямой ANTHROPIC_API_KEY
 * оставлен как fallback на случай, если relay когда-нибудь станет не нужен
 * (например, если этому серверу дадут прямой доступ к api.anthropic.com).
 */
const MODEL = process.env.AI_TEXT_MODEL ?? "claude-sonnet-5";

export function aiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.CONTENT_FACTORY_RELAY_URL);
}

export class AiUnavailableError extends Error {
  constructor(message = "AI_UNAVAILABLE") {
    super(message);
  }
}

export interface AskClaudeOptions {
  maxTokens?: number;
}

export async function askClaude(system: string, userPrompt: string, options: AskClaudeOptions = {}): Promise<string> {
  const maxTokens = options.maxTokens ?? 1200;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const relayUrl = process.env.CONTENT_FACTORY_RELAY_URL;
  const relaySecret = process.env.CONTENT_FACTORY_RELAY_SECRET ?? "";
  if (!apiKey && !relayUrl) throw new AiUnavailableError("AI_NOT_CONFIGURED");

  const url = relayUrl ? `${relayUrl.replace(/\/$/, "")}/anthropic` : "https://api.anthropic.com/v1/messages";
  const headers: Record<string, string> = relayUrl
    ? { "content-type": "application/json", "x-relay-secret": relaySecret }
    : { "content-type": "application/json", "x-api-key": apiKey ?? "", "anthropic-version": "2023-06-01" };

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens,
        system,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });
  } catch (err) {
    throw new AiUnavailableError(`AI_NETWORK_ERROR: ${err instanceof Error ? err.message : String(err)}`);
  }

  if (!response.ok) {
    const detail = await response.text();
    throw new AiUnavailableError(`AI_HTTP_${response.status}: ${detail.slice(0, 300)}`);
  }

  let json: { content?: Array<{ type: string; text?: string }> };
  try {
    json = (await response.json()) as { content?: Array<{ type: string; text?: string }> };
  } catch (err) {
    throw new AiUnavailableError(`AI_BAD_RESPONSE: ${err instanceof Error ? err.message : String(err)}`);
  }
  const text = json.content?.find((c) => c.type === "text")?.text;
  if (!text) throw new AiUnavailableError("AI_EMPTY_RESPONSE");
  return text.trim();
}

export { MODEL as AI_TEXT_MODEL };
