# 환경 유실 위험 & 복구 가이드 (Loss risk & recovery)

이 환경은 예고 없이 재기동/삭제될 수 있다. 무엇이 사라지고 무엇이 남는지, 재개 시 복구법을 정리한다.

## 1. 무엇이 사라지고 무엇이 남는가

| 대상 | 재기동 시 | 성격 | 복구 방법 |
| --- | --- | --- | --- |
| **커밋 + push 된 코드/문서** | ✅ 남음(원격) | 안전 | `git clone` 또는 그대로 |
| **커밋했지만 push 안 한 것** | ⚠️ 볼륨 유지 시만 | 위험 | **마일스톤마다 push** |
| **커밋 안 한 작업물** | ❌ 유실 | **최대 위험** | 없음 — 자주 커밋만이 방어 |
| 의존성 | — 없음 | 정적 사이트(HTML+`assets/`) | 빌드·설치 단계 없음 |
| `.git/hooks/pre-commit` | ❌ 클론마다 없음 | 재설치 대상 | `bash scripts/install-hooks.sh` |
| 자격증명(토큰) | ❌ 유실 | 재설정 대상 | 재주입 (값은 문서에 절대 안 남김) |

**요지:** git 에 커밋+push 된 것만 확실히 안전. 나머지는 재현 가능. 진짜 위험은 커밋 안 한 작업물뿐.

## 2. 유실을 줄이는 작업 습관
- 마일스톤(논리적 한 단위)마다 커밋하고 곧바로 push.
- 방향 결정은 그때그때 decisions.md 에 D-번호로. 문서도 코드와 함께 원격 백업된다.
- 세션 종료 전 `git status` clean·`origin` 동기 확인.
- 민감정보(토큰·비밀번호)는 문서·로그·커밋에 절대 남기지 않는다.

## 3. 재개 절차
세션 시작 시 CLAUDE.md 순서(current-task → session-log → decisions → todo → git log)를 따르되,
환경이 비어 있으면 이것부터 실행한다.

```bash
git clone https://github.com/drsmin/skm-cv && cd skm-cv
bash scripts/install-hooks.sh    # .git/hooks 는 커밋되지 않는다 — 클론마다 필요
bash scripts/check.sh            # 문서 예산 게이트가 초록인지 확인
```

배포는 GitHub Pages(`CNAME` = `cv.drs.pe.kr`)가 기본 브랜치를 그대로 서빙한다. `docs/`·`scripts/`·
`CLAUDE.md` 는 `_config.yml` 의 `exclude` 로 공개 사이트에서 뺀다.
