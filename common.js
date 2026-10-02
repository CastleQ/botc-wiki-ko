// BOTC Wiki 한글번역 페이지 — 모든 페이지가 함께 쓰는 설정과 도구.
// 번역 데이터·아이콘·장식 이미지는 이 저장소에 두지 않고, 같은 출처(castleq.github.io)의
// 포켓 그리모어 플러스+ 배포본을 절대 경로로 읽는다. 번역 수정은 PG+에서만 한다.
// 목록은 PG+의 guide/data/catalog.json(판 → 유형 → 정발 순번으로 정렬됨)을 쓴다.
// 브라우저 호환을 위해 async/await 대신 Promise .then()만 쓴다.
(function () {

    var BASE = "/pocket-grimoire/";

    // 공식 위키 메인의 "Characters By Edition". 실험 캐릭터는 판 버튼 없이 유형 페이지로만 들어간다.
    var EDITIONS = [
        { id: "tb", name: "점철되는 혼란", alt: "Trouble Brewing", logo: BASE + "guide/img/logo_tb.webp" },
        { id: "bmr", name: "피로 물든 달", alt: "Bad Moon Rising", logo: BASE + "guide/img/logo_bmr.webp" },
        { id: "snv", name: "화단에 꽃피운 이단", alt: "Sects & Violets", logo: BASE + "guide/img/logo_snv.webp" }
    ];
    // 판 이름은 PG+ 앱의 정발 이름을 따른다 (translations/messages.ko_KR.yaml editions).
    var EDITION_NAMES = { tb: "점철되는 혼란", bmr: "피로 물든 달", snv: "화단에 꽃피운 이단", exp: "실험" };

    // 공식 위키 메인의 "Characters By Type"
    var TYPES = [
        { id: "townsfolk", name: "주민" },
        { id: "outsider", name: "외지인" },
        { id: "minion", name: "하수인" },
        { id: "demon", name: "악마" },
        { id: "traveller", name: "여행자" },
        { id: "fabled", name: "전설" },
        { id: "loric", name: "설화" }
    ];
    var TEAM_NAMES = {};
    TYPES.forEach(function (type) {
        TEAM_NAMES[type.id] = type.name;
    });
    // 판 페이지에 나오는 유형 (위키 판 페이지에는 여행자가 없다)
    var EDITION_TEAMS = ["townsfolk", "outsider", "minion", "demon"];

    // 위키 Travellers 문서의 묶음 순서와 묶음 안 순서. 여기에 없는 새 여행자는 그 판 묶음 맨 뒤(가나다순)로 간다.
    var TRAVELLER_GROUPS = [
        { edition: "tb", ids: ["scapegoat", "gunslinger", "beggar", "bureaucrat", "thief"] },
        { edition: "snv", ids: ["butcher", "bonecollector", "harlot", "barista", "deviant"] },
        { edition: "bmr", ids: ["apprentice", "matron", "voudon", "judge", "bishop"] },
        { edition: "exp", ids: ["cacklejack", "gangster", "gnome"] }
    ];

    // 위키 소개글 번역이 있는 유형 (PG+ guide/data/pages/<유형>.json). 없는 유형은 요청하지 않는다.
    var TYPE_PAGES = ["traveller", "fabled", "loric", "experimental"];

    // 위키 Loric 문서의 순서. 여기에 없는 새 설화는 맨 뒤(가나다순)로 간다.
    var LORIC_ORDER = ["bigwig", "bootlegger", "gardener", "godofug", "hindu", "knaves", "pope", "stormcatcher", "tor", "ventriloquist", "zenomancer"];

    // 위키 Fabled 문서의 묶음과 묶음 안 순서. 여기에 없는 새 전설은 맨 뒤 "기타"(가나다순)로 모인다.
    var FABLED_GROUPS = [
        { title: "사회적 상호작용 & 접근성", ids: ["angel", "buddhist", "doomsayer", "fiddler", "hellslibrarian", "revolutionary", "toymaker"] },
        { title: "커스텀 스크립트", ids: ["djinn", "duchess", "fibbin", "sentinel", "spiritofivory"] },
        { title: "실험", ids: ["deusexfiasco", "ferryman"] }
    ];

    // 위키 Experimental 문서의 유형별 목록 (판 3071). 유형 순서와 목록은 위키 그대로, 유형 안은 영어 이름 ABC순(= id 순).
    // catalog의 판 표시(edition)만으로는 고를 수 없다 — 전설은 전부 exp로 되어 있다.
    var EXPERIMENTAL = [
        { team: "townsfolk", ids: ["acrobat", "alchemist", "alsaahir", "amnesiac", "atheist", "balloonist", "banshee", "bountyhunter", "cannibal", "choirboy", "cultleader", "engineer", "farmer", "fisherman", "general", "highpriestess", "huntsman", "king", "knight", "lycanthrope", "magician", "nightwatchman", "noble", "pixie", "poppygrower", "preacher", "princess", "shugenja", "steward", "villageidiot"] },
        { team: "outsider", ids: ["damsel", "golem", "hatter", "heretic", "hermit", "ogre", "plaguedoctor", "politician", "puzzlemaster", "snitch", "zealot"] },
        { team: "minion", ids: ["boffin", "boomdandy", "fearmonger", "goblin", "harpy", "marionette", "mezepheles", "organgrinder", "psychopath", "summoner", "vizier", "widow", "wizard", "wraith", "xaan"] },
        { team: "demon", ids: ["alhadikhia", "kazali", "legion", "leviathan", "lilmonsta", "lleech", "lordoftyphon", "ojo", "riot", "yaggababble"] },
        { team: "fabled", ids: ["deusexfiasco", "ferryman"] },
        { team: "loric", ids: ["bigwig", "bootlegger", "gardener", "godofug", "hindu", "knaves", "pope", "stormcatcher", "tor", "ventriloquist", "zenomancer"] },
        { team: "traveller", ids: ["cacklejack", "gangster", "gnome"] }
    ];

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

    function byName(a, b) {
        return a.name.localeCompare(b.name, "ko");
    }

    // 이름 첫 글자의 초성. 된소리는 예사소리 묶음에 넣는다 (ㄲ → ㄱ).
    var CHOSEONG = ["ㄱ", "ㄱ", "ㄴ", "ㄷ", "ㄷ", "ㄹ", "ㅁ", "ㅂ", "ㅂ", "ㅅ", "ㅅ", "ㅇ", "ㅈ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
    function choseong(name) {
        var code = name.charCodeAt(0) - 0xAC00;
        if (code < 0 || code > 11171) {
            return name.charAt(0).toUpperCase();
        }
        return CHOSEONG[Math.floor(code / 588)];
    }

    // 판 페이지: 주민·외지인·하수인·악마 순, 각 유형 안은 정발 순번(catalog 순서 그대로)
    function editionSections(catalog, editionId) {
        return EDITION_TEAMS.map(function (team) {
            return {
                title: TEAM_NAMES[team],
                entries: catalog.filter(function (entry) {
                    return entry.edition === editionId && entry.team === team;
                })
            };
        }).filter(function (section) {
            return section.entries.length;
        });
    }

    // 유형 페이지 묶음
    //  - 주민·외지인·하수인·악마: 가나다순, 초성 머리글자로 묶음
    //  - 여행자: 위키 순서 (점철되는 혼란 → 화단에 꽃피운 이단 → 피로 물든 달 → 실험, 묶음 안도 위키 순서)
    //  - 전설: 위키 묶음 (사회적 상호작용 & 접근성 / 커스텀 스크립트 / 실험), 묶음 안도 위키 순서
    //  - 설화: 위키 순서 한 묶음
    function typeSections(catalog, team) {
        var members = catalog.filter(function (entry) {
            return entry.team === team;
        });
        var sections = [];

        if (team === "traveller") {
            TRAVELLER_GROUPS.forEach(function (group) {
                var entries = members.filter(function (entry) {
                    return entry.edition === group.edition;
                }).sort(function (a, b) {
                    var ia = group.ids.indexOf(a.id);
                    var ib = group.ids.indexOf(b.id);
                    ia = ia === -1 ? group.ids.length : ia;
                    ib = ib === -1 ? group.ids.length : ib;
                    return ia - ib || byName(a, b);
                });
                if (entries.length) {
                    sections.push({ title: EDITION_NAMES[group.edition], entries: entries });
                }
            });
            return sections;
        }

        members = members.slice().sort(byName);

        if (team === "fabled") {
            var grouped = [];
            FABLED_GROUPS.forEach(function (group) {
                var entries = members.filter(function (entry) {
                    return group.ids.indexOf(entry.id) !== -1;
                }).sort(function (a, b) {
                    return group.ids.indexOf(a.id) - group.ids.indexOf(b.id);
                });
                grouped = grouped.concat(group.ids);
                if (entries.length) {
                    sections.push({ title: group.title, entries: entries });
                }
            });
            var rest = members.filter(function (entry) {
                return grouped.indexOf(entry.id) === -1;
            });
            if (rest.length) {
                sections.push({ title: "기타", entries: rest });
            }
            return sections;
        }

        if (team === "loric") {
            return [{ title: "", entries: members.slice().sort(function (a, b) {
                var ia = LORIC_ORDER.indexOf(a.id);
                var ib = LORIC_ORDER.indexOf(b.id);
                ia = ia === -1 ? LORIC_ORDER.length : ia;
                ib = ib === -1 ? LORIC_ORDER.length : ib;
                return ia - ib || byName(a, b);
            }) }];
        }

        members.forEach(function (entry) {
            var letter = choseong(entry.name);
            var last = sections[sections.length - 1];
            if (!last || last.title !== letter) {
                last = { title: letter, entries: [] };
                sections.push(last);
            }
            last.entries.push(entry);
        });
        return sections;
    }

    // 실험 캐릭터 페이지: 위키 유형 순서대로, 유형 안은 위키 순서 (catalog에 없는 id는 건너뛴다)
    function experimentalSections(catalog) {
        var byId = indexById(catalog);
        return EXPERIMENTAL.map(function (group) {
            return {
                title: TEAM_NAMES[group.team],
                entries: group.ids.filter(function (id) {
                    return byId[id];
                }).map(function (id) {
                    return byId[id];
                })
            };
        }).filter(function (section) {
            return section.entries.length;
        });
    }

    function flatten(sections) {
        return sections.reduce(function (all, section) {
            return all.concat(section.entries);
        }, []);
    }

    function isEditionMember(entry) {
        return EDITION_NAMES[entry.edition] && entry.edition !== "exp" && EDITION_TEAMS.indexOf(entry.team) !== -1;
    }

    // 캐릭터 페이지의 이전/다음 순서와 "돌아갈 페이지".
    // 3개 판의 주민·외지인·하수인·악마는 판 페이지 순서, 나머지(실험·여행자·전설·설화)는 유형 페이지 순서.
    // 실험 주민 등은 유형 페이지 순서에서 3개 판 캐릭터를 건너뛴다. 섞으면 판 캐릭터로 넘어간 뒤
    // 그 캐릭터의 "이전"이 판 페이지 순서를 따르게 되어 앞뒤 이동이 어긋난다.
    function homeOf(catalog, entry) {
        if (isEditionMember(entry)) {
            return {
                title: EDITION_NAMES[entry.edition],
                href: "edition.html?id=" + entry.edition,
                order: flatten(editionSections(catalog, entry.edition))
            };
        }
        return {
            title: TEAM_NAMES[entry.team] || "",
            href: "type.html?id=" + entry.team,
            order: flatten(typeSections(catalog, entry.team)).filter(function (other) {
                return !isEditionMember(other);
            })
        };
    }

    function iconUrl(id) {
        return BASE + "img/official/" + id + "_0.webp";
    }

    // 캐릭터 페이지 주소: 캐릭터마다 오픈그래프(링크 미리보기)가 들어간 고정 페이지 c/<id>.html
    // (tools/build-og.js가 character.html을 복사해 만든다)
    function pageUrl(id) {
        return "c/" + encodeURIComponent(id) + ".html";
    }

    // 이름 색: 선 파랑 / 악 빨강 / 여행자 보라 / 전설 금색 / 설화 초록 (위키와 같게)
    function side(team) {
        if (team === "traveller" || team === "fabled" || team === "loric") {
            return team;
        }
        return (team === "minion" || team === "demon") ? "evil" : "good";
    }

    // 캐릭터 아이콘 + 이름 격자 (판 페이지·유형 페이지·메인 검색 결과 공용)
    function grid(entries) {
        return "<ul class=\"grid\">" + entries.map(function (entry) {
            return "<li><a class=\"role--" + side(entry.team) + "\" href=\"" + pageUrl(entry.id) + "\">" +
                "<img src=\"" + iconUrl(entry.id) + "\" alt=\"\" loading=\"lazy\"><span data-id=\"" + esc(entry.id) + "\">" + esc(entry.name) + "</span></a></li>";
        }).join("") + "</ul>";
    }

    // 위키 문서 링크 [글자](wiki:문서) → 이 사이트에 있는 문서는 이 사이트로, 없는 문서는 원문 위키로
    var WIKI_LINKS = {
        "Fabled": "type.html?id=fabled",
        "Travellers": "type.html?id=traveller",
        "Loric": "type.html?id=loric",
        "Experimental": "type.html?id=experimental",
        "Trouble_Brewing": "edition.html?id=tb",
        "Bad_Moon_Rising": "edition.html?id=bmr",
        "Sects_&_Violets": "edition.html?id=snv",
        "Glossary": "doc.html?p=glossary",
        "Storyteller_Advice": "doc.html?p=storyteller-advice",
        "Player_Strategy": "doc.html?p=player-strategy",
        "Changelog": "doc.html?p=changelog",
        "Setup": "doc.html?p=setup",
        "Rules_Explanation": "doc.html?p=rules",
        "Abilities": "doc.html?p=abilities",
        "States": "doc.html?p=states",
        "Teensyville": "doc.html?p=teensyville",
        "Script_Tool": "doc.html?p=script-tool"
    };
    function linkHtml(label, target) {
        if (/^https?:\/\//.test(target)) {
            return "<a href=\"" + target + "\" target=\"_blank\" rel=\"noopener\">" + label + "</a>";
        }
        var page = target.replace(/^wiki:/, "").replace(/&amp;/g, "&");
        var local = WIKI_LINKS[page.split("#")[0]];
        if (local) {
            // 문서 안 제목(#Drunkenness_and_Poisoning)은 이 사이트 제목 id 규칙(소문자·하이픈)으로
            var hash = page.split("#")[1];
            return "<a href=\"" + local + (hash ? "#" + hash.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : "") + "\">" + label + "</a>";
        }
        return "<a href=\"https://wiki.bloodontheclocktower.com/" + esc(page) + "\" target=\"_blank\" rel=\"noopener\">" + label + "</a>";
    }

    // 번역문 표기: {c:id} → 캐릭터 링크(선 파랑 / 악 빨강, 정발 이름), **굵게** → 굵은 글씨, __기울임__ → 기울임,
    // [글자](wiki:문서 또는 https://주소) → 링크. byId는 catalog를 id로 찾을 수 있게 만든 표. 목록에 없는 id는 글자 그대로 둔다.
    function richText(text, byId) {
        return esc(text)
            .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
            .replace(/__(.+?)__/g, "<i>$1</i>")
            .replace(/\[([^\]]+)\]\(((?:wiki:|https?:\/\/)[^)\s]+)\)/g, function (all, label, target) {
                return linkHtml(label, target);
            })
            .replace(/\{c:([a-z_]+)\}/g, function (all, roleId) {
                var entry = byId[roleId];
                if (!entry) {
                    return esc(roleId);
                }
                return "<a class=\"role role--" + side(entry.team) + "\" href=\"" + pageUrl(entry.id) + "\" data-id=\"" + esc(entry.id) + "\">" + esc(entry.name) + "</a>";
            });
    }

    function indexById(catalog) {
        var byId = {};
        catalog.forEach(function (entry) {
            byId[entry.id] = entry;
        });
        return byId;
    }

    function sectionsHtml(sections) {
        return sections.map(function (section) {
            return (section.title ? "<h2>" + esc(section.title) + "</h2>" : "") + grid(section.entries);
        }).join("");
    }

    var CREDIT = "<div class=\"credit\">이 사이트의 캐릭터 문서는 Blood on the Clocktower 공식 위키를 제작사 TPI의 Community Created Content 정책에 의거하여 한국어로 번역한 것으로, 제작사와 관계없는 비공식 번역입니다. " +
        "<a href=\"https://wiki.bloodontheclocktower.com/\" target=\"_blank\" rel=\"noopener\">원문 위키(영어) 보기</a></div>";

    // 아직 만들지 않은 위키 문서 (왼쪽 메뉴에서 wip.html?p=<키>로 연결)
    var WIP_PAGES = {
        "recent-changes": "최근 바뀜",
        "random": "임의 문서"
    };

    // 위키 일반 문서 (doc.html?p=<키>). 번역은 PG+ guide/data/pages/<키>.json. tocLevels는 목차에 넣을 제목 단계 수
    var DOCS = {
        "glossary": { title: "용어집" },
        "storyteller-advice": { title: "이야기꾼 조언" },
        "player-strategy": { title: "플레이어 전략" },
        "changelog": { title: "변경 이력", tocLevels: 2 },
        "setup": { title: "게임 준비" },
        "rules": { title: "규칙 설명" },
        "abilities": { title: "능력" },
        "states": { title: "상태" },
        "teensyville": { title: "틴시빌" },
        "script-tool": { title: "스크립트 도구" }
    };
    // 왼쪽 메뉴 묶음
    var DOC_GROUPS = {
        "게임 정보": ["glossary", "storyteller-advice", "player-strategy", "changelog"],
        "규칙서": ["setup", "rules", "abilities", "states", "teensyville", "script-tool"]
    };

    function notFoundHtml(title, text) {
        return "<nav class=\"crumbs\"><a href=\"./\">← 메인으로</a></nav>" +
            "<div class=\"notfound\"><h2>" + esc(title) + "</h2><p>" + esc(text) + "</p></div>";
    }

    window.WikiKo = {
        BASE: BASE,
        EDITIONS: EDITIONS,
        EDITION_NAMES: EDITION_NAMES,
        TYPES: TYPES,
        TYPE_PAGES: TYPE_PAGES,
        TEAM_NAMES: TEAM_NAMES,
        CREDIT: CREDIT,
        esc: esc,
        getJSON: getJSON,
        iconUrl: iconUrl,
        pageUrl: pageUrl,
        side: side,
        grid: grid,
        sectionsHtml: sectionsHtml,
        richText: richText,
        indexById: indexById,
        editionSections: editionSections,
        typeSections: typeSections,
        experimentalSections: experimentalSections,
        EXPERIMENTAL_NAME: "실험 캐릭터",
        homeOf: homeOf,
        notFoundHtml: notFoundHtml,
        WIP_PAGES: WIP_PAGES,
        DOCS: DOCS
    };

    // ── 왼쪽 메뉴 (공식 위키 pivot 스킨의 사이드바) ──
    // 넓은 화면(1024px 이상)에서만 보인다. 좁은 화면은 위쪽 보라색 막대를 그대로 쓴다.
    // 아직 만들지 않은 문서는 wip.html?p=<키> ("아직 작업 중 이에요 :)")로 보낸다.
    function docItems(group) {
        return DOC_GROUPS[group].map(function (key) {
            return [DOCS[key].title, "doc.html?p=" + key];
        });
    }

    function mountSidebar() {
        var menu = [
            { title: "게임 정보", items: docItems("게임 정보") },
            { title: "규칙서", items: docItems("규칙서") },
            { title: "캐릭터", items: EDITIONS.map(function (edition) {
                return [edition.name, "edition.html?id=" + edition.id];
            }).concat(["traveller", "fabled", "loric"].map(function (team) {
                return [TEAM_NAMES[team], "type.html?id=" + team];
            })).concat([["실험 캐릭터", "type.html?id=experimental"]]) },
            { title: "둘러보기", items: ["recent-changes", "random"] }
        ];
        var here = window.location.pathname.replace(/^.*\//, "") + window.location.search;
        var html = "<a class=\"sidebar__logo\" href=\"./\"><img src=\"" + BASE + "guide/img/logo.png\" alt=\"Blood on the Clocktower\"></a>" +
            "<form class=\"sidebar__search\" action=\"./\" method=\"get\" role=\"search\">" +
            "<input type=\"search\" name=\"q\" id=\"side-search\" placeholder=\"찾기\" autocomplete=\"off\"></form>";
        menu.forEach(function (group) {
            html += "<div class=\"sidebar__label\">" + esc(group.title) + "</div><ul>" + group.items.map(function (item) {
                var label = Array.isArray(item) ? item[0] : WIP_PAGES[item];
                var href = Array.isArray(item) ? item[1] : "wip.html?p=" + item;
                return "<li><a href=\"" + href + "\"" + (href === here ? " aria-current=\"page\"" : "") + ">" + esc(label) + "</a></li>";
            }).join("") + "</ul>";
        });
        var aside = document.createElement("aside");
        aside.className = "sidebar";
        aside.innerHTML = html;
        document.body.insertBefore(aside, document.body.firstChild);
        var params = new URLSearchParams(window.location.search);
        if (params.get("q")) {
            aside.querySelector("#side-search").value = params.get("q");
        }
        mountMenuToggle(aside);
    }

    // ── 좁은 화면: 위쪽 막대 왼쪽 햄버거 버튼 → 왼쪽 메뉴가 밀려 들어옴 (공식 위키 pivot 스킨의 off-canvas) ──
    // 열리면 본문이 오른쪽으로 밀리고, 본문 위 반투명 막을 누르거나 Esc를 누르면 닫힌다. 넓은 화면에서는 버튼이 보이지 않는다.
    function mountMenuToggle(aside) {
        var bar = document.querySelector(".tab-bar");
        if (!bar) {
            return;
        }
        aside.id = "site-menu";
        var button = document.createElement("button");
        button.type = "button";
        button.className = "menu-toggle";
        button.setAttribute("aria-controls", "site-menu");
        button.setAttribute("aria-expanded", "false");
        button.setAttribute("aria-label", "메뉴 열기");
        button.innerHTML = "<span></span>";
        bar.insertBefore(button, bar.firstChild);
        var overlay = document.createElement("div");
        overlay.className = "menu-overlay";
        document.body.appendChild(overlay);

        function setOpen(open) {
            document.body.classList.toggle("menu-open", open);
            button.setAttribute("aria-expanded", open ? "true" : "false");
            button.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
        }
        button.addEventListener("click", function () {
            setOpen(!document.body.classList.contains("menu-open"));
        });
        overlay.addEventListener("click", function () {
            setOpen(false);
        });
        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && document.body.classList.contains("menu-open")) {
                setOpen(false);
                button.focus();
            }
        });
    }

    // ── 캐릭터 이름 호버창: 이름 위에 마우스를 올리면 능력 문구 (공식 위키 data-role과 같은 방식) ──
    // 이름에 data-id가 붙어 있으면 PG+ guide/data/roles.json의 정발 능력을 data-ability로 넣고, 모양은 style.css가 맡는다.
    // 본문은 데이터를 받은 뒤 그려지므로, 화면에 새 이름이 생길 때마다 채운다.
    var abilitiesPromise = null;
    function fillAbilities() {
        var targets = document.querySelectorAll("[data-id]:not([data-ability])");
        if (!targets.length) {
            return;
        }
        if (!abilitiesPromise) {
            abilitiesPromise = getJSON("guide/data/roles.json").catch(function () {
                return {};
            });
        }
        abilitiesPromise.then(function (roles) {
            Array.prototype.forEach.call(targets, function (element) {
                var role = roles[element.getAttribute("data-id")];
                element.setAttribute("data-ability", role && role.ability ? role.ability : "");
            });
        });
    }
    var fillQueued = false;
    new MutationObserver(function () {
        if (fillQueued) {
            return;
        }
        fillQueued = true;
        window.requestAnimationFrame(function () {
            fillQueued = false;
            fillAbilities();
        });
    }).observe(document.body, { childList: true, subtree: true });

    mountSidebar();

}());
