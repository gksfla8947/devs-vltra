"use client";

import { createReactBlockSpec } from "@blocknote/react";
import { useEffect, useId, useState } from "react";
import { useTheme } from "next-themes";
import styles from "./MermaidBlock.module.css";

export const defaultMermaidSource = "graph TD\n  Mermaid --> Diagram";

// Mermaid configuration is global: serialize theme configuration and rendering
// so blocks with concurrent renders cannot overwrite each other's settings.
let renderQueue: Promise<unknown> = Promise.resolve();
async function renderDiagram(source: string, dark: boolean) {
  const task = renderQueue.then(async () => {
    const { default: mermaid } = await import("mermaid");
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme: dark ? "dark" : "default",
      suppressErrorRendering: true,
      maxTextSize: 20000,
      maxEdges: 500,
    });
    const result = await mermaid.render(`mermaid-${crypto.randomUUID()}`, source);
    const document = new DOMParser().parseFromString(result.svg, "image/svg+xml");
    const svg = document.documentElement;
    const viewBox = svg.getAttribute("viewBox")?.split(/[ ,]+/).map(Number);
    if (viewBox?.length === 4 && viewBox.every(Number.isFinite)) {
      svg.setAttribute("width", String(viewBox[2]));
      svg.setAttribute("height", String(viewBox[3]));
    }
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(svg))}`;
  });
  renderQueue = task.catch(() => undefined);
  return task;
}

type Mode = "code" | "preview" | "both";
const modes: { value: Mode; label: string }[] = [
  { value: "code", label: "코드" },
  { value: "preview", label: "다이어그램" },
  { value: "both", label: "함께 보기" },
];

function MermaidView({ source, editable, onChange }: {
  source: string; editable: boolean; onChange: (source: string) => void;
}) {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  const [mode, setMode] = useState<Mode>(editable ? "both" : "preview");
  const [result, setResult] = useState<{ key: string; image?: string; error?: string }>();
  const key = `${dark}:${source}`;
  const inputId = useId();

  useEffect(() => {
    if (mode === "code" || !source.trim()) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      if (source.length > 20000) {
        setResult({ key, error: "코드는 20,000자 이내로 입력해주세요." });
        return;
      }
      renderDiagram(source, dark).then(
        image => { if (!cancelled) setResult({ key, image }); },
        () => { if (!cancelled) setResult({ key, error: "다이어그램을 표시할 수 없습니다. Mermaid 문법을 확인해주세요. 입력한 코드는 유지됩니다." }); },
      );
    }, 350);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [source, dark, key, mode]);

  return <section className={styles.block} contentEditable={false} aria-label="Mermaid 블록">
    <div className={styles.toolbar}>
      <span>Mermaid</span>
      <div role="group" aria-label="Mermaid 표시 방식">
        {modes.map(item => <button key={item.value} type="button"
          aria-pressed={mode === item.value} onClick={() => setMode(item.value)}>{item.label}</button>)}
      </div>
    </div>
    {mode !== "preview" && (editable ? <>
      <label className={styles.label} htmlFor={inputId}>Mermaid 코드</label>
      <textarea id={inputId} aria-label="Mermaid 코드" className={styles.code}
        value={source} spellCheck={false} rows={Math.min(18, Math.max(4, source.split("\n").length + 1))}
        onChange={event => onChange(event.target.value)}
        onKeyDown={event => event.stopPropagation()} />
    </> : <pre className={styles.code}><code>{source}</code></pre>)}
    {mode !== "code" && <div className={styles.preview} aria-live="polite">
      {!source.trim() ? <p>Mermaid 코드를 입력해주세요.</p>
        : result?.key !== key ? <p role="status">다이어그램 생성 중…</p>
        : result.error ? <p role="alert">{result.error}</p>
        // An image isolates SVG from the document and disables embedded scripting.
        // eslint-disable-next-line @next/next/no-img-element
        : <img src={result.image} alt="Mermaid 다이어그램" />}
    </div>}
  </section>;
}

export const MermaidBlock = createReactBlockSpec({
  type: "mermaid",
  propSchema: { source: { default: defaultMermaidSource } },
  content: "none",
}, {
  render: ({ block, editor }) => <MermaidView source={block.props.source}
    editable={editor.isEditable}
    onChange={source => editor.updateBlock(block, { props: { source } })} />,
  toExternalHTML: ({ block }) => <pre data-mermaid-source={block.props.source}>
    <code className="language-mermaid">{block.props.source}</code>
  </pre>,
  parse: element => {
    if (element.tagName === "PRE" && element.hasAttribute("data-mermaid-source")) {
      return { source: element.getAttribute("data-mermaid-source") ?? "" };
    }
    return undefined;
  },
});
