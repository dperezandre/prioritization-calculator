import { describe, expect, it } from "vitest";
import {
  blankItem,
  compare,
  iceScore,
  moscowScore,
  rank,
  riceScore,
  wsjfScore,
} from "../src/lib/methods";

const item = (p: Parameters<typeof blankItem>[0]) => blankItem(p);

describe("RICE", () => {
  it("computes (reach × impact × confidence) / effort", () => {
    // 2000 × 2 × 0.8 / 4 = 800
    expect(riceScore(item({ reach: 2000, riceImpact: 2, riceConfidence: 80, effort: 4 }))).toBe(800);
  });
  it("returns null when effort is zero or negative", () => {
    expect(riceScore(item({ effort: 0 }))).toBeNull();
    expect(riceScore(item({ effort: -1 }))).toBeNull();
  });
  it("returns null for non-finite inputs", () => {
    expect(riceScore(item({ reach: NaN }))).toBeNull();
  });
  it("scores zero confidence as zero", () => {
    expect(riceScore(item({ riceConfidence: 0 }))).toBe(0);
  });
});

describe("ICE", () => {
  it("multiplies impact, confidence and ease", () => {
    expect(iceScore(item({ iceImpact: 8, iceConfidence: 5, iceEase: 4 }))).toBe(160);
  });
  it("rejects negative inputs", () => {
    expect(iceScore(item({ iceImpact: -1 }))).toBeNull();
  });
});

describe("WSJF", () => {
  it("divides cost of delay by job size", () => {
    // (8 + 5 + 3) / 4 = 4
    expect(
      wsjfScore(item({ businessValue: 8, timeCriticality: 5, riskReduction: 3, jobSize: 4 })),
    ).toBe(4);
  });
  it("returns null when job size is zero", () => {
    expect(wsjfScore(item({ jobSize: 0 }))).toBeNull();
  });
});

describe("MoSCoW", () => {
  it("orders must > should > could > wont", () => {
    const s = (m: "must" | "should" | "could" | "wont") => moscowScore(item({ moscow: m }));
    expect(s("must")).toBeGreaterThan(s("should"));
    expect(s("should")).toBeGreaterThan(s("could"));
    expect(s("could")).toBeGreaterThan(s("wont"));
  });
  it("breaks ties inside a category using RICE", () => {
    const a = item({ name: "a", moscow: "must", reach: 100 });
    const b = item({ name: "b", moscow: "must", reach: 5000 });
    expect(rank("moscow", [a, b]).map((r) => r.item.name)).toEqual(["b", "a"]);
  });
});

describe("rank", () => {
  it("sorts descending and shares rank on ties", () => {
    const a = item({ name: "a", iceImpact: 10, iceConfidence: 10, iceEase: 10 });
    const b = item({ name: "b", iceImpact: 5, iceConfidence: 5, iceEase: 5 });
    const c = item({ name: "c", iceImpact: 5, iceConfidence: 5, iceEase: 5 });
    const r = rank("ice", [b, c, a]);
    expect(r.map((x) => x.rank)).toEqual([1, 2, 2]);
    expect(r[0].item.name).toBe("a");
  });
  it("puts invalid items last", () => {
    const ok = item({ name: "ok" });
    const bad = item({ name: "bad", effort: 0 });
    const r = rank("rice", [bad, ok]);
    expect(r.map((x) => x.item.name)).toEqual(["ok", "bad"]);
  });
  it("handles an empty backlog", () => {
    expect(rank("rice", [])).toEqual([]);
  });
});

describe("compare", () => {
  it("reports the rank spread across methods, largest first", () => {
    const a = item({ name: "a", reach: 9000, effort: 1, iceImpact: 1, iceConfidence: 1, iceEase: 1, moscow: "wont" });
    const b = item({ name: "b", reach: 10, effort: 1, iceImpact: 9, iceConfidence: 9, iceEase: 9, moscow: "must" });
    const out = compare([a, b]);
    expect(out[0].spread).toBeGreaterThan(0);
    expect(out[0].ranks.rice).not.toBe(out[0].ranks.ice);
  });
});
