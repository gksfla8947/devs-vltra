"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import type { Project } from "./profile";
import ProjectMedia from "./ProjectMedia";
import styles from "./about.module.css";

export default function ProjectCards({ projects, variant = "cards" }: { projects: Project[]; variant?: "cards" | "link" }) {
  const titleId = useId();
  const descriptionId = useId();
  const [selected, setSelected] = useState<Project | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!selected || !dialog) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      previousFocus?.focus({ preventScroll: true });
    };
  }, [selected]);

  return <>
    {variant === "link" ? projects.map(project => <button key={project.title} type="button" className={styles.awardProject}
      aria-haspopup="dialog" onClick={() => setSelected(project)}>연계 프로젝트: {project.title} ↗</button>) : <div className={styles.projects}>{projects.map((project, index) => <button type="button"
      className={styles.project} key={project.title} aria-haspopup="dialog"
      aria-label={`${project.title} 프로젝트 상세 보기`} onClick={() => setSelected(project)}>
      <span className={styles.projectNumber}>{String(index + 1).padStart(2, "0")}<span aria-hidden="true">↗</span></span>
      {project.image && <span className={styles.projectThumbnail}><Image src={project.image} alt={`${project.title} 로고`} width={480} height={240} /></span>}
      <span className={styles.period}>{project.period}</span>
      <span className={styles.projectTitle}>{project.title}</span>
      {project.organization && <span className={styles.projectOrganization}>{project.organization}</span>}
      <span className={styles.projectDescription}>{project.description}</span>
    </button>)}</div>}
    <dialog ref={dialogRef} className={styles.projectDialog} aria-labelledby={titleId}
      aria-describedby={descriptionId} onClose={() => setSelected(null)}
      onCancel={() => setSelected(null)}
      onClick={event => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) setSelected(null);
      }}>
      {selected && <div className={styles.dialogContent}>
        <button ref={closeRef} type="button" className={styles.dialogClose} aria-label="프로젝트 상세 닫기" onClick={() => setSelected(null)}>×</button>
        <p className={styles.period}>{selected.period}</p>
        <h3 id={titleId}>{selected.title}</h3>
        {selected.organization && <p className={styles.projectOrganization}>{selected.organization}</p>}
        <p id={descriptionId} className={styles.dialogDescription}>{selected.description}</p>
        <div className={styles.projectBody}><h4>담당 역할</h4>
          <ul className={styles.bullets}>{selected.role.map(role => <li key={role}>{role}</li>)}</ul>
          <ul className={styles.tags} aria-label="기술 스택">{selected.stack.map(item => <li key={item}>{item}</li>)}</ul>
          <ProjectMedia key={selected.title} title={selected.title} video={selected.video} image={selected.image} />
          <a className={styles.source} href={selected.url} target="_blank" rel="noopener noreferrer">프로젝트 자세히 보기 ↗</a>
        </div>
      </div>}
    </dialog>
  </>;
}
