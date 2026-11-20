import type { CrossCheckWarning, InputFacts } from "./types";

/**
 * Простая rule-based проверка (ТЗ явно разрешает "не нужно ML"): ищем в
 * черновике описания числовые токены (7.4, 190, 18V, 2000 Вт, ...) и
 * проверяем, что то же самое числовое значение встречается где-то в
 * исходных данных (JSON фактов + вставленный сотрудником текст). Если
 * число есть в черновике, но не в источнике — это подозрение на выдуманный
 * параметр, и ревьюер должен увидеть явное предупреждение.
 *
 * Специально НЕ придираемся к числам, которые являются частью слов/дат
 * (года, "3-в-1" и т.п.) — проверка по значению числа без привязки к
 * единицам, этого достаточно для демонстрации механизма.
 */
const NUMBER_RE = /\d+(?:[.,]\d+)?/g;

function extractNumbers(text: string): string[] {
  return (text.match(NUMBER_RE) ?? []).map((n) => n.replace(",", "."));
}

export function crossCheckDraft(draftDescription: string, facts: InputFacts, sourceNote: string | null): CrossCheckWarning[] {
  const sourceText = [JSON.stringify(facts), sourceNote ?? ""].join("\n");
  const sourceNumbers = new Set(extractNumbers(sourceText));
  const draftNumbers = extractNumbers(draftDescription);

  const warnings: CrossCheckWarning[] = [];
  const seen = new Set<string>();
  for (const num of draftNumbers) {
    if (seen.has(num)) continue;
    seen.add(num);
    if (!sourceNumbers.has(num)) {
      warnings.push({
        type: "unsupported_number",
        value: num,
        note: `Число «${num}» встречается в черновике описания, но не найдено во входных фактах или вставленном источнике — проверьте перед публикацией, возможно AI это придумал.`,
      });
    }
  }
  return warnings;
}
