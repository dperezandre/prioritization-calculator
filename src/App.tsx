import { useEffect, useRef, useState } from "react";
import { Backlog } from "./components/Backlog";
import { Chart } from "./components/Chart";
import { Compare } from "./components/Compare";
import { Guide } from "./components/Guide";
import { exportCsv, importCsv } from "./lib/csv";
import { exampleItems } from "./lib/example";
import { Lang, detectLang, getDict } from "./lib/i18n";
import { Item, METHODS, MethodId, blankItem } from "./lib/methods";

type Tab = "items" | "compare" | "chart" | "guide";
const STORAGE_KEY = "pc.items";

function loadItems(lang: Lang): Item[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map((p) => blankItem(p));
    }
  } catch {
    /* ignore corrupted or unavailable storage */
  }
  return exampleItems(lang);
}

export default function App() {
  const [lang, setLang] = useState<Lang>(detectLang);
  const [items, setItems] = useState<Item[]>(() => loadItems(detectLang()));
  const [method, setMethod] = useState<MethodId>("rice");
  const [tab, setTab] = useState<Tab>("items");
  const [dark, setDark] = useState(
    () => typeof matchMedia !== "undefined" && matchMedia("(prefers-color-scheme: dark)").matches,
  );
  const [notice, setNotice] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const t = getDict(lang);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage full or blocked */
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem("pc.lang", lang);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
    document.title = t.title;
  }, [lang, t.title]);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);

  const onImport = async (file: File) => {
    const imported = importCsv(await file.text());
    if (imported.length === 0) {
      setNotice(t.importFail);
    } else {
      setItems((prev) => [...prev, ...imported]);
      setNotice(t.importedN.replace("{n}", String(imported.length)));
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const onExport = () => {
    const url = URL.createObjectURL(new Blob([exportCsv(items)], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "backlog-prioritizado.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs: [Tab, string][] = [
    ["items", t.tabItems],
    ["compare", t.tabCompare],
    ["chart", t.tabChart],
    ["guide", t.tabGuide],
  ];

  return (
    <div className="app">
      <header>
        <div>
          <h1>{t.title}</h1>
          <p className="sub">{t.subtitle}</p>
        </div>
        <div className="header-actions">
          <button onClick={() => setLang(lang === "pt" ? "en" : "pt")} aria-label={t.language}>
            {lang === "pt" ? "EN" : "PT"}
          </button>
          <button onClick={() => setDark(!dark)} aria-label={t.theme}>
            {dark ? "☀" : "☾"}
          </button>
        </div>
      </header>

      <nav role="tablist">
        {tabs.map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </nav>

      {tab === "items" && (
        <div className="toolbar">
          <div className="segmented" role="group" aria-label={t.method}>
            {METHODS.map((m) => (
              <button key={m} className={method === m ? "active" : ""} aria-pressed={method === m} onClick={() => setMethod(m)}>
                {t.methodsInfo[m].name}
              </button>
            ))}
          </div>
          <div className="actions">
            <button className="primary" onClick={() => setItems([...items, blankItem()])}>+ {t.addItem}</button>
            <button onClick={() => setItems(exampleItems(lang))}>{t.loadExample}</button>
            <button onClick={() => fileRef.current?.click()}>{t.importCsv}</button>
            <button onClick={onExport} disabled={items.length === 0}>{t.exportCsv}</button>
            <button onClick={() => setItems([])} disabled={items.length === 0}>{t.clear}</button>
            <input ref={fileRef} type="file" accept=".csv,text/csv" hidden onChange={(e) => e.target.files?.[0] && onImport(e.target.files[0])} />
          </div>
        </div>
      )}

      <p className="notice" role="status">{notice}</p>

      <main>
        {tab === "items" && <Backlog t={t} method={method} items={items} onChange={setItems} />}
        {tab === "compare" && <Compare t={t} items={items} />}
        {tab === "chart" && <Chart t={t} items={items} />}
        {tab === "guide" && <Guide t={t} />}
      </main>

      <footer>{t.storedLocally}</footer>
    </div>
  );
}
