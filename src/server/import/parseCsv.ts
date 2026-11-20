/**
 * Небольшой ручной CSV-парсер без зависимостей: поддерживает запятую или
 * точку с запятой как разделитель (1С часто экспортирует через ";"),
 * кавычки "..." с экранированием "" и перевод строки внутри поля.
 * Для реальных выгрузок из 1С в кодировке Windows-1251 файл нужно
 * предварительно сохранить в UTF-8 (Excel/LibreOffice "Сохранить как CSV UTF-8").
 */
export interface CsvParseResult {
  headers: string[];
  rows: Record<string, string>[];
}

export function parseCsv(text: string): CsvParseResult {
  const content = text.replace(/^﻿/, ""); // BOM
  const delimiter = content.slice(0, content.indexOf("\n")).includes(";") ? ";" : ",";
  const lines = splitRecords(content);
  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = splitFields(lines[0]!, delimiter).map((h) => h.trim());
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const raw = lines[i]!;
    if (raw.trim() === "") continue;
    const fields = splitFields(raw, delimiter);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = (fields[idx] ?? "").trim();
    });
    rows.push(row);
  }
  return { headers, rows };
}

function splitRecords(content: string): string[] {
  // Учитываем, что перевод строки может быть внутри кавычек — считаем кавычки.
  const records: string[] = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < content.length; i++) {
    const ch = content[i]!;
    if (ch === '"') quoted = !quoted;
    if (ch === "\n" && !quoted) {
      records.push(current.replace(/\r$/, ""));
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim() !== "") records.push(current.replace(/\r$/, ""));
  return records;
}

function splitFields(line: string, delimiter: string): string[] {
  const fields: string[] = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;
    if (quoted) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          quoted = false;
        }
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === delimiter) {
      fields.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}
