// 캐릭터별 링크 미리보기(오픈그래프) 페이지 만들기 — c/<id>.html
//
// 사용법 (도감 저장소 루트): node tools/build-og.js [PG+ guide/data 폴더]
//   기본값: ../pocket-grimoire/public/guide/data
//
// 링크 미리보기 봇(카카오톡·디스코드 등)은 페이지 스크립트를 실행하지 않으므로,
// 캐릭터마다 오픈그래프 태그를 HTML에 직접 적은 페이지가 따로 있어야 한다.
// character.html을 그대로 복사하고 <!-- OG --> 자리에 그 캐릭터의 태그만 끼워 넣는다.
//   제목: "BOTC 위키 - {캐릭터 이름}" / 설명: 능력 / 그림: og/<id>.jpg (tools/build-og-images.js)
//
// character.html을 고치면 반드시 다시 실행한다. 여러 번 실행해도 결과가 같다(C-7).
// 목록(catalog.json)에 없는 c/*.html은 지운다.

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dataDir = path.resolve(process.argv[2] || path.join(root, "..", "pocket-grimoire", "public", "guide", "data"));
const SITE = "https://castleq.github.io/botc-wiki-ko/";
const SITE_NAME = "BOTC Wiki 한글번역 페이지";

const catalog = JSON.parse(fs.readFileSync(path.join(dataDir, "catalog.json"), "utf8"));
const roles = JSON.parse(fs.readFileSync(path.join(dataDir, "roles.json"), "utf8"));
const template = fs.readFileSync(path.join(root, "character.html"), "utf8");
if (template.split("<!-- OG -->").length !== 2) {
    throw new Error("character.html에 <!-- OG --> 자리가 정확히 한 곳 있어야 합니다");
}

function attr(text) {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

const outDir = path.join(root, "c");
fs.mkdirSync(outDir, { recursive: true });

let written = 0;
let same = 0;
const missingImages = [];
const keep = new Set();

catalog.forEach((entry) => {
    const role = roles[entry.id] || {};
    const title = "BOTC 위키 - " + entry.name;
    const url = SITE + "c/" + entry.id + ".html";
    const image = SITE + "og/" + entry.id + ".jpg";
    if (!fs.existsSync(path.join(root, "og", entry.id + ".jpg"))) {
        missingImages.push(entry.id);
    }
    const tags = [
        `<meta property="og:type" content="website">`,
        `<meta property="og:site_name" content="${attr(SITE_NAME)}">`,
        `<meta property="og:title" content="${attr(title)}">`,
        `<meta property="og:description" content="${attr(role.ability || "")}">`,
        `<meta property="og:url" content="${attr(url)}">`,
        `<meta property="og:image" content="${attr(image)}">`,
        `<meta property="og:image:width" content="400">`,
        `<meta property="og:image:height" content="400">`,
        `<meta property="og:image:alt" content="${attr(entry.name)}">`,
        `<meta name="twitter:card" content="summary">`,
        `<link rel="canonical" href="${attr(url)}">`
    ].join("\n");
    const html = template.replace("<!-- OG -->", "<!-- OG: tools/build-og.js가 만든 파일. 직접 고치지 말고 character.html을 고친 뒤 다시 실행 -->\n" + tags);
    const file = path.join(outDir, entry.id + ".html");
    keep.add(entry.id + ".html");
    if (fs.existsSync(file) && fs.readFileSync(file, "utf8") === html) {
        same += 1;
        return;
    }
    fs.writeFileSync(file, html);
    written += 1;
});

const removed = fs.readdirSync(outDir).filter((file) => file.endsWith(".html") && !keep.has(file));
removed.forEach((file) => fs.unlinkSync(path.join(outDir, file)));

console.log(`캐릭터 ${catalog.length}개: 새로 씀 ${written} / 그대로 ${same} / 지움 ${removed.length}`);
if (missingImages.length) {
    console.log(`FAIL 미리보기 그림 없음 ${missingImages.length}개: ${missingImages.join(", ")} → node tools/build-og-images.js`);
    process.exitCode = 1;
}
