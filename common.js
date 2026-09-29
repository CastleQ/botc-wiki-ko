// 포켓 그리모어 캐릭터 도감 — 두 페이지가 함께 쓰는 설정과 도구.
// 번역 데이터·아이콘·장식 이미지는 이 저장소에 두지 않고, 같은 출처(castleq.github.io)의
// 포켓 그리모어 플러스+ 배포본을 절대 경로로 읽는다. 번역 수정은 PG+에서만 한다.
// 브라우저 호환을 위해 async/await 대신 Promise .then()만 쓴다.
(function () {

    var BASE = "/pocket-grimoire/";

    function esc(text) {
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function getJSON(path) {
        return fetch(BASE + path, { cache: "no-cache" }).then(function (response) {
            if (!response.ok) {
                throw new Error(path + " " + response.status);
            }
            return response.json();
        });
    }

    // 메인 페이지 묶음. 전설·설화는 판과 상관없이 따로 모은다.
    var GROUPS = [
        { key: "tb", title: "트러블 브루잉", logo: "guide/img/logo_tb.webp" },
        { key: "bmr", title: "배드 문 라이징", logo: "guide/img/logo_bmr.webp" },
        { key: "snv", title: "섹츠 & 바이올렛", logo: "guide/img/logo_snv.webp" },
        { key: "exp", title: "실험 캐릭터", logo: "" },
        { key: "fabled", title: "전설", logo: "" },
        { key: "loric", title: "설화", logo: "" }
    ];

    function groupOf(entry) {
        return (entry.team === "fabled" || entry.team === "loric") ? entry.team : entry.edition;
    }

    window.WikiKo = {
        BASE: BASE,
        TEAM_NAMES: { townsfolk: "주민", outsider: "외지인", minion: "하수인", demon: "악마", traveller: "여행자", fabled: "전설", loric: "설화" },
        TEAM_ORDER: ["townsfolk", "outsider", "minion", "demon", "traveller", "fabled", "loric"],
        GROUPS: GROUPS,
        groupOf: groupOf,
        esc: esc,
        getJSON: getJSON,
        iconUrl: function (id) {
            return BASE + "img/official/" + id + "_0.webp";
        },
        pageUrl: function (id) {
            return "character.html?id=" + encodeURIComponent(id);
        },
        side: function (team) {
            return (team === "minion" || team === "demon") ? "evil" : "good";
        }
    };

}());
