# 🧮 Prioritization Calculator / Calculadora de Priorização

![CI](https://github.com/dperezandre/prioritization-calculator/actions/workflows/ci.yml/badge.svg)

Web app para ranquear um backlog com **RICE, ICE, WSJF e MoSCoW**, comparar os métodos lado a lado e visualizar valor × esforço. Bilíngue (PT/EN), sem backend: os dados ficam no seu navegador.

A web app to rank a backlog with **RICE, ICE, WSJF and MoSCoW**, compare methods side by side and see value × effort. Bilingual (PT/EN), no backend: your data stays in your browser.

**🔗 Demo:** https://dperezandre.github.io/prioritization-calculator/

## ✨ Funcionalidades / Features
- **4 métodos** de priorização com escalas de referência (impacto RICE 0,25–3, Fibonacci no WSJF).
- **Comparador:** mostra a posição de cada item em cada método e a **divergência** entre eles, para apontar o que precisa de conversa.
- **Gráfico valor × esforço** com quadrantes (ganhos rápidos, apostas grandes, preenchimentos, evitar).
- **Importar/exportar CSV** (aceita `,` `;` e tab; um arquivo só com `name`/`title` já funciona). Exportação protegida contra injeção de fórmulas em planilhas.
- **Guia dos métodos:** fórmula, quando usar e limitações.
- Tema claro/escuro, responsivo, navegável por teclado e salvo em `localStorage`.

## 📐 Fórmulas
| Método | Fórmula | Observação |
|---|---|---|
| RICE | `(Alcance × Impacto × Confiança) ÷ Esforço` | Confiança em %, esforço em pessoa-mês |
| ICE | `Impacto × Confiança × Facilidade` | Notas de 1 a 10 |
| WSJF | `(Valor + Criticidade + Redução de risco) ÷ Tamanho` | Escala Fibonacci modificada |
| MoSCoW | `Must > Should > Could > Won't` | Empates dentro da categoria resolvidos por RICE |

Entradas inválidas (ex.: esforço ≤ 0) geram "inválido" e o item vai para o fim da lista, em vez de produzir `Infinity` ou `NaN`.

## 🚀 Como rodar
```bash
npm install
npm run dev        # servidor local
npm test           # testes unitários (Vitest)
npm run build      # typecheck + build de produção
```

## 📥 Formato do CSV
Veja [`public/exemplo-backlog.csv`](public/exemplo-backlog.csv). Colunas: `name, reach, riceImpact, riceConfidence, effort, iceImpact, iceConfidence, iceEase, businessValue, timeCriticality, riskReduction, jobSize, moscow`. Colunas ausentes recebem valores padrão.

## 🏗️ Estrutura
```
src/
├── lib/            # lógica pura e testada (sem React)
│   ├── methods.ts  # fórmulas, ranking e comparador
│   ├── csv.ts      # parser/exportador CSV
│   ├── i18n.ts     # textos PT/EN
│   └── example.ts  # backlog de exemplo
├── components/     # Backlog, Compare, Chart, Guide
└── App.tsx
tests/              # Vitest
.github/workflows/  # CI e deploy no GitHub Pages
```

## 🧠 Decisões de projeto
- **Lógica separada da interface:** as fórmulas são funções puras, fáceis de testar e de reaproveitar.
- **Sem dependências de gráfico:** o gráfico é SVG próprio, mantendo o bundle em ~53 kB gzip.
- **Ranking com empate:** itens com o mesmo score compartilham a posição (1, 2, 2, 4).
- **Privacidade por padrão:** nada é enviado a servidores.

## 🗺️ Próximos passos
- Pesos personalizados e simulação "e se?".
- Compartilhar o backlog por link.
- Mais métodos (Kano, Value vs Effort ponderado).

## 📄 Licença
[MIT](LICENSE) © André Perez
