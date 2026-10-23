import { describe, expect, it } from "vitest";
import { blankItem } from "../src/lib/methods";
import { adherence, adherenceTable, sprintPlan, suggestSprints } from "../src/lib/sprints";

// ICE = 1000 / 125 / 8 / 1 for a, b, c, d
const mk = (name: string, sprint: number, v: number) =>
  blankItem({ name, sprint, iceImpact: v, iceConfidence: v, iceEase: v });

const a = mk("a", 1, 10);
const b = mk("b", 1, 5);
const c = mk("c", 2, 2);
const d = mk("d", 2, 1);

describe("sprintPlan", () => {
  it("accumulates capacity per sprint and ignores unplanned items", () => {
    const x = mk("x", 0, 9);
    expect(sprintPlan([a, b, c, d, x])).toEqual({ maxSprint: 2, capacity: [0, 2, 4] });
  });
  it("is empty when nothing is planned", () => {
    expect(sprintPlan([mk("x", 0, 1)])).toEqual({ maxSprint: 0, capacity: [0] });
  });
});

describe("suggestSprints", () => {
  it("keeps sprint sizes and follows the method order", () => {
    const m = suggestSprints("ice", [d, c, b, a]);
    expect([a, b, c, d].map((i) => m.get(i.id))).toEqual([1, 1, 2, 2]);
  });
  it("moves a high-score story planned late into an early sprint", () => {
    const late = mk("late", 2, 10);
    const early = mk("early", 1, 1);
    const m = suggestSprints("ice", [early, late]);
    expect(m.get(late.id)).toBe(1);
    expect(m.get(early.id)).toBe(2);
  });
});

describe("adherence", () => {
  it("is 1 when the method agrees with the plan", () => {
    expect(adherence("ice", [a, b, c, d], 1)).toBe(1);
    expect(adherence("ice", [a, b, c, d], 2)).toBe(1);
  });
  it("is 0 when the plan is reversed", () => {
    const rev = [mk("a", 2, 10), mk("b", 2, 5), mk("c", 1, 2), mk("d", 1, 1)];
    expect(adherence("ice", rev, 1)).toBe(0);
  });
  it("returns null for a sprint with no stories", () => {
    expect(adherence("ice", [a, b], 3)).toBeNull();
  });
  it("builds a table for every method and sprint", () => {
    const t = adherenceTable([a, b, c, d]);
    expect(t.rice).toHaveLength(2);
    expect(Object.keys(t)).toEqual(["rice", "ice", "wsjf", "moscow"]);
  });
});
