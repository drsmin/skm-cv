# Session Log

작업 이력. 최신 항목을 위에 추가한다. (Work history; newest entry on top.)
**항목당 15줄 이내.** 최근 12개만 여기 두고 나머지는 `docs/archive/` 로 회전한다.

---

## 2026-10-20 (09) — 내용 다듬기 · 오래된 프로젝트 한 줄로

**요청.** 마이데이터 경력·소개글·AI 기술·홈랩 에이전트 추가, 트렌드에 안 맞는 부분 정리.
**작업.** 내용은 master 에 바로(경력·소개·기술 순서·목표 말투·표기). 화면은 PR: 끝난 지 12년 넘은 프로젝트를 「이전 프로젝트」 한 줄 목록으로. PDF 5쪽/3쪽.

## 2026-10-20 (08) — 보기 페이지 디자인: Jake's Resume 형식

**요청.** 디자인이 투박하니 인기 디자인을 참고해 꾸며 달라. 첫 안(그라데이션 띠·칩·지표 타일)은 「흔한 AI 스타일」이라 반려 → 카드에서 Jake's Resume형 선택.
**작업.** `render.js`·`style.css` 를 한 단·가로줄 절 제목·제목/날짜 두 줄 항목으로. 데이터 형식·편집 페이지는 그대로. 빽빽하다는 의견에 간격·줄 간격(1.7)·여백을 넓힘 → PDF 6쪽/4쪽. 편집 페이지 테스트 통과.

## 2026-10-20 (07) — 휴대폰 번호 가리기

**요청.** 공개 이력서의 개인정보 정리 → 「가리기 + 원본도」 선택.
**작업.** `data.json`·원본 `cv.html`·PDF 의 번호를 `+82 10-****-7377` 로, 가린 번호는 전화 링크 없음. D-008(D-003 예외). 이어서 git-filter-repo 로 전 기록에서 번호 제거 후 강제 push(해시 전부 바뀜).

## 2026-10-20 (06) — PDF 자동 생성

**요청.** 인쇄 설정에 따라 PDF 가 달라지지 않는 다른 방법.
**작업.** `scripts/build-pdf.mjs`(Playwright, 고정 설정) + `.github/workflows/resume-pdf.yml`(master `resume/` 변경 시 재생성·커밋).
보기 페이지에 「PDF 다운로드」(포트폴리오 포함/제외 2종). 로컬 생성 확인(6쪽/4쪽, TrueType 임베드), 폰트 미로딩 시 실패 확인. D-007.

## 2026-10-20 (05) — 디자인 개편 · 인쇄/PDF · 폰트

**요청.** 새 디자인, 인쇄에 최적화된 PDF 내보내기, 폰트 추천.
**작업.** 보기 페이지를 A4 용지형(제목 칸 + 본문)으로 개편, 인쇄 CSS(쪽 번호·쪽 나눔·포트폴리오 새 쪽)와 「PDF로 저장」 버튼·포트폴리오 토글.
Pretendard 정적 subset 4굵기를 저장소에 둠(PDF 에 TrueType 임베드 확인, 가변판은 Type 3 라 버림). D-006.
확인: Chrome PDF A4 6쪽(포트폴리오 빼면 4쪽), 모바일·다크 가로 넘침 없음, 편집 페이지 왕복 테스트 통과.

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
