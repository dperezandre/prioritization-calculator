import { Dict } from "../lib/i18n";
import { METHODS } from "../lib/methods";

export function Guide({ t }: { t: Dict }) {
  return (
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
  );
}
