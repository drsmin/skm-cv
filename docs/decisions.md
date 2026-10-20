# Design Decisions

설계·방향 결정 기록. 각 결정은 무엇을·왜. 되돌리기 어려운 작업도 여기 남긴다.
(Each decision records the *what* and the *why*; irreversible actions belong here too.)

**세션 시작 시에는 아래 인덱스 표만 읽는다.** 본문은 `docs/decisions/<ID>.md` 에 하나씩 있다 —
필요한 ID 의 **그 파일만** 연다. 새 결정은 파일을 만들고(본문 20줄 이내) 표 **맨 위**에 한 줄.
이 기록은 아카이브로 회전하지 않는다 — 근거를 잃으면 다음 세션이 같은 논쟁을 반복한다.
정책: `docs/context-budget.md` §5.

## 인덱스 (최신이 위)

| D | 결정 | 상태 |
| --- | --- | --- |
| D-006 | PDF 는 브라우저 인쇄 + A4 인쇄 CSS, 폰트는 Pretendard 정적 subset 을 저장소에 | 유효 |
| D-005 | 편집 페이지는 GitHub API 로 바로 커밋, 토큰은 저장하지 않는다 | 유효 |
| D-004 | 이력서 내용은 resume/data.json 하나에 두고 보기·편집 페이지가 읽는다 | 유효 |
| D-003 | 기존 cv.html·portfolio.html 은 원본으로 보존, 새 작업은 별도 파일로 | 유효 |
| D-002 | 컨텍스트 예산 안전장치 — 브리핑 스크립트 + 캡 + 회전 | 유효 |
| D-001 | 문서 기반 작업 규율 채택 | 유효 |

> 번호는 재사용하지 않는다. 뒤집힌 결정은 지우지 않고 상태를 `폐기(→D-0NN)` 로 바꾼다.
