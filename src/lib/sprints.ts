import { Item, METHODS, MethodId, rank } from "./methods";

export interface SprintPlan {
  /** Highest planned sprint number. */
  maxSprint: number;
  /** capacity[k] = number of stories planned up to and including sprint k (k ≥ 1). */
  capacity: number[];
}

export const planned = (items: Item[]) => items.filter((i) => i.sprint > 0);

export function sprintPlan(items: Item[]): SprintPlan {
  const p = planned(items);
  const maxSprint = Math.max(0, ...p.map((i) => i.sprint));
  const capacity = [0];
  for (let k = 1; k <= maxSprint; k++) capacity.push(p.filter((i) => i.sprint <= k).length);
  return { maxSprint, capacity };
}

/**
 * Re-plans the same stories with a method's order, keeping the planned capacity:
 * if sprint 1 had 3 stories and sprint 2 had 4, the method's top 3 go to sprint 1
 * and the next 4 to sprint 2. Returns story id → suggested sprint.
 */
export function suggestSprints(method: MethodId, items: Item[]): Map<string, number> {
  const p = planned(items);
  const { maxSprint, capacity } = sprintPlan(items);
  const order = rank(method, p);
  const out = new Map<string, number>();
  order.forEach((r, idx) => {
    let k = 1;
    while (k < maxSprint && idx >= capacity[k]) k++;
    out.set(r.item.id, k);
  });
  return out;
}

/**
 * Share of the stories planned up to sprint `k` that the method also puts in the
 * first `k` sprints (1 = same set, 0 = completely different). Null if nothing planned.
 */
export function adherence(method: MethodId, items: Item[], k: number): number | null {
  const { capacity } = sprintPlan(items);
  if (!capacity[k]) return null;
  const suggested = suggestSprints(method, items);
  const hits = planned(items).filter((i) => i.sprint <= k && (suggested.get(i.id) ?? Infinity) <= k).length;
  return hits / capacity[k];
}

export function adherenceTable(items: Item[]): Record<MethodId, (number | null)[]> {
  const { maxSprint } = sprintPlan(items);
  return Object.fromEntries(
    METHODS.map((m) => [m, Array.from({ length: maxSprint }, (_, i) => adherence(m, items, i + 1))]),
  ) as Record<MethodId, (number | null)[]>;
}
