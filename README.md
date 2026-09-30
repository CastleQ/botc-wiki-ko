# BOTC Wiki 한글번역 페이지

시계탑에 흐른 피(Blood on the Clocktower) 공식 위키의 캐릭터 문서를 한국어로 옮긴 비공식 도감입니다.

- 주소: https://castleq.github.io/botc-wiki-ko/
- 번역 데이터·아이콘은 이 저장소에 없습니다. 같은 사이트 아래의 [포켓 그리모어 플러스+](https://github.com/CastleQ/pocket-grimoire) 배포본(`/pocket-grimoire/guide/data/`, `/pocket-grimoire/img/official/`)을 읽어 옵니다. 번역 수정은 포켓 그리모어 플러스+ 쪽에서 합니다.
- 캐릭터 문서는 제작사 TPI의 Community Created Content 정책에 의거한 번역이며, 제작사와 관계없는 비공식 사이트입니다.

## 파일

| 파일 | 내용 |
|---|---|
| `index.html` | 메인 — 공식 위키 메인처럼 에디션별(3) · 유형별(7) 입구와 검색 |
| `edition.html?id=<tb·bmr·snv>` | 에디션 페이지 — 유형별 표와 아이콘 격자 |
| `type.html?id=<유형>` | 유형 페이지 — 아이콘과 이름 격자 (주민·외지인·하수인·악마는 가나다순 초성 묶음) |
| `character.html` | 캐릭터 페이지 원본(틀). 예전 주소 `character.html?id=<id>`도 그대로 열린다 |
| `c/<id>.html` | 캐릭터별 페이지 — `character.html` 복사본 + 링크 미리보기(오픈그래프). **`tools/build-og.js`가 만든다. 직접 고치지 않는다** |
| `og/<id>.jpg` | 링크 미리보기 그림 400×400 — `tools/build-og-images.js`가 만든다 |
| `common.js` / `style.css` | 모든 페이지 공용 설정·모양 |

코드는 포켓 그리모어 플러스+의 캐릭터 가이드 화면을 바탕으로 하며 GPL-3.0을 따릅니다.

## 링크 미리보기(오픈그래프)

캐릭터 주소 `c/<id>.html`을 공유하면 제목 "BOTC 위키 - 캐릭터 이름", 설명(능력), 캐릭터 아이콘이 미리보기로 뜬다.

- `character.html`을 고친 뒤: `node tools/build-og.js` (PG+ 저장소가 옆 폴더 `../pocket-grimoire`에 있어야 한다)
- 새 캐릭터가 늘었을 때: `node tools/build-og-images.js` 다음 `node tools/build-og.js`
