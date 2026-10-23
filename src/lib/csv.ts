import { Item, MOSCOW_ORDER, MoscowCategory, blankItem } from "./methods";

export const CSV_COLUMNS = [
  "name",
  "reach",
  "riceImpact",
  "riceConfidence",
  "effort",
  "iceImpact",
  "iceConfidence",
  "iceEase",
  "businessValue",
  "timeCriticality",
  "riskReduction",
  "jobSize",
  "moscow",
] as const;

type Column = (typeof CSV_COLUMNS)[number];

/** Parses RFC 4180-style CSV (quotes, escaped quotes, newlines inside quotes). */
export function parseCsvRows(text: string): string[][] {
  const clean = text.replace(/^﻿/, "");
  const delimiter = detectDelimiter(clean);
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    if (quoted) {
      if (ch === '"' && clean[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        quoted = false;
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === delimiter) {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && clean[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += ch;
    }
  }
  if (cell !== "" || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

function detectDelimiter(text: string): string {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
  const counts = [",", ";", "\t"].map((d) => [d, firstLine.split(d).length - 1] as const);
  counts.sort((a, b) => b[1] - a[1]);
  return counts[0][1] > 0 ? counts[0][0] : ",";
}

const num = (v: string | undefined, fallback: number): number => {
  if (v === undefined || v.trim() === "") return fallback;
  const n = Number(v.trim().replace(",", "."));
  return Number.isFinite(n) ? n : fallback;
};

const moscow = (v: string | undefined, fallback: MoscowCategory): MoscowCategory => {
  const k = (v ?? "").trim().toLowerCase().replace(/['’]/g, "").replace("won t", "wont");
  const map: Record<string, MoscowCategory> = {
    must: "must",
    "must have": "must",
    should: "should",
    "should have": "should",
    could: "could",
    "could have": "could",
    wont: "wont",
    "wont have": "wont",
    "nao": "wont",
  };
  if (map[k]) return map[k];
  return (MOSCOW_ORDER as string[]).includes(k) ? (k as MoscowCategory) : fallback;
};

/**
 * Imports items from CSV. The header row is matched by column name; unknown
 * columns are ignored and missing ones fall back to defaults, so a plain
 * "name" column (e.g. a Jira export) is enough to get started.
 */
export function importCsv(text: string): Item[] {
  const rows = parseCsvRows(text);
  if (rows.length < 2) return [];
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const idx = (c: Column) => header.indexOf(c.toLowerCase());
  const nameIdx = idx("name") >= 0 ? idx("name") : header.findIndex((h) => ["title", "summary", "nome", "titulo", "título"].includes(h));
  if (nameIdx < 0) return [];

  return rows.slice(1).map((r) => {
    const d = blankItem();
    const get = (c: Column) => (idx(c) >= 0 ? r[idx(c)] : undefined);
    return {
      ...d,
      name: (r[nameIdx] ?? "").trim().replace(/^'(?=[=+\-@])/, ""),
      reach: num(get("reach"), d.reach),
      riceImpact: num(get("riceImpact"), d.riceImpact),
      riceConfidence: num(get("riceConfidence"), d.riceConfidence),
      effort: num(get("effort"), d.effort),
      iceImpact: num(get("iceImpact"), d.iceImpact),
      iceConfidence: num(get("iceConfidence"), d.iceConfidence),
      iceEase: num(get("iceEase"), d.iceEase),
      businessValue: num(get("businessValue"), d.businessValue),
      timeCriticality: num(get("timeCriticality"), d.timeCriticality),
      riskReduction: num(get("riskReduction"), d.riskReduction),
      jobSize: num(get("jobSize"), d.jobSize),
      moscow: moscow(get("moscow"), d.moscow),
    };
  });
}

const esc = (v: string | number): string => {
  const s = String(v);
  // Neutralise spreadsheet formula injection when the file is opened in Excel/Sheets.
  const safe = /^[=+\-@]/.test(s) && typeof v === "string" ? `'${s}` : s;
  return /[",\n\r;]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

export function exportCsv(items: Item[]): string {
  const lines = [CSV_COLUMNS.join(",")];
  for (const i of items) lines.push(CSV_COLUMNS.map((c) => esc(i[c])).join(","));
  return lines.join("\n") + "\n";
}
