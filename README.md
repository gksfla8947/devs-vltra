# DEVS VLTRA

**Simple, but Structured.**

배우고 경험한 내용을 기록하는 기술 블로그이자 포트폴리오입니다. 글 작성부터 이미지 업로드, 게시 상태 관리, 방문 통계까지 웹 관리자 화면에서 운영합니다.

**사이트:** [devs-vltra.com](https://devs-vltra.com) · **소개:** [About](https://devs-vltra.com/about)

## 주요 기능

- **글 탐색:** 최신 글 캐러셀, 카테고리·검색, 카드·리스트 보기, 더보기와 목록 상태·스크롤 복원
- **글 읽기:** 본문 목차, 코드 강조·복사, Mermaid 다이어그램, 댓글, PDF 내보내기
- **글 작성:** BlockNote 블록 에디터, 이미지 업로드, 본문 이미지 선택·직접 업로드를 통한 썸네일 설정, 브라우저 임시 저장
- **관리:** 공개·비공개 전환, 여러 글 선택 후 일괄 상태·카테고리 변경 및 삭제
- **통계:** 오늘·어제·누적 조회수와 방문자, 일간·주간·월간 차트
- **소개:** 학력·경력·기술 스택·수상 이력과 프로젝트 상세 팝업
- **운영:** 라이트·다크 테마, 공개 글 기반 사이트맵, 페이지별 canonical URL

## 기술 구성

| 영역 | 구성 |
| --- | --- |
| 웹 | Next.js 16.2.3 App Router, React 19.2.4, TypeScript |
| 스타일 | Tailwind CSS 4, CSS Modules, next-themes |
| 에디터 | BlockNote 0.47, Mantine 8, Mermaid |
| 데이터베이스 | Neon PostgreSQL, Drizzle ORM |
| 이미지 저장 | Vercel Blob |
| 조회·방문 집계 | Upstash Redis |
| 인증 | 관리자 비밀번호·JWT, 댓글용 Auth.js Google·GitHub OAuth |
| 배포 | Vercel, GitHub `master` 브랜치 연동 |

## 로컬 실행

Node.js **20.9 이상**과 npm을 사용합니다. DB·Redis·Blob은 외부 서비스를 연결하므로 로컬 실행에도 해당 환경변수가 필요합니다.

```bash
git clone https://github.com/gksfla8947/devs-vltra.git
cd devs-vltra
npm ci
```

프로젝트 루트에 `.env.local`을 작성합니다. 실제 접속 정보와 비밀번호는 Git에 올리지 않습니다.

```dotenv
# Neon PostgreSQL
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require

# 관리자 로그인: /manage/login
ADMIN_PASSWORD=replace-with-an-admin-password
JWT_SECRET=replace-with-a-random-secret

# Vercel Blob
BLOB_READ_WRITE_TOKEN=replace-with-a-blob-token

# Upstash Redis
KV_REST_API_URL=https://YOUR-REDIS-ENDPOINT
KV_REST_API_TOKEN=replace-with-a-redis-token

# Auth.js: 댓글 사용자 로그인
AUTH_SECRET=replace-with-another-random-secret
AUTH_GOOGLE_ID=replace-with-a-google-client-id
AUTH_GOOGLE_SECRET=replace-with-a-google-client-secret
AUTH_GITHUB_ID=replace-with-a-github-client-id
AUTH_GITHUB_SECRET=replace-with-a-github-client-secret
```

OAuth 제공자에는 실행 주소에 맞는 콜백 URL을 등록합니다. 기본 로컬 주소 기준으로 Google은 `http://localhost:3000/api/auth/callback/google`, GitHub는 `http://localhost:3000/api/auth/callback/github`입니다. 포트를 바꾸면 콜백 URL도 함께 바꿉니다. 댓글용 OAuth와 관리자 비밀번호 로그인은 별도 인증입니다.

새 DB를 구성할 때는 환경변수를 설정한 뒤 마이그레이션을 적용합니다. 기존 운영 DB를 연결하는 경우에는 적용 이력을 먼저 확인합니다.

```bash
npx dotenv -e .env.local -- drizzle-kit migrate
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인합니다. 다른 포트를 사용하려면 다음처럼 실행합니다.

```bash
npm run dev -- --port 3001
```

관리 화면은 `/manage`, 새 글 작성은 `/manage/new-post`에 있습니다. 로컬 관리자 비밀번호는 `.env.local`의 `ADMIN_PASSWORD`를 사용하며, Vercel 운영 환경의 값과 다를 수 있습니다.

## 개발 명령어

| 명령어 | 용도 |
| --- | --- |
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드와 TypeScript 검사 |
| `npm start` | 빌드된 사이트 실행 |
| `npm run lint` | ESLint 검사 |
| `node --import tsx --test src/lib/stats-date.test.ts` | 한국 시간·기간별 통계 합산 테스트 |

`npm start`로 로컬 프로덕션 서버를 실행할 때 Auth.js의 `UntrustedHost` 오류가 발생하면, 신뢰하는 로컬 환경에 한해 `AUTH_TRUST_HOST=true`를 설정합니다.

## 프로젝트 구조

```text
src/
├── app/
│   ├── about/                # 소개와 포트폴리오
│   ├── api/                  # 댓글, 관리, 업로드, 통계 API
│   ├── manage/               # 관리자 로그인·글 작성·수정
│   ├── posts/[slug]/         # 게시글 상세
│   ├── globals.css           # 공통 스타일과 테마
│   ├── robots.ts
│   └── sitemap.ts
├── components/
│   ├── editor/               # 에디터와 커스텀 블록
│   ├── manage/               # 글 관리와 통계 화면
│   └── post/                 # 본문 목차와 글 탐색
├── hooks/                    # 임시 저장과 목록 상태 복원
├── lib/
│   ├── db/                   # DB 연결·스키마·재시도 처리
│   ├── posts.ts              # 글 조회와 캐시
│   ├── redis.ts              # Redis 연결
│   └── site.ts               # 대표 도메인
└── proxy.ts                  # 관리자 화면 접근 제어
drizzle/                      # DB 마이그레이션 이력
scripts/                      # 백업·복구·아이콘 생성
public/                       # 아이콘, 기관 로고, 포트폴리오 이미지
```

## 데이터와 저장 방식

### 게시글

`posts.content`의 **BlockNote JSON이 본문 원본**입니다. 작성·수정과 본문 표시에 사용합니다. `content_html`은 저장 시 함께 생성하는 HTML로, 기존 글의 편집 복원과 썸네일 자동 추출 등에 사용합니다.

`cover_image`에 지정한 썸네일이 있으면 이를 우선 사용하고, 없으면 본문 HTML의 첫 이미지를 사용합니다. 글 목록·상세 조회는 기본 1시간 캐시하며, 관리자에서 글을 변경하면 관련 캐시와 사이트맵을 갱신합니다.

임시글은 DB가 아닌 **해당 브라우저의 localStorage**에 저장합니다. 브라우저 데이터를 지우거나 다른 기기로 접속하면 임시글을 사용할 수 없습니다.

### 이미지

이미지 원본은 Vercel Blob에, URL·경로·크기 등의 메타데이터는 `blob_files`에 저장합니다. 새 업로드 경로는 다음과 같습니다.

```text
devs-vltra/{postSlug 또는 uploads}/{UUID}.{확장자}
```

새 글 작성 중에는 연결할 게시글이 아직 없어 `blob_files.post_slug`가 비어 있을 수 있습니다. 이 값이 비어 있거나 옛 경로를 사용한다는 이유만으로 파일이 미사용 상태라고 판단할 수는 없습니다. 정리할 때는 본문과 썸네일의 URL 참조를 함께 확인합니다.

### 방문 통계

한국 시간 기준으로 조회수는 브라우저별 글당 하루 1회, 방문자는 브라우저별 하루 1회 집계합니다. 중복 판정에는 localStorage를 사용합니다. 누적 방문자는 일별 방문자의 누적이며, 서로 다른 사람의 정확한 수를 뜻하지 않습니다.

기간별 기록을 수집하기 전의 날짜는 미집계로 표시합니다. 관리자·개발용 확인 화면은 방문자 집계 대상에서 제외합니다.

## 백업과 복구

다음 명령은 `.env.local`의 DB에서 **게시글과 Blob 메타데이터**를 내보냅니다. `--images` 옵션은 메타데이터에 등록된 활성 Blob 파일도 내려받습니다.

```bash
# 데이터 백업
npm run backup

# 데이터와 이미지 백업
npm run backup:images

# 기존 백업과 분리해 보관
npm run backup:images -- --out backups/manual-backup-001
```

기본 결과는 `backups/backup-YYYY-MM-DD.json`과 `backups/images/`입니다. 날짜는 스크립트의 UTC 기준이며, 같은 날짜·출력 폴더로 실행하면 JSON을 덮어쓰므로 별도 보관 시 `--out`에 새 폴더를 지정합니다.

백업 범위에 **댓글, 로그인 계정, Redis 통계, 브라우저 임시글은 포함되지 않습니다.** 이미지 다운로드 후에는 실패 건수와 파일 상태를 확인합니다. `backups/`는 Git 추적 대상에서 제외됩니다.

복구 전에는 먼저 실행 계획을 확인합니다.

```bash
npm run restore:dry -- backups/backup-YYYY-MM-DD.json

# 없는 글만 추가
npm run restore -- backups/backup-YYYY-MM-DD.json

# 기존 글도 덮어쓰기
npm run restore -- backups/backup-YYYY-MM-DD.json --overwrite
```

현재 복구 스크립트는 **게시글만 복구**합니다. Blob 파일 재업로드와 `blob_files` 복구는 별도 작업이며, 기존 글 덮어쓰기에는 `cover_image` 갱신이 포함되지 않습니다.

## 배포와 검색 설정

현재 GitHub `master` 브랜치에 푸시하면 Vercel 배포가 시작됩니다. 운영 환경에는 필요한 환경변수를 별도로 등록합니다. 푸시 후에는 Vercel의 배포 성공 여부와 실제 사이트 반영을 확인합니다.

대표 도메인은 `src/lib/site.ts`의 `SITE_URL`에서 관리합니다. 도메인을 변경하면 Vercel 도메인 설정과 OAuth 제공자의 운영 콜백 URL도 함께 확인합니다.

- 사이트맵: [https://devs-vltra.com/sitemap.xml](https://devs-vltra.com/sitemap.xml)
- 검색 로봇 설정: [https://devs-vltra.com/robots.txt](https://devs-vltra.com/robots.txt)

사이트맵에는 홈·소개·공개 게시글이 포함됩니다. 관리자에서 글을 작성·수정·삭제하거나 공개 상태를 변경하면 자동 갱신하므로, 글마다 사이트맵을 직접 수정할 필요는 없습니다. 게시글의 `lastModified`는 현재 작성일(`date`)을 사용합니다.