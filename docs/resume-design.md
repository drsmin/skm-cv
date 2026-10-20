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
profile.contact    { email, phone }
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

- **화면:** A4 용지 모양의 한 장. 왼쪽 칸에 절 제목(한글 + 영문 부제), 오른쪽에 본문. 720px 이하에서는 한 단.
- **PDF:** 도구 막대의 「PDF로 저장 · 인쇄」가 `window.print()` 를 부른다. 브라우저 인쇄 창에서
  「PDF로 저장」을 고르면 된다. 기본 파일 이름은 `document.title`(`송강민_이력서`).
- **인쇄 CSS:** `@page` A4·여백 14/15/15mm·쪽 번호(`@bottom-right`, Chrome 131+). 9.6pt, 항목은
  쪽 사이에서 쪼개지 않음(`break-inside: avoid`), 포트폴리오는 새 쪽에서 시작. 「포트폴리오 포함」을 끄면 이력서만 인쇄.
- **폰트:** Pretendard 1.3.9 정적 subset(KS X 1001 한글 + 라틴) 4굵기(400·500·600·700)를 `resume/fonts/pretendard/`
  에 둔다(OFL, 약 1MB). 외부 CDN 없이 동작하고, 정적 폰트라 PDF 에 CID TrueType 으로 박힌다(가변 폰트는 Type 3 로 박혀 품질이 떨어진다).
  `data.json` 에 KS X 1001 밖 한글을 쓰면 그 글자만 대체 폰트로 나온다.
