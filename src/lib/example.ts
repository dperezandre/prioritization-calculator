import { Item, MoscowCategory, blankItem } from "./methods";

/**
 * Real-world example: the user stories of "Mensagens", a WhatsApp scheduling MVP
 * (https://github.com/dperezandre/mensagem-arep), split by the delivery plan in its
 * ARQUITETURA.md. `sprint` is the sprint in which each story was planned.
 *
 * Context used to estimate: one admin + ~5 clients, so Reach is people reached
 * (6 = admin and all clients, 1 = admin only). Effort is in person-months (0.25 ≈ 1 week).
 */
type Row = [
  sprint: number,
  pt: string,
  en: string,
  reach: number,
  impact: number,
  conf: number,
  effort: number,
  ice: [number, number, number],
  wsjf: [number, number, number, number],
  moscow: MoscowCategory,
];

const ROWS: Row[] = [
  // Sprint 1 — Foundation
  [1, "US-01 Subir o ambiente local com Docker Compose", "US-01 Run the local environment with Docker Compose", 6, 3, 100, 0.25, [9, 10, 7], [8, 13, 13, 3], "must"],
  [1, "US-02 Entrar no sistema com e-mail e senha", "US-02 Sign in with email and password", 6, 3, 100, 0.5, [9, 10, 6], [8, 13, 8, 5], "must"],
  [1, "US-03 Criar o administrador e as migrações no primeiro start", "US-03 Create the admin and migrations on first start", 1, 1, 100, 0.25, [5, 10, 8], [3, 8, 5, 2], "must"],
  // Sprint 2 — WhatsApp connection
  [2, "US-04 Parear o WhatsApp lendo um QR Code", "US-04 Pair WhatsApp by scanning a QR code", 6, 3, 80, 0.5, [10, 7, 5], [13, 8, 5, 5], "must"],
  [2, "US-05 Ver o status da conexão no cabeçalho", "US-05 See the connection status in the header", 1, 1, 100, 0.25, [5, 10, 8], [3, 2, 3, 2], "should"],
  [2, "US-06 Receber status de entrega pelo webhook", "US-06 Receive delivery status via webhook", 5, 1, 80, 0.5, [6, 7, 5], [5, 3, 5, 5], "should"],
  // Sprint 3 — Registers
  [3, "US-07 Cadastrar cliente com nome e telefone", "US-07 Register a client with name and phone", 6, 3, 100, 0.5, [9, 10, 8], [13, 13, 3, 3], "must"],
  [3, "US-08 Preencher o endereço pelo CEP", "US-08 Fill in the address from the postcode", 1, 0.5, 80, 0.25, [3, 8, 8], [2, 1, 1, 2], "could"],
  [3, "US-09 Importar clientes por CSV", "US-09 Import clients from CSV", 1, 1, 80, 0.5, [5, 8, 6], [5, 2, 1, 3], "should"],
  [3, "US-10 Criar mensagem padrão com variáveis", "US-10 Create a message template with variables", 6, 3, 100, 0.5, [9, 9, 7], [13, 13, 3, 5], "must"],
  [3, "US-11 Ver a prévia da mensagem ao editar", "US-11 Preview the message while editing", 1, 1, 80, 0.25, [5, 9, 8], [3, 1, 1, 2], "could"],
  [3, "US-12 Anexar imagem, áudio ou documento", "US-12 Attach an image, audio or document", 5, 2, 80, 1, [7, 7, 4], [8, 3, 2, 8], "should"],
  // Sprint 4 — Scheduling
  [4, "US-13 Agendar um envio único", "US-13 Schedule a one-off send", 6, 3, 100, 0.5, [9, 9, 7], [13, 13, 3, 3], "must"],
  [4, "US-14 Agendar envios recorrentes (diário, semanal, mensal)", "US-14 Schedule recurring sends (daily, weekly, monthly)", 5, 2, 80, 1, [8, 7, 4], [8, 5, 2, 8], "should"],
  [4, "US-15 Ver as próximas 5 datas do agendamento", "US-15 See the next 5 dates of a schedule", 1, 0.5, 90, 0.25, [3, 9, 8], [2, 1, 2, 2], "could"],
  // Sprint 5 — Sending engine
  [5, "US-16 Enviar as mensagens agendadas automaticamente", "US-16 Send scheduled messages automatically", 6, 3, 100, 1, [10, 9, 5], [13, 13, 8, 8], "must"],
  [5, "US-17 Tentar de novo até 3 vezes quando o envio falha", "US-17 Retry up to 3 times when a send fails", 5, 2, 80, 0.5, [7, 8, 6], [8, 5, 8, 3], "should"],
  [5, "US-18 Respeitar intervalo aleatório e limite diário", "US-18 Honour random delay and daily limit", 6, 3, 80, 0.5, [8, 7, 6], [8, 8, 20, 3], "must"],
  [5, "US-19 Consultar o histórico com filtros e status", "US-19 Browse the history with filters and status", 1, 2, 100, 0.75, [7, 9, 6], [8, 3, 5, 5], "should"],
  [5, "US-20 Reenviar manualmente uma mensagem com erro", "US-20 Manually resend a failed message", 1, 1, 100, 0.25, [4, 9, 8], [3, 1, 2, 2], "could"],
  // Sprint 6 — Safety and operations
  [6, "US-21 Pausar todos os envios com um botão", "US-21 Pause all sends with one button", 6, 2, 100, 0.25, [7, 10, 9], [5, 5, 13, 2], "must"],
  [6, "US-22 Enviar uma mensagem de teste para o meu número", "US-22 Send a test message to my own number", 1, 1, 100, 0.25, [5, 10, 8], [5, 3, 5, 2], "should"],
  [6, "US-23 Respeitar o opt-out de quem não quer receber", "US-23 Honour opt-out for people who don't want messages", 5, 3, 100, 0.25, [8, 10, 8], [8, 8, 20, 2], "must"],
  [6, "US-24 Fazer backup diário do banco", "US-24 Run a daily database backup", 6, 2, 80, 0.25, [6, 9, 8], [5, 3, 13, 2], "should"],
  // Sprint 7 — Deploy
  [7, "US-25 Publicar na Oracle Cloud com HTTPS", "US-25 Deploy to Oracle Cloud with HTTPS", 6, 3, 80, 1, [10, 6, 3], [13, 13, 8, 8], "must"],
  [7, "US-26 Usar o tema escuro e o layout de celular", "US-26 Use the dark theme and mobile layout", 1, 0.25, 90, 0.5, [2, 9, 6], [1, 1, 1, 3], "could"],
];

export function exampleItems(lang: "pt" | "en"): Item[] {
  return ROWS.map(([sprint, pt, en, reach, impact, conf, effort, ice, wsjf, moscow]) =>
    blankItem({
      name: lang === "pt" ? pt : en,
      sprint,
      reach,
      riceImpact: impact,
      riceConfidence: conf,
      effort,
      iceImpact: ice[0],
      iceConfidence: ice[1],
      iceEase: ice[2],
      businessValue: wsjf[0],
      timeCriticality: wsjf[1],
      riskReduction: wsjf[2],
      jobSize: wsjf[3],
      moscow,
    }),
  );
}
