import { useState } from "react";
import { Dict } from "../lib/i18n";
import { Item, METHODS, MethodId, compare } from "../lib/methods";

type SortKey = MethodId | "spread";

export function Compare({ t, items }: { t: Dict; items: Item[] }) {
  const [sortBy, setSortBy] = useState<SortKey>("spread");
  if (items.length === 0) return <p className="empty">{t.empty}</p>;
  // compare() already returns rows by divergence (largest first); sort is stable.
  const rows = compare(items);
  if (sortBy !== "spread") rows.sort((a, b) => a.ranks[sortBy] - b.ranks[sortBy]);
  const worst = Math.max(1, items.length - 1);

  return (
    <>
      <p className="hint">{t.compareIntro}</p>
      <div className="toolbar spaced">
        <span className="sort-label" id="sort-label">{t.sortBy}</span>
        <div className="segmented" role="group" aria-labelledby="sort-label">
          {METHODS.map((m) => (
            <button key={m} className={sortBy === m ? "active" : ""} aria-pressed={sortBy === m} onClick={() => setSortBy(m)}>
              {t.methodsInfo[m].name}
            </button>
          ))}
          <button className={sortBy === "spread" ? "active" : ""} aria-pressed={sortBy === "spread"} onClick={() => setSortBy("spread")}>
            {t.spread}
          </button>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{t.name}</th>
              {METHODS.map((m) => (
                <th key={m} aria-sort={sortBy === m ? "ascending" : "none"}>
                  <button className="th-sort" onClick={() => setSortBy(m)}>
                    {t.methodsInfo[m].name}{sortBy === m ? " ▲" : ""}
                  </button>
                </th>
              ))}
              <th aria-sort={sortBy === "spread" ? "descending" : "none"}>
                <button className="th-sort" onClick={() => setSortBy("spread")}>
                  {t.spread}{sortBy === "spread" ? " ▼" : ""}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ item, ranks, spread }) => (
              <tr key={item.id}>
                <td>{item.name || t.newItem}</td>
                {METHODS.map((m) => (
                  <td key={m} className="rank">
                    <span className="rank-pill" style={{ opacity: 1 - (ranks[m] - 1) / (worst * 1.6) }}>
                      {ranks[m]}
                    </span>
                  </td>
                ))}
                <td>
                  <div className="bar" title={`${spread}`}>
                    <span style={{ width: `${Math.min(100, (spread / worst) * 100)}%` }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
