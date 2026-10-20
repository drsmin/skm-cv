# TODO

전체 작업 목록. `[x]` 완료, `[ ]` 미완, `[~]` 진행중.
완료된 Phase 는 `docs/archive/todo-done.md` 로 회전한다.

## ★ Phase 1. 이력서 관리 페이지 — **현재 Phase**
- [x] 구조·데이터 형식 정하기 (D-004, `docs/resume-design.md`)
- [x] 원본 내용을 `resume/data.json` 으로 옮기기
- [x] 보기 페이지 `resume/index.html` (+ `render.js`·`style.css`, 다크·모바일·인쇄)
- [x] 편집 페이지 `resume/edit.html` — GitHub 바로 저장 (D-005)
- [ ] 실제 토큰으로 편집 페이지 저장 한 번 확인
- [x] 디자인 개편 · 인쇄/PDF 최적화 · Pretendard (D-006)
- [ ] 폰트 최종 선택 확인 (후보: Pretendard · 고딕+명조 · IBM Plex Sans KR)

## Phase 0. 기반
- [x] 문서 구조 생성 (current-task / session-log / decisions / todo / recovery / context-budget)
- [x] 컨텍스트 예산 안전장치 — `session-brief.sh` + `check-docs-budget.sh` + pre-commit 훅 (D-002)
