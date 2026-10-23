import { describe, expect, it } from "vitest";
import { exportCsv, importCsv, parseCsvRows } from "../src/lib/csv";
import { blankItem } from "../src/lib/methods";

describe("parseCsvRows", () => {
  it("handles quotes, escaped quotes and embedded newlines", () => {
    const rows = parseCsvRows('a,b\n"x, y","he said ""hi""\nbye"\n');
    expect(rows[1]).toEqual(["x, y", 'he said "hi"\nbye']);
  });
  it("detects semicolon delimiter and CRLF", () => {
    expect(parseCsvRows("a;b\r\n1;2\r\n")).toEqual([["a", "b"], ["1", "2"]]);
  });
  it("skips blank lines", () => {
    expect(parseCsvRows("a\n\n\nb\n")).toEqual([["a"], ["b"]]);
  });
});

describe("importCsv", () => {
  it("imports a name-only file using defaults", () => {
    const items = importCsv("title\nLogin\nSearch\n");
    expect(items.map((i) => i.name)).toEqual(["Login", "Search"]);
    expect(items[0].reach).toBe(blankItem().reach);
  });
  it("accepts decimal commas and MoSCoW labels", () => {
    const [i] = importCsv("name;effort;moscow\nA;1,5;Must have\n");
    expect(i.effort).toBe(1.5);
    expect(i.moscow).toBe("must");
  });
  it("returns an empty list when there is no name column", () => {
    expect(importCsv("foo,bar\n1,2\n")).toEqual([]);
  });
});

describe("exportCsv", () => {
  it("round-trips items", () => {
    const original = [blankItem({ name: 'Item, with "quotes"', reach: 42, moscow: "could" })];
    const back = importCsv(exportCsv(original));
    expect(back[0]).toMatchObject({ name: 'Item, with "quotes"', reach: 42, moscow: "could" });
  });
  it("neutralises spreadsheet formulas and still round-trips the name", () => {
    const csv = exportCsv([blankItem({ name: "=HYPERLINK(\"x\")" })]);
    expect(csv).toContain("'=HYPERLINK");
    expect(importCsv(csv)[0].name).toBe('=HYPERLINK("x")');
  });
});
