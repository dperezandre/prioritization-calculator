import { Dict } from "../lib/i18n";
import { Help } from "./Help";
import {
  Item,
  MOSCOW_ORDER,
  MethodId,
  MoscowCategory,
  RICE_IMPACT_SCALE,
  WSJF_SCALE,
  rank,
} from "../lib/methods";

type NumKey =
  | "reach" | "riceImpact" | "riceConfidence" | "effort"
  | "iceImpact" | "iceConfidence" | "iceEase"
  | "businessValue" | "timeCriticality" | "riskReduction" | "jobSize";

interface Field {
  key: NumKey;
  options?: number[];
  min?: number;
  max?: number;
  step?: number;
}

const FIELDS: Record<Exclude<MethodId, "moscow">, Field[]> = {
  rice: [
    { key: "reach", min: 0, step: 100 },
    { key: "riceImpact", options: RICE_IMPACT_SCALE },
    { key: "riceConfidence", min: 0, max: 100, step: 10 },
    { key: "effort", min: 0.1, step: 0.5 },
  ],
  ice: [
    { key: "iceImpact", min: 1, max: 10 },
    { key: "iceConfidence", min: 1, max: 10 },
    { key: "iceEase", min: 1, max: 10 },
  ],
  wsjf: [
    { key: "businessValue", options: WSJF_SCALE },
    { key: "timeCriticality", options: WSJF_SCALE },
    { key: "riskReduction", options: WSJF_SCALE },
    { key: "jobSize", options: WSJF_SCALE },
  ],
};

const fmt = (n: number) =>
  n >= 100 ? Math.round(n).toLocaleString() : Number(n.toFixed(2)).toLocaleString();

interface Props {
  t: Dict;
  method: MethodId;
  items: Item[];
  onChange: (items: Item[]) => void;
}

export function Backlog({ t, method, items, onChange }: Props) {
  const ranked = rank(method, items);
  const update = (id: string, patch: Partial<Item>) =>
    onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  const fields = method === "moscow" ? [] : FIELDS[method];

  if (items.length === 0) return <p className="empty">{t.empty}</p>;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>{t.rank}</th>
            <th>{t.name}<Help text={t.fieldHelp.name} /></th>
            {fields.map((f) => (
              <th key={f.key}>{t[f.key]}<Help text={t.fieldHelp[f.key]} /></th>
            ))}
            {method === "moscow" && <th>{t.moscow}<Help text={t.fieldHelp.moscow} /></th>}
            <th>{t.score}</th>
            <th aria-label={t.remove} />
          </tr>
        </thead>
        <tbody>
          {ranked.map(({ item, score, rank: r }) => (
            <tr key={item.id}>
              <td className="rank">{r}</td>
              <td>
                <input
                  aria-label={t.name}
                  value={item.name}
                  placeholder={t.newItem}
                  onChange={(e) => update(item.id, { name: e.target.value })}
                />
              </td>
              {fields.map((f) => (
                <td key={f.key}>
                  {f.options ? (
                    <select
                      aria-label={t[f.key]}
                      value={item[f.key]}
                      onChange={(e) => update(item.id, { [f.key]: Number(e.target.value) })}
                    >
                      {[...new Set([...f.options, item[f.key]])].sort((a, b) => a - b).map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="number"
                      aria-label={t[f.key]}
                      value={Number.isFinite(item[f.key]) ? item[f.key] : ""}
                      min={f.min}
                      max={f.max}
                      step={f.step ?? 1}
                      onChange={(e) =>
                        update(item.id, { [f.key]: e.target.value === "" ? NaN : Number(e.target.value) })
                      }
                    />
                  )}
                </td>
              ))}
              {method === "moscow" && (
                <td>
                  <select
                    aria-label={t.moscow}
                    value={item.moscow}
                    onChange={(e) => update(item.id, { moscow: e.target.value as MoscowCategory })}
                  >
                    {MOSCOW_ORDER.map((m) => (
                      <option key={m} value={m}>{t[m]}</option>
                    ))}
                  </select>
                </td>
              )}
              <td className="score">
                {method === "moscow" ? (
                  <span className={`badge ${item.moscow}`}>{t[item.moscow]}</span>
                ) : score === null ? (
                  <span className="invalid">{t.invalid}</span>
                ) : (
                  fmt(score)
                )}
              </td>
              <td>
                <button
                  className="icon"
                  aria-label={`${t.remove} ${item.name}`}
                  onClick={() => onChange(items.filter((i) => i.id !== item.id))}
                >
                  ×
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
