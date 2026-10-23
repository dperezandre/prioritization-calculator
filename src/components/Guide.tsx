import { CSV_COLUMNS } from "../lib/csv";
import { Dict } from "../lib/i18n";
import { METHODS, MethodId, blankItem } from "../lib/methods";

const USED_BY: Record<(typeof CSV_COLUMNS)[number], MethodId | "all"> = {
  name: "all",
  reach: "rice",
  riceImpact: "rice",
  riceConfidence: "rice",
  effort: "rice",
  iceImpact: "ice",
  iceConfidence: "ice",
  iceEase: "ice",
  businessValue: "wsjf",
  timeCriticality: "wsjf",
  riskReduction: "wsjf",
  jobSize: "wsjf",
  moscow: "moscow",
};

export function Guide({ t }: { t: Dict }) {
  const defaults = blankItem();
  return (
    <>
      <div className="guide">
        {METHODS.map((m) => {
          const info = t.methodsInfo[m];
          return (
            <section key={m} className="card">
              <h3>{info.name}</h3>
              <p><strong>{t.guideFormula}:</strong> <code>{info.formula}</code></p>
              <p><strong>{t.guideWhen}:</strong> {info.when}</p>
              <p><strong>{t.guideLimits}:</strong> {info.limits}</p>
            </section>
          );
        })}
      </div>

      <h2 className="section-title">{t.csvTitle}</h2>
      <p className="hint">{t.csvIntro}</p>
      <p>
        <a className="link-btn" href={`${import.meta.env.BASE_URL}exemplo-backlog.csv`} download>
          ⬇ {t.downloadExample}
        </a>
      </p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{t.csvColumn}</th>
              <th>{t.csvUsedBy}</th>
              <th>{t.csvMeaning}</th>
              <th>{t.csvDefault}</th>
            </tr>
          </thead>
          <tbody>
            {CSV_COLUMNS.map((c) => (
              <tr key={c}>
                <td><code>{c}</code></td>
                <td>{USED_BY[c] === "all" ? t.allMethods : t.methodsInfo[USED_BY[c] as MethodId].name}</td>
                <td className="wrap">{t.fieldHelp[c]}</td>
                <td>{c === "name" ? "—" : String(defaults[c])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
