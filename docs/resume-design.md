# 이력서 관리 페이지 설계

참조 문서 — 세션 시작에 읽지 않는다. 결정 근거는 D-004.

## 1. 구조

이력서 **내용은 데이터 파일 하나**에 두고, 페이지는 그 파일을 읽어 그린다. 내용을 고칠 때 HTML 을
건드리지 않는다. 원본 `cv.html`·`portfolio.html` 은 그대로 둔다(D-003).

| 파일 | 역할 |
| --- | --- |
| `resume/data.json` | 이력서 내용 전부 (아래 스키마). 원본 두 페이지에서 옮겨 왔다 |
| `resume/index.html` | 보기 페이지 — `render.js`·`style.css` 로 `data.json` 을 그린다 |
| `resume/edit.html` | 편집 페이지(`edit.js`·`edit.css`) — 항목 추가·수정·삭제·순서 변경 후 GitHub 에 바로 커밋(D-005) 또는 JSON 내려받기 |

정적 사이트(GitHub Pages)라 빌드 단계·서버가 없다. 외부 라이브러리 없이 HTML·CSS·바닐라 JS 로 만든다.
공개 주소는 `https://cv.drs.pe.kr/resume/` 가 된다.

## 2. 데이터 형식 (`resume/data.json`)

JSON 을 고른 이유: 브라우저가 라이브러리 없이 읽고 쓰며, 편집 페이지가 그대로 내보낼 수 있다.

```text
updated            "YYYY-MM-DD"            마지막 수정일
profile.name       "송강민"
profile.nameEn     "Kang-min Song"
profile.intro      [문단, …]               자기소개
profile.contact    { email(쉼표로 여러 개), phone }
skills[]           { name, description }   보유 기술 / 플랫폼
goals[]            문장                      목표 및 포부 (순서 = 번호)
projects[]         { title, type, start, end, summary, role, tech[] }
                   start·end 는 "YYYY-MM", end 가 null 이면 「현재」. 최신이 위.
portfolio.troubleshooting[]  { title, problem[], cause[], solution[] }   문제 → 원인 → 해결
portfolio.works[]            { title, type, description[] }              개인 개발
```

- 날짜는 원본의 `2019. 04` 같은 표기를 `2019-04` 로 맞췄다. 화면에 보일 때 다시 `2019.04` 로 그린다.
- 원본에서 빈 칸이던 `summary` 는 빈 문자열로 둔다.

## 3. 디자인 · 인쇄 · 폰트 (D-006)

- **화면 (2026-10-20 개편):** Jake's Resume(개발자 이력서 LaTeX 템플릿) 배치 — 한 단, 가운데 이름 + `|` 로 나눈 연락처 한 줄,
  가로줄 절 제목, 항목은 굵은 제목 | 유형 ··· 오른쪽 기간, 둘째 줄 기술 ··· 근무 기간, 글머리표 세부. 색은 쓰지 않고(도구 막대 제외),
  Pretendard 에 이탤릭이 없어 원본의 기울임은 회색으로 대신한다. 한글은 원본보다 간격을 넓게(본문 줄 간격 1.7). 끝난 지 12년이 넘은 프로젝트는 「이전 프로젝트」에 한 줄씩(`render.js` 의 `OLD_YEARS`). 다크·720px 이하에서는 날짜를 제목 아래로.
- **PDF (D-007):** 「PDF 다운로드」는 미리 만든 `resume/pdf/resume.pdf`(포트폴리오 포함)·`resume-only.pdf` 를
  내려준다. `scripts/build-pdf.mjs` 가 headless Chrome 으로 인쇄 CSS 를 고정 설정으로 찍고, GitHub Actions
  (`.github/workflows/resume-pdf.yml`)가 master 의 `resume/` 가 바뀔 때마다 다시 만들어 커밋한다. 「인쇄」 버튼은 종이 인쇄용으로 남겼다.
- **인쇄 CSS:** `@page` A4·여백 16/17/16mm·쪽 번호(`@bottom-right`, Chrome 131+). 10pt, 항목은
  쪽 사이에서 쪼개지 않음(`break-inside: avoid`), 쪽 구성은 1쪽 소개·목표, 2쪽부터 보유 기술·프로젝트 이력, 포트폴리오는 새 쪽에서 시작. 「이전 프로젝트」 목록은 쪽 사이에서 자르지 않음. 「포트폴리오 포함」을 끄면 이력서만 인쇄.
- **폰트:** Pretendard 1.3.9 정적 subset(KS X 1001 한글 + 라틴) 4굵기(400·500·600·700)를 `resume/fonts/pretendard/`
  에 둔다(OFL, 약 1MB). 외부 CDN 없이 동작하고, 정적 폰트라 PDF 에 CID TrueType 으로 박힌다(가변 폰트는 Type 3 로 박혀 품질이 떨어진다).
  `data.json` 에 KS X 1001 밖 한글을 쓰면 그 글자만 대체 폰트로 나온다.
