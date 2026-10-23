import { Item, blankItem } from "./methods";

/** Sample backlog for a fictional personal-finance app. */
export function exampleItems(lang: "pt" | "en"): Item[] {
  const t = (pt: string, en: string) => (lang === "pt" ? pt : en);
  return [
    blankItem({ name: t("Lembretes de contas a pagar", "Bill payment reminders"), reach: 60000, riceImpact: 2, riceConfidence: 80, effort: 2.5, iceImpact: 8, iceConfidence: 7, iceEase: 5, businessValue: 13, timeCriticality: 8, riskReduction: 3, jobSize: 8, moscow: "must" }),
    blankItem({ name: t("Resumo mensal por e-mail", "Monthly summary email"), reach: 80000, riceImpact: 1, riceConfidence: 80, effort: 1, iceImpact: 6, iceConfidence: 8, iceEase: 8, businessValue: 8, timeCriticality: 3, riskReduction: 2, jobSize: 3, moscow: "should" }),
    blankItem({ name: t("Categorização automática", "Automatic categorisation"), reach: 70000, riceImpact: 2, riceConfidence: 50, effort: 4, iceImpact: 8, iceConfidence: 4, iceEase: 3, businessValue: 13, timeCriticality: 3, riskReduction: 5, jobSize: 13, moscow: "should" }),
    blankItem({ name: t("Metas de economia", "Savings goals"), reach: 40000, riceImpact: 1, riceConfidence: 50, effort: 3, iceImpact: 5, iceConfidence: 5, iceEase: 5, businessValue: 8, timeCriticality: 2, riskReduction: 1, jobSize: 8, moscow: "could" }),
    blankItem({ name: t("Correção de conformidade LGPD", "Privacy compliance fix"), reach: 5000, riceImpact: 0.5, riceConfidence: 100, effort: 1.5, iceImpact: 4, iceConfidence: 10, iceEase: 6, businessValue: 3, timeCriticality: 20, riskReduction: 13, jobSize: 5, moscow: "must" }),
    blankItem({ name: t("Gamificação com pontos", "Points gamification"), reach: 30000, riceImpact: 0.5, riceConfidence: 30, effort: 3, iceImpact: 3, iceConfidence: 2, iceEase: 6, businessValue: 3, timeCriticality: 1, riskReduction: 1, jobSize: 8, moscow: "wont" }),
    blankItem({ name: t("Modo escuro", "Dark mode"), reach: 50000, riceImpact: 0.25, riceConfidence: 90, effort: 0.5, iceImpact: 3, iceConfidence: 9, iceEase: 9, businessValue: 3, timeCriticality: 1, riskReduction: 1, jobSize: 2, moscow: "could" }),
  ];
}
