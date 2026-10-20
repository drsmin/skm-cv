# Session Log

작업 이력. 최신 항목을 위에 추가한다. (Work history; newest entry on top.)
**항목당 15줄 이내.** 최근 12개만 여기 두고 나머지는 `docs/archive/` 로 회전한다.

---

## 2026-10-20 (04) — 이력서 편집 페이지

**요청.** 편집 결과를 GitHub 에 바로 저장, 토큰은 어디에도 저장하지 않기(gh 는 브라우저에서 불가).
**작업.** `resume/edit.html`·`edit.js`·`edit.css` — 폼 편집·순서 변경·추가·삭제, Contents API PUT, 원격 변경 시 확인창, JSON 내려받기, CSP. D-005.
Playwright 로 API 를 가로채 확인: 무수정 왕복 동일·수정 반영·401 메시지·storage 0·가로 넘침 없음.

## 2026-10-20 (03) — 이력서 보기 페이지

**작업.** `resume/index.html` + `render.js`·`style.css` — `data.json` 을 그린다. 바닐라 JS, 다크 모드·모바일·인쇄(A4) 대응.
Playwright 로 데스크톱·모바일·다크 확인(콘솔 오류 0, 가로 넘침 없음). 추출 때 빠진 소개 첫 문단을 `data.json` 에 보충.

## 2026-10-20 (02) — 이력서 데이터 형식

**요청.** 다음 작업(이력서 관리 페이지 구조·데이터 형식) 진행.
**작업.** 데이터 파일 하나 + 보기·편집 페이지 구조로 결정(D-004, `docs/resume-design.md`).
원본 두 페이지에서 프로필·기술 10·포부 4·프로젝트 20·트러블슈팅 5·개인 개발 3 을 `resume/data.json` 으로 추출.

## 2026-10-20 (01) — 프로젝트 부트스트랩

**요청.** skmskills 의 `bootstrap-docs-workflow` 로 문서 기반 작업 규율 적용.
**작업.** docs/ 구조(current-task·session-log·decisions·todo·recovery·context-budget) +
CLAUDE.md 규칙 허브 + 컨텍스트 예산 안전장치(`scripts/`, pre-commit 훅, `.claude/settings.json` 훅) 생성.
기존 `cv.html`·`portfolio.html` 은 건드리지 않음(D-003). docs·scripts 는 Pages 빌드에서 제외(`_config.yml`).
가드의 압축판 조각 검사(`printf | grep -q` + pipefail)가 간헐적으로 거짓 HARD → here-string 으로 고침.
