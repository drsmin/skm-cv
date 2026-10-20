# Session Log

작업 이력. 최신 항목을 위에 추가한다. (Work history; newest entry on top.)
**항목당 15줄 이내.** 최근 12개만 여기 두고 나머지는 `docs/archive/` 로 회전한다.

---

## 2026-10-20 (01) — 프로젝트 부트스트랩

**요청.** skmskills 의 `bootstrap-docs-workflow` 로 문서 기반 작업 규율 적용.
**작업.** docs/ 구조(current-task·session-log·decisions·todo·recovery·context-budget) +
CLAUDE.md 규칙 허브 + 컨텍스트 예산 안전장치(`scripts/`, pre-commit 훅, `.claude/settings.json` 훅) 생성.
기존 `cv.html`·`portfolio.html` 은 건드리지 않음(D-003). docs·scripts 는 Pages 빌드에서 제외(`_config.yml`).
가드의 압축판 조각 검사(`printf | grep -q` + pipefail)가 간헐적으로 거짓 HARD → here-string 으로 고침.
