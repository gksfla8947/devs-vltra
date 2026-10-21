"use client";

import { useEffect, useId, useRef, useState } from "react";

type Category = { name: string | null; count: number };

export default function CategoryFilter({ categories, active, onSelect }: {
  categories: Category[];
  active: string | null;
  onSelect: (name: string | null) => void;
}) {
  const [visibleCount, setVisibleCount] = useState(categories.length);
  const [expanded, setExpanded] = useState(false);
  const measureRef = useRef<HTMLDivElement>(null);
  const extraId = useId();

  useEffect(() => {
    const container = measureRef.current;
    if (!container) return;
    function measure() {
      if (!container) return;
      const items = Array.from(container.querySelectorAll<HTMLElement>("[data-category]"));
      const widths = items.map((item) => item.getBoundingClientRect().width);
      const gap = 10;
      const available = container.clientWidth;
      const total = widths.reduce((sum, width) => sum + width, 0) + gap * Math.max(0, widths.length - 1);
      if (total <= available) {
        setVisibleCount(widths.length);
        return;
      }
      const toggle = container.querySelector<HTMLElement>("[data-toggle]")!;
      let used = toggle.getBoundingClientRect().width;
      let count = 0;
      for (const width of widths) {
        if (used + gap + width > available) break;
        used += gap + width;
        count++;
      }
      setVisibleCount(count);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    // Observe label widths too: font loading and count changes can change the fit.
    container.querySelectorAll<HTMLElement>("button").forEach((button) => observer.observe(button));
    measure();
    return () => observer.disconnect();
  }, [categories]);

  function categoryButton(category: Category, measuring = false) {
    return <button type="button" key={category.name ?? "__all"} className="category-filter"
      data-category={measuring ? "" : undefined} tabIndex={measuring ? -1 : undefined}
      aria-pressed={active === category.name} onClick={() => onSelect(category.name)}>
      {category.name ?? "전체"}<span className="ml-2 text-xs opacity-70">{category.count}</span>
    </button>;
  }

  const overflow = visibleCount < categories.length;
  return <div className="category-picker" role="group" aria-label="글 카테고리">
    <div className="category-measure" ref={measureRef} aria-hidden="true" inert>
      {categories.map((category) => categoryButton(category, true))}
      <button type="button" className="category-filter category-toggle" data-toggle tabIndex={-1}>+</button>
    </div>
    <div className="category-list">
      {categories.slice(0, visibleCount).map((category) => categoryButton(category))}
      {overflow && <button type="button" className="category-filter category-toggle"
        aria-expanded={expanded} aria-controls={extraId}
        aria-label={expanded ? "추가 카테고리 접기" : "추가 카테고리 펼치기"}
        onClick={() => setExpanded((value) => !value)}>{expanded ? "−" : "+"}</button>}
    </div>
    {overflow && <div id={extraId} className="category-extra" hidden={!expanded}>
      {categories.slice(visibleCount).map((category) => categoryButton(category))}
    </div>}
  </div>;
}
