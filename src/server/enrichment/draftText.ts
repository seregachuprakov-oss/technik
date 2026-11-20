import { askClaude, AI_TEXT_MODEL } from "@/server/ai/client";
import type { InputFacts } from "./types";

/**
 * Промпт строго запрещает придумывать цифры/факты, которых нет во входных
 * данных (ТЗ, п. 1 части про AI-обогащение). Модель обязана вернуть JSON —
 * так проще детерминированно отделить текст описания от списка "не указано
 * в источнике", не парся произвольный текст.
 */
const SYSTEM_PROMPT = `Ты — помощник по составлению карточек товаров для небольшого магазина инструментов «Техник» в Котласе.

Тебе дан JSON с фактами о товаре (name, category, subcategory, article, barcode, specs, existing_description) и, возможно, текст или ссылка, которую вручную вставил сотрудник магазина (source_note).

СТРОГИЕ ПРАВИЛА:
1. Используй ТОЛЬКО факты из переданного JSON и source_note. НИКОГДА не добавляй в описание числовой параметр, характеристику, цену или утверждение, которого нет в этих данных — даже если ты по общим знаниям уверен, что у похожих товаров обычно такой параметр.
2. Если какая-то характеристика важна для покупателя, но не указана в источнике — не придумывай значение, а добавь в массив "uncertain" строку вида "не указано в источнике: <что именно>".
3. Описание — на русском языке, 2–4 предложения, живым деловым языком небольшого магазина, без маркетинговых штампов и превосходных степеней, которые нельзя подтвердить источником.
4. Ответь СТРОГО валидным JSON без пояснений до или после, в формате:
{"description": "...", "uncertain": ["...", "..."]}
Если неопределённостей нет — "uncertain": [].`;

export interface DraftTextResult {
  description: string;
  uncertain: string[];
  rawModel: string;
}

function buildUserPrompt(facts: InputFacts, sourceNote: string | null): string {
  const factsJson = JSON.stringify(facts, null, 2);
  const sourceBlock = sourceNote?.trim()
    ? `\n\nДополнительный источник, который вставил сотрудник магазина (используй наравне с JSON, не выходи за его пределы):\n${sourceNote.trim()}`
    : "\n\nДополнительного источника нет — используй только JSON выше.";
  return `Факты о товаре:\n${factsJson}${sourceBlock}`;
}

function parseModelJson(raw: string): { description: string; uncertain: string[] } {
  // Модель иногда оборачивает JSON в ```json ... ``` несмотря на инструкцию — подчищаем.
  const cleaned = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const parsed = JSON.parse(cleaned) as { description?: unknown; uncertain?: unknown };
  const description = typeof parsed.description === "string" ? parsed.description.trim() : "";
  const uncertain = Array.isArray(parsed.uncertain) ? parsed.uncertain.filter((u): u is string => typeof u === "string") : [];
  if (!description) throw new Error("Пустое описание в ответе AI");
  return { description, uncertain };
}

export async function draftProductDescription(facts: InputFacts, sourceNote: string | null): Promise<DraftTextResult> {
  const userPrompt = buildUserPrompt(facts, sourceNote);
  const raw = await askClaude(SYSTEM_PROMPT, userPrompt, { maxTokens: 900 });
  try {
    const parsed = parseModelJson(raw);
    return { ...parsed, rawModel: AI_TEXT_MODEL };
  } catch {
    // AI не вернул валидный JSON — не выбрасываем ошибку, а передаём сырой
    // текст на ревью с явным предупреждением, чтобы человек разбирался сам
    // (пункт ТЗ про "никогда не публикуется автоматически" важнее красивого парсинга).
    return {
      description: raw,
      uncertain: ["AI вернул ответ не в ожидаемом формате JSON — проверьте текст особенно внимательно"],
      rawModel: AI_TEXT_MODEL,
    };
  }
}
