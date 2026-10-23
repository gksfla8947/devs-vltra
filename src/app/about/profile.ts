// Career, education and award: supplied resume. Skills and projects: Notion portfolio.
// To add media, place a file in public/portfolio and set image: "/portfolio/name.png".
export type Project = { title: string; period: string; description: string; role: string[]; stack: string[]; url: string; organization?: string; video?: string; image?: string };
const careerProjects = [
  {
    period: "2024.08 — 2026.02",
    company: "아우토크립트",
    title: "차량 SW 형상관리 및 DevOps",
    summary: "형상관리·릴리스 운영과 개발·빌드 인프라 구축 및 표준화",
    stack: ["Git", "Bitbucket", "Jira", "Confluence", "Jenkins", "Docker", "VMware", "Nexus Repository", "Python", "Linux"],
    details: [],
    sections: [{ title: "차량 ECU 보안 SW 형상관리", details: [
      "5개 이상의 자동차 SW 프로젝트와 10개 이상의 ECU를 대상으로 형상관리 수행",
      "총 42회의 Baseline 수립과 28회의 내부 배포 진행",
      "저장소·브랜치 전략을 수립하고 개발 산출물과 릴리스 이력 관리",
    ] }, { title: "자동차 SW 개발·빌드 인프라 구축", details: [
      "20개 이상의 SW 프로젝트를 지원하는 Docker·VMware 기반 격리 빌드 환경과 Jenkins CI/CD 파이프라인 구축·운영",
      "Nexus Repository 기반 산출물 관리 및 백업·복구 체계 운영",
      "산출물 업로드·다운로드 지원 웹서비스와 OAuth 2.0 인증 연동 경험",
      "빌드·배포 과정의 반복 작업을 자동화하고 개발 환경 표준화",
    ] }],
  },
  {
    period: "2023.09 — 2024.07",
    company: "아우토크립트",
    title: "차량용 Fuzzing 및 통합 테스팅 플랫폼 백엔드 개발",
    summary: "차량 보안 테스팅 플랫폼 백엔드 개발 및 유지보수",
    stack: ["Python", "FastAPI", "C#", "ASP.NET", "gRPC", "PostgreSQL"],
    details: ["차량용 Fuzzer 파이썬 백엔드 서비스 개발", "차량용 통합 보안 테스팅 플랫폼 ASP.NET 백엔드 개발"],
  },
  { period: "2023.03 — 2023.08", company: "윈스테크넷 · 인턴", title: "SIEM 솔루션 테스트 자동화", summary: "품질 검증 자동화 시스템과 CI/CD 기반 테스트 환경 구축", stack: ["GitLab CI", "Python", "Robot Framework", "Playwright", "Shell Script", "VMware"], details: ["SIEM 솔루션의 테스트 프로세스를 분석하고 가상화 테스트 환경 구축·운영", "일일 정기 테스트와 시나리오 기반 통합 테스트를 자동화하여 반복 수동 업무 개선", "테스트케이스 명세 작성 및 신규 기능의 기능·통합 테스트 수행", "Trino·PrestoDB 등 검색엔진을 검토하고 10만 건 이상의 데이터 쿼리 성능 비교"] },
];
export const career = [
  {
    company: "아우토크립트", organization: "autocrypt" as const,
    period: "2024.08 — 2026.02 · 1년 7개월",
    title: "Configuration Management & DevOps",
    summary: "프로세스팀",
    employment: "정규직",
    roles: careerProjects.filter(project => project.company === "아우토크립트" && project.period === "2024.08 — 2026.02"),
  },
  {
    company: "아우토크립트", organization: "autocrypt" as const,
    period: "2023.09 — 2024.07 · 11개월",
    title: "Backend Developer",
    summary: "백엔드개발팀",
    employment: "정규직",
    roles: careerProjects.filter(project => project.company === "아우토크립트" && project.period === "2023.09 — 2024.07"),
  },
  {
    company: "윈스테크넷", organization: "wins" as const,
    period: "2023.03 — 2023.08 · 6개월",
    title: "QA Engineer",
    summary: "서비스개발1팀",
    employment: "현장실습",
    roles: careerProjects.filter(project => project.company === "윈스테크넷 · 인턴"),
  },
];
export const skills = [
  { category: "Language", items: ["Python", "C#", "Java"] },
  { category: "Framework", items: ["FastAPI", "ASP.NET", "gRPC", "Robot Framework", "Playwright", "JUnit"] },
  { category: "Tool", items: ["Git", "Bitbucket", "GitLab", "Jenkins", "Nexus Repository", "Jira", "Confluence"] },
  { category: "Infra", items: ["Docker", "VMware", "Linux", "Nginx", "PostgreSQL", "AWS Lambda", "AWS S3", "AWS RDS", "Vercel"] },
  { category: "Other", items: ["A-SPICE", "ISO-21434", "ISO-26262", "형상관리"] },
];
const notion = (id: string) => `https://khrim123.notion.site/${id}`;
export const projects: Project[] = [
  { title: "Poco", organization: "국민대학교", period: "2026.03 — 2026.05 · 4인 팀", description: "아이디어를 기획과 설계로 발전시키는 AI 기반 사고의 캔버스. 선택과 의사결정의 흐름을 트리로 시각화합니다.", role: ["백엔드 API·DB 설계 참여 및 AI 생성 코드 검토·리팩토링", "자동 배포 파이프라인 구축, 스프린트 운영과 Git 협업 규칙 수립 주도", "AWS 연계 교내 캡스톤 디자인 프로젝트 · 다학제간캡스톤디자인 금상"], stack: ["FastAPI", "PostgreSQL", "AWS Lambda", "API Gateway", "RDS", "S3", "Bedrock"], url: "https://github.com/kookmin-sw/2026-capstone-59" },
  { title: "중고나와", period: "2022.09 — 2022.12 · 5인 팀", description: "세부 카테고리·가격·품질에 따라 상품을 비교할 수 있는 Android 중고거래 플랫폼", role: ["카테고리·세부 카테고리 화면의 기능과 디자인 구현", "서버 데이터 연동과 MVVM 패턴 적용", "최종 보고서 작성 및 발표 준비"], stack: ["Kotlin", "MVVM", "OkHTTP", "Node.js", "MySQL"], url: notion("c7c2b554e1e04f7d8b4f7c16b5aedd95"), video: "CAM2WQG4zpU" },
  { title: "탈모 디펜스 게임", period: "2022.09 — 2022.12 · 5인 팀 / 팀장", description: "몰려오는 적들로부터 중앙의 구조물을 지키는 쿼터뷰 웨이브 디펜스 게임", role: ["게임 기획, 팀 역할 분배 및 코드 통합", "게임 진행 매니저, 미니맵·아이템·플레이어 이동 및 스테이터스 구현", "애니메이션·사운드 및 UI 정리"], stack: ["Unity", "C#", "Singleton"], url: notion("2ef9fd59e4134b8792d91b4e57bcd1c4"), video: "wN1shWo4Mjk" },
  { title: "플로우 기반 악성 IP 분류", period: "2022.09 — 2022.12 · 4인 팀", description: "교내 네트워크 플로우를 분석해 악성 IP를 분류하고 F1 점수를 개선하는 머신러닝 프로젝트", role: ["IP·Port 등의 빈도 특성을 추가하는 데이터 전처리 수행", "여러 Scaler와 모델의 F1 점수 비교", "팀원별 특성 분석 결과를 비교하고 최종 전처리 방식 선정"], stack: ["Python", "scikit-learn", "Pandas", "XGBoost"], url: notion("5aee5449df474a0d861fec41e1565942") },
  { title: "리그오브레전드 통계 분석", period: "2021.03 — 2021.06 · 2인 팀 / 팀장", description: "게임 통계 데이터를 바탕으로 사용자의 티어를 예측하는 회귀 분석 프로젝트", role: ["게임 API 데이터 수집 및 목적에 맞는 데이터 변환", "회귀 모델 수정과 분석 결과 시각화"], stack: ["Python", "scikit-learn", "NumPy", "API"], url: notion("0dd3915228bf4cd29591e31167404abb"), video: "v7W0whvlHJs" },
  { title: "스네이크 게임", period: "2021.03 · 3인 팀 / 팀장", description: "ncurses를 활용해 터미널에서 플레이하는 스테이지형 스네이크 게임", role: ["클래스별 구조 설계와 역할 분배", "UI·Scene 구성, Snake 이동·아이템·충돌 처리 구현"], stack: ["C++", "ncurses"], url: notion("835438ab7e73488fb619d98857e22de0") },
  { title: "Arduino PID 제어", period: "2020.09 — 2020.12 · 개인", description: "서보모터로 판의 기울기를 조절하여 탁구공을 목표 위치에 유지하는 PID 제어 실습", role: ["Arduino와 서보모터를 이용한 제어 장치 제작", "PID 제어 로직 구현 및 실제 장치 동작 확인"], stack: ["C++", "Arduino", "PID Control"], url: notion("4ff6351d934b4887af3d0969989af029"), video: "W8ZUdVKxB1w" },
];
