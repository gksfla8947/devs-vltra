import type { Metadata } from "next";
import { career, projects, skills } from "./profile";
import ProjectCards from "./ProjectCards";
import AboutToc from "./AboutToc";
import OrganizationLogo from "./OrganizationLogo";
import styles from "./about.module.css";

export const metadata: Metadata = { title: "김한림 소개", description: "개발, 품질 검증, 형상관리와 DevOps 인프라를 연결하는 엔지니어 김한림의 경험과 프로젝트입니다.", alternates: { canonical: "/about" } };

function Tags({ items }: { items: string[] }) {
  return <ul className={styles.tags} aria-label="기술 스택">{items.map(item => <li key={item}>{item}</li>)}</ul>;
}

export default function AboutPage() {
  return <div className={`about-shell ${styles.page}`}>
    <header className={styles.hero}>
      <p className={styles.eyebrow}>ABOUT / ENGINEERING & GROWTH</p>
      <h1>김한림 <span>Hanrim Kim</span></h1>
      <p className={styles.lead}>Simple, but Structured</p>
      <div className={styles.description}>
        <p>복잡한 구조를 단순하게 정리하고, 자동화를 통해 개발 효율을 높이는 엔지니어입니다. 백엔드 개발부터 CI/CD, 형상관리, 개발 프로세스와 AWS까지 다양한 영역을 경험하며, 코드와 시스템의 유지보수성을 높이는 방법을 고민해 왔습니다.</p>
        <p>백엔드 개발과 함께 여러 프로젝트의 형상·빌드·산출물 관리 체계를 구축·운영했습니다. 반복 작업을 줄이고 개발 환경을 표준화하면서, 코드 품질과 업무 프로세스를 개선해 시스템의 유지보수성을 높이는 일의 가치를 배웠습니다.</p>
        <p>사용하는 사람은 쉽게 이해할 수 있고, 이를 뒷받침하는 구조는 체계적인 시스템과 프로세스를 만드는 것이 제 철학입니다. 성능과 효율성을 챙기면서도 이해하고 유지보수하기 쉬운 구조를 지향합니다.</p>
        <p>새로운 기술은 실제 문제를 해결하는 데 어떻게 활용할 수 있는지 살피고 적용합니다. 개발자에게는 편리한 작업 환경을, 사용자에게는 안정적이고 편리한 서비스를 제공하는 것을 목표로 합니다.</p>
      </div>
      <nav className={styles.contacts} aria-label="연락처">
        <a href="https://www.linkedin.com/in/khrim123/" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.45 2H3.55A1.55 1.55 0 0 0 2 3.55v16.9A1.55 1.55 0 0 0 3.55 22h16.9A1.55 1.55 0 0 0 22 20.45V3.55A1.55 1.55 0 0 0 20.45 2ZM7.93 18.75H4.98V9.2h2.95ZM6.46 7.9a1.71 1.71 0 1 1 0-3.42 1.71 1.71 0 0 1 0 3.42Zm12.29 10.85H15.8v-4.65c0-1.11-.02-2.54-1.55-2.54-1.55 0-1.79 1.21-1.79 2.46v4.73H9.51V9.2h2.83v1.3h.04c.39-.74 1.36-1.52 2.8-1.52 2.99 0 3.57 1.97 3.57 4.53Z" /></svg>LinkedIn ↗</a>
        <a href="https://github.com/gksfla8947" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .75a11.25 11.25 0 0 0-3.558 21.923c.563.104.768-.244.768-.542v-2.095c-3.13.68-3.79-1.327-3.79-1.327-.512-1.3-1.25-1.646-1.25-1.646-1.022-.7.078-.685.078-.685 1.13.08 1.725 1.16 1.725 1.16 1.005 1.722 2.637 1.224 3.28.936.102-.728.394-1.224.716-1.506-2.498-.284-5.124-1.25-5.124-5.563 0-1.229.44-2.233 1.16-3.02-.116-.285-.502-1.43.11-2.98 0 0 .945-.303 3.095 1.154A10.8 10.8 0 0 1 12 6.18c.956.004 1.918.129 2.817.379 2.148-1.457 3.09-1.154 3.09-1.154.615 1.55.229 2.695.113 2.98.722.787 1.158 1.791 1.158 3.02 0 4.324-2.63 5.276-5.136 5.555.404.35.764 1.04.764 2.098v3.073c0 .3.203.65.774.54A11.25 11.25 0 0 0 12 .75Z" /></svg>GitHub ↗</a>
        <a href="mailto:khrim123@gmail.com"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 6 9 7 9-7" /></svg>khrim123@gmail.com</a>
        <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>Seoul, Korea</span>
      </nav>
    </header>
    <blockquote className={styles.quote}>
      <p className={styles.quoteTitle}><strong>PLVS VLTRA — 보다 더 멀리</strong></p>
      <p>이 블로그는 제가 배우고 경험한 것들에 대해 정리한 공간입니다.</p>
      <p>블로그의 이름인 DEVS VLTRA는 ‘보다 더 멀리’를 뜻하는 라틴어 문구 PLVS VLTRA에 Develop을 더한 이름입니다. 현재에 안주하지 않고, 배움과 경험을 쌓아 한 걸음 더 나아가려는 마음을 담았습니다.</p>
    </blockquote>
    <AboutToc />
    <section id="education" tabIndex={-1} className={styles.section}>
      <p className={styles.eyebrow}>01 / EDUCATION</p><h2>학력</h2>
      <div className={styles.education}><div className={styles.organizationInfo}><OrganizationLogo organization="kookmin" /><div><h3>국민대학교</h3><p>소프트웨어전공 · 학사</p></div></div><span>2020.03 — 2027.02 (예정)</span></div>
    </section>
    <section id="career" tabIndex={-1} className={styles.section}>
      <p className={styles.eyebrow}>02 / EXPERIENCE</p><h2>경력</h2>
      <p className={styles.hint}>각 경력 선택 시 상세사항을 확인할 수 있습니다.</p>
      <ol className={styles.timeline}>{career.map(item => <li key={`${item.company}-${item.period}`}>
        <p className={styles.period}>{item.period}</p>
        <details className={styles.detail}><summary><span className={styles.company}><OrganizationLogo organization={item.organization} />{item.company}<span className={styles.employment}>{item.employment}</span></span><h3>{item.title}</h3><p>{item.summary}</p><span className={styles.expand} aria-hidden="true">+</span></summary>
          <div className={styles.detailBody}>{item.roles.map(role => <div className={styles.careerRole} key={role.title}>
            <p className={styles.period}>{role.period}</p>
            {role.sections ? role.sections.map(section => <div className={styles.roleSection} key={section.title}>
              <h4>{section.title}</h4>
              <ul className={styles.bullets}>{section.details.map(text => <li key={text}>{text}</li>)}</ul>
            </div>) : <><h4>{role.title}</h4><ul className={styles.bullets}>{role.details.map(text => <li key={text}>{text}</li>)}</ul></>}
            <Tags items={role.stack} />
          </div>)}</div>
        </details>
      </li>)}</ol>
    </section>
    <section id="skills" tabIndex={-1} className={styles.section}>
      <p className={styles.eyebrow}>03 / TOOLKIT</p><h2>기술 스택</h2>
      <div className={styles.skillGroups}>{skills.map(group => <div className={styles.skillGroup} key={group.category}>
        <h3>{group.category}</h3>
        <Tags items={group.items} />
      </div>)}</div>
    </section>
    <section id="awards" tabIndex={-1} className={styles.section}>
      <p className={styles.eyebrow}>04 / AWARDS</p><h2>수상</h2>
      <div className={styles.award}><OrganizationLogo organization="kookmin" /><div><h3>다학제간캡스톤디자인 금상</h3><p>국민대학교 · 2026.05</p><p>AI 기반 소프트웨어 기획·설계 지원 플랫폼 개발</p><ProjectCards projects={projects.filter(project => project.title === "Poco")} variant="link" /></div></div>
    </section>
    <section id="projects" tabIndex={-1} className={styles.section}>
      <p className={styles.eyebrow}>05 / SELECTED PROJECTS</p><h2>프로젝트</h2>
      <p className={styles.hint}>교내/실무에서 진행한 프로젝트를 소개합니다. 클릭 시 상세 내용을 확인할 수 있습니다.</p>
      <ProjectCards projects={projects.filter(project => project.title === "Poco")} />
    </section>
  </div>;
}
