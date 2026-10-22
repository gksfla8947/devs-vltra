"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Heading = { id: string; text: string; level: number; element: HTMLElement };
const smoothBehavior = (): ScrollBehavior =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

export default function PostReadingTools({ children }: { children: ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [active, setActive] = useState("");

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    let entries: Heading[] = [];
    let frame = 0;
    function updateActive() {
      frame = 0;
      let current = entries[0]?.id ?? "";
      for (const heading of entries) {
        if (heading.element.getBoundingClientRect().top > 120) break;
        current = heading.id;
      }
      setActive(current);
    }
    function scheduleActive() {
      if (!frame) frame = requestAnimationFrame(updateActive);
    }
    function collect() {
      if (!content) return;
      entries = Array.from(content.querySelectorAll<HTMLElement>("h1, h2"))
        .filter((element) => element.textContent?.trim())
        .map((element, index) => {
          const blockId = element.closest("[data-id]")?.getAttribute("data-id");
          const id = element.id || `section-${blockId || index + 1}`;
          element.id = id;
          element.tabIndex = -1;
          return { id, text: element.textContent!.trim(), level: Number(element.tagName[1]), element };
        });
      setHeadings(entries);
      scheduleActive();
    }
    // BlockNote mounts asynchronously. Observe only the reader, not navigation/comments.
    const mutations = new MutationObserver(collect);
    mutations.observe(content, { childList: true, subtree: true, characterData: true });
    const resize = new ResizeObserver(scheduleActive);
    resize.observe(content);
    collect();
    window.addEventListener("scroll", scheduleActive, { passive: true });
    window.addEventListener("resize", scheduleActive);
    return () => {
      mutations.disconnect();
      resize.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleActive);
      window.removeEventListener("resize", scheduleActive);
    };
  }, []);

  function links() {
    return <nav aria-label="본문 목차">
      <ol className="post-toc-list">
        {headings.map((heading) => <li key={heading.id}>
          <a href={`#${heading.id}`} data-level={heading.level}
            aria-current={active === heading.id ? "location" : undefined}
            onClick={(event) => {
              event.preventDefault();
              heading.element.focus({ preventScroll: true });
              heading.element.scrollIntoView({ behavior: smoothBehavior(), block: "start" });
              window.history.replaceState(null, "", `#${heading.id}`);
            }}>{heading.text}</a>
        </li>)}
      </ol>
    </nav>;
  }

  return <div className="post-reader">
    {headings.length > 0 && <>
      <aside className="post-toc-desktop" aria-label="글 목차">
        <div className="post-toc-sticky">
          <p className="post-toc-label">목차</p>
          {links()}
        </div>
      </aside>
      <details className="post-toc-mobile">
        <summary>목차</summary>
        {links()}
      </details>
    </>}
    <div ref={contentRef} className="post-reader-content">{children}</div>
    <div ref={endRef} className="post-reading-end" aria-hidden="true" />
    <div className="post-scroll-controls" role="group" aria-label="글 스크롤 이동">
      <button type="button" title="글 처음으로" aria-label="글 처음으로"
        onClick={() => window.scrollTo({ top: 0, behavior: smoothBehavior() })}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 12 6-6 6 6M12 6v14M5 3h14" /></svg>
      </button>
      <button type="button" title="글 끝으로" aria-label="글 끝으로"
        onClick={() => endRef.current?.scrollIntoView({ behavior: smoothBehavior(), block: "end" })}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 12 6 6 6-6M12 18V4M5 21h14" /></svg>
      </button>
    </div>
  </div>;
}
