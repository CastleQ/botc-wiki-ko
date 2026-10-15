# botc-wiki-ko (시계피 wiki 한국어 도감) — Claude 작업 메모

- 규약은 PG+(`CastleQ/pocket-grimoire`) `CLAUDE.md`와 같다: 한국어·쉬운 말, **배포(main에 합치기)는 매번 CastleQ 허가 후(C-14)** — 이전 요청의 "배포해"는 다음 작업에 이어지지 않는다.
- 배포 = main에 합치기 → GitHub Pages가 1~2분 뒤 반영. `curl -s https://castleq.github.io/botc-wiki-ko/<파일> | grep og:title`로 확인.
- 작업 세션 기록은 `CastleQ/pgplus-notes`의 `sessions/`에 남긴다.

## 이름
- 사이트 이름: `시계탑에 흐른 피(시계피) wiki 페이지 한글` (탭 제목·상단·og:site_name·주석). 바꿀 때 `git grep`으로 전부 + `tools/build-og.js`의 `SITE_NAME`.
- 링크 미리보기 제목: `{이름} - 시계피 wiki` (`SHORT_NAME`). 메인만 사이트 이름 그대로(`index.html`에 직접 적음).

## 링크 미리보기(오픈그래프) 페이지
- 미리보기 봇은 스크립트를 안 돌리고 `?id=`도 구분 못 함 → 페이지마다 고정 파일: `c/<id>.html`, `edition-<id>.html`, `type-<id>.html`, `doc-<키>.html`. **직접 고치지 말고** 틀(`character.html`·`edition.html`·`type.html`·`doc.html`) 또는 `common.js` 목록을 고친 뒤 `node tools/build-og.js <guide/data 폴더>`.
- PG+ 저장소가 옆에 없으면 데이터만 받아서 실행: `curl -sSfO https://castleq.github.io/pocket-grimoire/guide/data/{catalog,roles}.json` → 그 폴더를 인자로. 다시 돌려 "새로 씀 0"이면 정상.
- 판·유형·문서 고정 파일은 **저장소 맨 위에 둔다**(하위 폴더 + `<base href>`면 목차 `#앵커` 링크가 메인으로 튐). 캐릭터 `c/`는 `<base href="/botc-wiki-ko/">`를 쓰고 목차가 없어 괜찮다.
- 페이지 키 읽기는 `W.pageKey(prefix, param)` (고정 주소 → 예전 `?param=` 순). 예전 주소도 계속 열려야 한다.
- 미리보기 그림 `og/edition-*.jpg`·`og/type-*.jpg`·`og/site.jpg`는 PG+ 판 로고·유형 아이콘·로고를 `convert`로 400×400 양피지색(`#efe6d6`) 바탕에 얹어 한 번 만든 것.

## 로컬 확인
- 페이지가 `/pocket-grimoire/…` 절대 경로를 읽으므로 `<dir>/botc-wiki-ko`에 저장소를 링크하고 `python3 -m http.server`로 띄운 뒤, Playwright `route`에서 `/pocket-grimoire/**`를 `route.fetch({url: 실제 사이트 주소})` → `fulfill`로 대신 응답(`continue`로 주소만 바꾸면 http→https라 거부됨). Playwright는 전역 설치본: `PW=$(npm root -g)/playwright node t.js` + 스크립트에서 `require(process.env.PW)`.

## 이야기꾼 퀴즈 (quiz.html)
- 번역 원고·원본 데이터·만드는 스크립트는 `CastleQ/pgplus-notes`의 `tools/quiz-ko/`(비공개). 번역 수정: `ko/<퀴즈>.json` 고친 뒤 `node build.js` → `quiz/data.json`.
- 원본 퀴즈는 React 앱이라 curl로는 빈 껍데기. 문제는 Google 시트에서 오며, 원본 페이지를 브라우저로 열면 `localStorage.QUIZ_DATA`에 정리된 데이터가 남는다(코드 속 API 키로 직접 부르는 건 권한 검사에서 막힘).
- 예시 이름은 `names.js`가 문제마다 정한다(자주 나오는 21명 고정 짝, 드문 이름은 그 문제에서 안 쓰인 이름). 모든 이름 2번 이상은 build.js가 검사.
- 점검: pgplus-notes `tools/quiz-ko/check.js` (206문제를 브라우저로 돌며 좌석 수·보기 수·정답 표시·만점 결과 확인, 실패 0이어야 함).
- 도감 추가 기능(원본에 없음): 이름 입력(`botcquiz_name`, 비면 시작 버튼 비활성), 결과 공유 링크 `#/<퀴즈>/score/<점수>/<이름>` → "○○님은 … n점입니다." + [나도 해보기] 인입 화면, 퀴즈별 최고 점수(`botcquiz_best_<퀴즈>`). 두 사람 문제별 비교는 CastleQ 요청으로 제거(2026-10-15, 예전 `#/…/vs/…` 링크는 첫 화면으로).
- 계획(CastleQ, 2026-10-15): 나중에 Supabase 서버를 만들어 여러 사람의 점수 기록을 모으는 방식으로 일괄 처리(순위·비교는 그때).
- 보류(CastleQ, 2026-10-15): CastleQ가 직접 만든 퀴즈 추가 기능. 지금은 만들지 않고 기억만. 착수 시 `quiz/data.json` 형식(퀴즈 = 문제·좌석·정답·결과 문구)에 그룹을 더하는 방식이 가장 단순.
