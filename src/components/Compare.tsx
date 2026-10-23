import { Dict } from "../lib/i18n";
import { Item, METHODS, compare } from "../lib/methods";

export function Compare({ t, items }: { t: Dict; items: Item[] }) {
  if (items.length === 0) return <p className="empty">{t.empty}</p>;
  const rows = compare(items);
  const worst = Math.max(1, items.length - 1);

  return (
    <>
      <p className="hint">{t.compareIntro}</p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{t.name}</th>
              {METHODS.map((m) => (
                <th key={m}>{t.methodsInfo[m].name}</th>
              ))}
              <th>{t.spread}</th>
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
