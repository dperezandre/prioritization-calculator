export type MethodId = "rice" | "ice" | "wsjf" | "moscow";
export type MoscowCategory = "must" | "should" | "could" | "wont";

export const METHODS: MethodId[] = ["rice", "ice", "wsjf", "moscow"];
export const MOSCOW_ORDER: MoscowCategory[] = ["must", "should", "could", "wont"];
/** RICE impact scale (Intercom): minimal, low, medium, high, massive. */
export const RICE_IMPACT_SCALE = [0.25, 0.5, 1, 2, 3];
/** WSJF relative-size scale (modified Fibonacci). */
export const WSJF_SCALE = [1, 2, 3, 5, 8, 13, 20];

export interface Item {
  id: string;
  name: string;
  /** Sprint in which the story was planned (0 = not planned). */
  sprint: number;
  // RICE
  reach: number; // people/events per period
  riceImpact: number; // 0.25 – 3
  riceConfidence: number; // 0 – 100 (%)
  effort: number; // person-months, > 0
  // ICE
  iceImpact: number; // 1 – 10
  iceConfidence: number; // 1 – 10
  iceEase: number; // 1 – 10
  // WSJF
  businessValue: number;
  timeCriticality: number;
  riskReduction: number;
  jobSize: number; // > 0
  // MoSCoW
  moscow: MoscowCategory;
}

export interface Scored {
  item: Item;
  /** Score used for ordering; null when inputs are invalid. */
  score: number | null;
}

export interface Ranked extends Scored {
  rank: number;
}

const finite = (n: number) => Number.isFinite(n);

/** RICE = (Reach × Impact × Confidence) ÷ Effort */
export function riceScore(i: Item): number | null {
  if (![i.reach, i.riceImpact, i.riceConfidence, i.effort].every(finite)) return null;
  if (i.effort <= 0 || i.reach < 0 || i.riceConfidence < 0) return null;
  return (i.reach * i.riceImpact * (i.riceConfidence / 100)) / i.effort;
}

/** ICE = Impact × Confidence × Ease */
export function iceScore(i: Item): number | null {
  if (![i.iceImpact, i.iceConfidence, i.iceEase].every(finite)) return null;
  if (i.iceImpact < 0 || i.iceConfidence < 0 || i.iceEase < 0) return null;
  return i.iceImpact * i.iceConfidence * i.iceEase;
}

/** WSJF = Cost of Delay ÷ Job Size, with Cost of Delay = BV + TC + RR/OE */
export function wsjfScore(i: Item): number | null {
  if (![i.businessValue, i.timeCriticality, i.riskReduction, i.jobSize].every(finite)) return null;
  if (i.jobSize <= 0) return null;
  return (i.businessValue + i.timeCriticality + i.riskReduction) / i.jobSize;
}

/** MoSCoW has no formula: Must > Should > Could > Won't. */
export function moscowScore(i: Item): number {
  return MOSCOW_ORDER.length - MOSCOW_ORDER.indexOf(i.moscow);
}

export function scoreItem(method: MethodId, i: Item): number | null {
  switch (method) {
    case "rice":
      return riceScore(i);
    case "ice":
      return iceScore(i);
    case "wsjf":
      return wsjfScore(i);
    case "moscow":
      return moscowScore(i);
  }
}

/**
 * Orders items by score (highest first). Items with invalid inputs go last.
 * Ties share the same rank (standard competition ranking: 1, 2, 2, 4).
 * For MoSCoW, ties inside a category are broken by RICE to keep the order useful.
 */
export function rank(method: MethodId, items: Item[]): Ranked[] {
  const scored: Scored[] = items.map((item) => ({ item, score: scoreItem(method, item) }));
  const tie = (s: Scored) => (method === "moscow" ? riceScore(s.item) ?? -Infinity : 0);

  const sorted = [...scored].sort((a, b) => {
    if (a.score === null && b.score === null) return 0;
    if (a.score === null) return 1;
    if (b.score === null) return -1;
    if (b.score !== a.score) return b.score - a.score;
    return tie(b) - tie(a);
  });

  const out: Ranked[] = [];
  sorted.forEach((s, idx) => {
    const prev = out[idx - 1];
    const same =
      prev && prev.score === s.score && (method !== "moscow" || tie(prev) === tie(s));
    out.push({ ...s, rank: same ? prev.rank : idx + 1 });
  });
  return out;
}

export interface Comparison {
  item: Item;
  ranks: Record<MethodId, number>;
  /** max rank − min rank across methods: how much the methods disagree. */
  spread: number;
}

export function compare(items: Item[]): Comparison[] {
  const byMethod = Object.fromEntries(
    METHODS.map((m) => [m, new Map(rank(m, items).map((r) => [r.item.id, r.rank]))]),
  ) as Record<MethodId, Map<string, number>>;

  return items
    .map((item) => {
      const ranks = Object.fromEntries(
        METHODS.map((m) => [m, byMethod[m].get(item.id) ?? items.length]),
      ) as Record<MethodId, number>;
      const vals = Object.values(ranks);
      return { item, ranks, spread: Math.max(...vals) - Math.min(...vals) };
    })
    .sort((a, b) => b.spread - a.spread);
}

let counter = 0;
export function newId(): string {
  counter += 1;
  return `i${Date.now().toString(36)}${counter}`;
}

export function blankItem(partial: Partial<Item> = {}): Item {
  return {
    id: newId(),
    name: "",
    sprint: 0,
    reach: 1000,
    riceImpact: 1,
    riceConfidence: 80,
    effort: 1,
    iceImpact: 5,
    iceConfidence: 5,
    iceEase: 5,
    businessValue: 5,
    timeCriticality: 5,
    riskReduction: 3,
    jobSize: 5,
    moscow: "should",
    ...partial,
  };
}
