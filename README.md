# 시계탑에 흐른 피(시계피) wiki 페이지 한글

시계탑에 흐른 피(Blood on the Clocktower) 공식 위키의 캐릭터 문서를 한국어로 옮긴 비공식 도감입니다.

- 주소: https://castleq.github.io/botc-wiki-ko/
- 번역 데이터·아이콘은 이 저장소에 없습니다. 같은 사이트 아래의 [포켓 그리모어 플러스+](https://github.com/CastleQ/pocket-grimoire) 배포본(`/pocket-grimoire/guide/data/`, `/pocket-grimoire/img/official/`)을 읽어 옵니다. 번역 수정은 포켓 그리모어 플러스+ 쪽에서 합니다.
- 캐릭터 문서는 제작사 TPI의 Community Created Content 정책에 의거한 번역이며, 제작사와 관계없는 비공식 사이트입니다.

## 파일

| 파일 | 내용 |
|---|---|
| `index.html` | 메인 — 공식 위키 메인처럼 에디션별(3) · 유형별(7) 입구와 검색 |
| `edition.html` | 에디션 페이지 원본(틀) — 유형별 표와 아이콘 격자. 공유 주소는 `edition-<tb·bmr·snv>.html`(예전 주소 `edition.html?id=<id>`도 열린다) |
| `type.html` | 유형 페이지 원본(틀) — 아이콘과 이름 격자 (주민·외지인·하수인·악마는 가나다순 초성 묶음). 공유 주소는 `type-<유형>.html` |
| `doc.html` | 위키 일반 문서 원본(틀) — 용어집·규칙서 등. 공유 주소는 `doc-<키>.html` |
| `character.html` | 캐릭터 페이지 원본(틀). 예전 주소 `character.html?id=<id>`도 그대로 열린다 |
| `c/<id>.html` | 캐릭터별 페이지 — `character.html` 복사본 + 링크 미리보기(오픈그래프). **`tools/build-og.js`가 만든다. 직접 고치지 않는다** |
| `edition-*.html` · `type-*.html` · `doc-*.html` | 판·유형·문서별 페이지 — 틀 복사본 + 링크 미리보기. **`tools/build-og.js`가 만든다. 직접 고치지 않는다** |
| `og/<id>.jpg` | 링크 미리보기 그림 400×400 — `tools/build-og-images.js`가 만든다. `og/edition-*.jpg` · `og/type-*.jpg`(PG+ 판 로고·유형 아이콘), `og/site.jpg`(사이트 로고)는 한 번 만들어 둔 것 |
| `common.js` / `style.css` | 모든 페이지 공용 설정·모양 |
| `quiz.html` | 이야기꾼 퀴즈 — 공식 퀴즈(quiz.bloodontheclocktower.com) 206문제 한국어판. 화면 값·그림은 원본 그대로, 토큰은 원본 빈 토큰 + PG+ 아이콘 + 한국어 이름. 주소 `quiz.html#/<퀴즈>/question-<번호>`. 도감 추가 기능: 시작 전 이름 입력, 결과 공유(링크 `#/<퀴즈>/score/<점수>/<이름>` → 점수 안내 + [나도 해보기]), 퀴즈별 최고 점수 |
| `quiz/data.json` | 퀴즈 데이터(번역문·좌석·정답). **pgplus-notes `tools/quiz-ko/build.js`가 만든다. 직접 고치지 않는다** |
| `quiz/img/` · `quiz/fonts/` | 원본 퀴즈 사이트에서 복사한 배경·장식 그림과 Dumbledor 글꼴 |

코드는 포켓 그리모어 플러스+의 캐릭터 가이드 화면을 바탕으로 하며 GPL-3.0을 따릅니다.

## 링크 미리보기(오픈그래프)

모든 페이지는 공유하면 제목 "{이름} - 시계피 wiki"로 미리보기가 뜬다 (메인만 사이트 이름 그대로).

- 캐릭터 `c/<id>.html`: 설명(능력) + 캐릭터 아이콘
- 판 `edition-<id>.html` · 유형 `type-<id>.html` · 문서 `doc-<키>.html`: 짧은 설명 + 판 로고·유형 아이콘·사이트 로고
- 메인 `index.html` · 이야기꾼 퀴즈 `quiz.html`: 태그를 파일에 직접 적어 둠

- `character.html` · `edition.html` · `type.html` · `doc.html`이나 common.js 목록(DOCS 등)을 고친 뒤: `node tools/build-og.js` (PG+ 저장소가 옆 폴더 `../pocket-grimoire`에 있어야 한다)
- 새 캐릭터가 늘었을 때: `node tools/build-og-images.js` 다음 `node tools/build-og.js`
