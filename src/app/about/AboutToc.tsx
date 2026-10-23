"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./about.module.css";

const sections = [
  { id: "education", label: "학력" },
  { id: "career", label: "경력" },
  { id: "skills", label: "기술 스택" },
  { id: "awards", label: "수상" },
  { id: "projects", label: "프로젝트" },
];

export default function AboutToc() {
  const [active, setActive] = useState("");
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const elements = sections.map(section => document.getElementById(section.id));
    let frame = 0;
    function update() {
      frame = 0;
      let current = "";
      for (const element of elements) {
        if (element && element.getBoundingClientRect().top <= 140) current = element.id;
      }
      setActive(current);
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const resize = new ResizeObserver(schedule);
    if (ref.current?.parentElement) resize.observe(ref.current.parentElement);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    schedule();
    return () => {
      resize.disconnect(); cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return <aside className={styles.toc} ref={ref}>
    <nav className={styles.tocInner} aria-label="소개 페이지 목차">
      <p className={styles.tocLabel}>목차</p>
      <ul>{sections.map(section => <li key={section.id}>
        <a href={`#${section.id}`} aria-current={active === section.id ? "location" : undefined}
          onClick={event => {
            const target = document.getElementById(section.id);
            if (!target) return;
            event.preventDefault();
            target.focus({ preventScroll: true });
            target.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
            window.history.replaceState(null, "", `#${section.id}`);
          }}>{section.label}</a>
      </li>)}</ul>
    </nav>
  </aside>;
}
