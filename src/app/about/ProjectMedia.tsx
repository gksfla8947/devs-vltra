"use client";
import { useState } from "react";
import styles from "./about.module.css";

export default function ProjectMedia({ title, video, image }: { title: string; video?: string; image?: string }) {
  const [playing, setPlaying] = useState(false);
  if (video) return <div className={styles.media}>
    {playing ? <iframe src={`https://www.youtube-nocookie.com/embed/${video}`} title={`${title} 시연 영상`} allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
      : <button type="button" onClick={() => setPlaying(true)}><span aria-hidden="true">▷</span> {title} 시연 영상 보기</button>}
    <a href={`https://youtu.be/${video}`} target="_blank" rel="noopener noreferrer">YouTube에서 보기 ↗</a>
  </div>;
  // eslint-disable-next-line @next/next/no-img-element
  return image ? <img className={styles.projectImage} src={image} alt={`${title} 프로젝트 화면`} loading="lazy" />
    : <div className={styles.placeholder}>프로젝트 이미지 준비 중</div>;
}
