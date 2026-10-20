# 이력서 관리 페이지 설계

참조 문서 — 세션 시작에 읽지 않는다. 결정 근거는 D-004.

## 1. 구조

이력서 **내용은 데이터 파일 하나**에 두고, 페이지는 그 파일을 읽어 그린다. 내용을 고칠 때 HTML 을
건드리지 않는다. 원본 `cv.html`·`portfolio.html` 은 그대로 둔다(D-003).

| 파일 | 역할 |
| --- | --- |
| `resume/data.json` | 이력서 내용 전부 (아래 스키마). 원본 두 페이지에서 옮겨 왔다 |
| `resume/index.html` | 보기 페이지 — `data.json` 을 `fetch` 해서 이력서·포트폴리오를 그린다 (만들 예정) |
| `resume/edit.html` | 편집 페이지 — 항목 추가·수정·삭제·순서 변경 후 JSON 으로 내보낸다 (만들 예정) |

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
