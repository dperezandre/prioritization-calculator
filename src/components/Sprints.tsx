import { Dict } from "../lib/i18n";
import { Item, METHODS, MethodId, rank } from "../lib/methods";
import { adherenceTable, planned, sprintPlan, suggestSprints } from "../lib/sprints";

interface Props {
  t: Dict;
  items: Item[];
  method: MethodId;
  onMethod: (m: MethodId) => void;
}

export function Sprints({ t, items, method, onMethod }: Props) {
  const plan = sprintPlan(items);
  if (plan.maxSprint === 0) return <p className="empty">{t.sprintsNoPlan}</p>;

  const table = adherenceTable(items);
  const suggested = suggestSprints(method, items);
  const ranked = rank(method, planned(items));
  const sprints = Array.from({ length: plan.maxSprint }, (_, i) => i + 1);

  return (
    <>
      <p className="hint">{t.sprintsIntro}</p>
      <p className="caveat">{t.sprintsCaveat}</p>

      <h2 className="section-title">{t.sprintsAdherence}</h2>
      <p className="hint">{t.sprintsAdherenceHint}</p>
      <div className="table-wrap short">
        <table>
          <thead>
            <tr>
              <th>{t.method}</th>
              {sprints.map((k) => (
                <th key={k}>{t.upToSprint.replace("{n}", String(k))}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {METHODS.map((m) => (
              <tr key={m} className={m === method ? "selected" : ""}>
                <td><strong>{t.methodsInfo[m].name}</strong></td>
                {table[m].map((v, i) => (
                  <td key={i} className="rank">
                    <span className="pct" style={{ background: `color-mix(in srgb, var(--primary) ${Math.round((v ?? 0) * 70)}%, transparent)` }}>
                      {v === null ? "–" : `${Math.round(v * 100)}%`}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="toolbar spaced">
        <div className="segmented" role="group" aria-label={t.method}>
          {METHODS.map((m) => (
            <button key={m} className={method === m ? "active" : ""} aria-pressed={method === m} onClick={() => onMethod(m)}>
              {t.methodsInfo[m].name}
            </button>
          ))}
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{t.rank}</th>
              <th>{t.name}</th>
              <th>{t.sprintPlanned}</th>
              <th>{t.sprintSuggested}</th>
              <th>{t.sprintDelta}</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map(({ item, rank: r }) => {
              const sug = suggested.get(item.id) ?? item.sprint;
              const diff = sug - item.sprint;
              return (
                <tr key={item.id}>
                  <td className="rank">{r}</td>
                  <td>{item.name || t.newItem}</td>
                  <td className="rank">{item.sprint}</td>
                  <td className="rank">{sug}</td>
                  <td>
                    <span className={`delta ${diff === 0 ? "same" : diff < 0 ? "up" : "down"}`}>
                      {diff === 0
                        ? t.sprintSame
                        : diff < 0
                          ? t.sprintEarlier.replace("{n}", String(-diff))
                          : t.sprintLater.replace("{n}", String(diff))}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
