import { Dict } from "../lib/i18n";
import { Item, riceScore } from "../lib/methods";

const W = 640;
const H = 420;
const PAD = 52;

/** Value × effort bubble chart. Value = reach × impact × confidence; bubble = RICE. */
export function Chart({ t, items }: { t: Dict; items: Item[] }) {
  const pts = items
    .map((i) => ({
      item: i,
      value: i.reach * i.riceImpact * (i.riceConfidence / 100),
      effort: i.effort,
      score: riceScore(i),
    }))
    .filter((p) => Number.isFinite(p.value) && Number.isFinite(p.effort) && p.effort > 0);

  if (pts.length === 0) return <p className="empty">{t.empty}</p>;

  const maxV = Math.max(...pts.map((p) => p.value), 1);
  const maxE = Math.max(...pts.map((p) => p.effort), 1);
  const maxS = Math.max(...pts.map((p) => p.score ?? 0), 1);
  const x = (e: number) => PAD + (e / (maxE * 1.1)) * (W - PAD * 1.5);
  const y = (v: number) => H - PAD - (v / (maxV * 1.1)) * (H - PAD * 1.5);
  const midX = x(maxE * 0.55);
  const midY = y(maxV * 0.5);

  return (
    <>
      <h2 className="chart-title">{t.chartTitle}</h2>
      <p className="hint">{t.chartHint}</p>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t.chartTitle} className="chart">
        <line x1={midX} x2={midX} y1={PAD / 2} y2={H - PAD} className="grid" />
        <line x1={PAD} x2={W - PAD / 2} y1={midY} y2={midY} className="grid" />
        <line x1={PAD} x2={PAD} y1={PAD / 2} y2={H - PAD} className="axis" />
        <line x1={PAD} x2={W - PAD / 2} y1={H - PAD} y2={H - PAD} className="axis" />
        <text x={PAD + 8} y={PAD / 2 + 14} className="quad">{t.quickWins}</text>
        <text x={W - PAD / 2 - 8} y={PAD / 2 + 14} textAnchor="end" className="quad">{t.bigBets}</text>
        <text x={PAD + 8} y={H - PAD - 8} className="quad">{t.fillIns}</text>
        <text x={W - PAD / 2 - 8} y={H - PAD - 8} textAnchor="end" className="quad">{t.moneyPits}</text>
        <text x={W / 2} y={H - 12} textAnchor="middle" className="label">{t.chartEffort} →</text>
        <text transform={`translate(14 ${H / 2}) rotate(-90)`} textAnchor="middle" className="label">{t.chartValue} →</text>
        {pts.map((p) => (
          <g key={p.item.id}>
            <circle
              cx={x(p.effort)}
              cy={y(p.value)}
              r={6 + 18 * Math.sqrt((p.score ?? 0) / maxS)}
              className="bubble"
            >
              <title>{`${p.item.name}: ${Math.round(p.value).toLocaleString()} / ${p.effort}`}</title>
            </circle>
            <text x={x(p.effort)} y={y(p.value) - 12 - 12 * Math.sqrt((p.score ?? 0) / maxS)} textAnchor="middle" className="point-label">
              {p.item.name}
            </text>
          </g>
        ))}
      </svg>
    </>
  );
}
