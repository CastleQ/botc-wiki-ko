// 링크 미리보기(오픈그래프) 페이지 만들기
//   캐릭터: c/<id>.html (character.html 복사)
//   판·유형·문서: edition-<id>.html · type-<id>.html · doc-<키>.html (edition.html · type.html · doc.html 복사)
//
// 사용법 (도감 저장소 루트): node tools/build-og.js [PG+ guide/data 폴더]
//   기본값: ../pocket-grimoire/public/guide/data
//
// 링크 미리보기 봇(카카오톡·디스코드 등)은 페이지 스크립트를 실행하지 않으므로,
// 페이지마다 오픈그래프 태그를 HTML에 직접 적은 파일이 따로 있어야 한다.
// 틀을 그대로 복사하고 <!-- OG --> 자리에 그 페이지의 태그를, <title>에 그 페이지 제목을 넣는다.
//   제목: "{이름} - 시계피 wiki" / 그림: og/<id>.jpg (tools/build-og-images.js), og/edition-*.jpg · og/type-*.jpg · og/site.jpg
// 판·유형·문서 목록은 common.js(EDITIONS · TYPES · TYPE_PAGES · DOCS)를 그대로 읽는다.
// 메인(index.html)의 태그는 index.html에 직접 적혀 있다.
//
// 틀(character.html 등)이나 common.js 목록을 고치면 반드시 다시 실행한다. 여러 번 실행해도 결과가 같다(C-7).
// 목록에 없는 c/*.html · edition-*.html · type-*.html · doc-*.html은 지운다.

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const dataDir = path.resolve(process.argv[2] || path.join(root, "..", "pocket-grimoire", "public", "guide", "data"));
const SITE = "https://castleq.github.io/botc-wiki-ko/";
const SITE_NAME = "시계탑에 흐른 피(시계피) wiki 페이지 한글";
const SHORT_NAME = "시계피 wiki";

const catalog = JSON.parse(fs.readFileSync(path.join(dataDir, "catalog.json"), "utf8"));
const roles = JSON.parse(fs.readFileSync(path.join(dataDir, "roles.json"), "utf8"));
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, "common.js"), "utf8"), sandbox);
const W = sandbox.window.WikiKo;

function attr(text) {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function readTemplate(name) {
    const text = fs.readFileSync(path.join(root, name), "utf8");
    if (text.split("<!-- OG -->").length !== 2 || text.split(/<title>[^<]*<\/title>/).length !== 2) {
        throw new Error(name + "에 <!-- OG --> 자리와 <title>이 정확히 한 곳씩 있어야 합니다");
    }
    return text;
}

const missingImages = [];
const stats = { written: 0, same: 0 };

// page: { file(저장소 기준), template, name, description, image(og/ 안 파일 이름), alt }
function writePage(page) {
    if (!fs.existsSync(path.join(root, "og", page.image))) {
        missingImages.push(page.image);
    }
    const title = page.name + " - " + SHORT_NAME;
    const url = SITE + page.file;
    const tags = [
        `<meta property="og:type" content="website">`,
        `<meta property="og:site_name" content="${attr(SITE_NAME)}">`,
        `<meta property="og:title" content="${attr(title)}">`,
        `<meta property="og:description" content="${attr(page.description)}">`,
        `<meta property="og:url" content="${attr(url)}">`,
        `<meta property="og:image" content="${attr(SITE + "og/" + page.image)}">`,
        `<meta property="og:image:width" content="400">`,
        `<meta property="og:image:height" content="400">`,
        `<meta property="og:image:alt" content="${attr(page.alt || page.name)}">`,
        `<meta name="twitter:card" content="summary">`,
        `<link rel="canonical" href="${attr(url)}">`
    ].join("\n");
    const html = page.template
        .replace("<!-- OG -->", "<!-- OG: tools/build-og.js가 만든 파일. 직접 고치지 말고 틀을 고친 뒤 다시 실행 -->\n" + tags)
        .replace(/<title>[^<]*<\/title>/, "<title>" + attr(title) + "</title>");
    const file = path.join(root, page.file);
    if (fs.existsSync(file) && fs.readFileSync(file, "utf8") === html) {
        stats.same += 1;
        return;
    }
    fs.writeFileSync(file, html);
    stats.written += 1;
}

const pages = [];
const characterTemplate = readTemplate("character.html");
catalog.forEach((entry) => {
    pages.push({ file: "c/" + entry.id + ".html", template: characterTemplate, name: entry.name,
        description: (roles[entry.id] || {}).ability || "", image: entry.id + ".jpg" });
});
const editionTemplate = readTemplate("edition.html");
W.EDITIONS.forEach((edition) => {
    pages.push({ file: "edition-" + edition.id + ".html", template: editionTemplate, name: edition.name,
        description: edition.name + "(" + edition.alt + ") 캐릭터 목록과 소개", image: "edition-" + edition.id + ".jpg" });
});
const typeTemplate = readTemplate("type.html");
W.TYPES.map((type) => type.id).concat(W.TYPE_PAGES.filter((id) => !W.TEAM_NAMES[id])).forEach((id) => {
    const name = id === "experimental" ? W.EXPERIMENTAL_NAME : W.TEAM_NAMES[id];
    pages.push({ file: "type-" + id + ".html", template: typeTemplate, name: name,
        description: name + " 캐릭터 목록", image: id === "experimental" ? "site.jpg" : "type-" + id + ".jpg" });
});
const docTemplate = readTemplate("doc.html");
Object.keys(W.DOCS).forEach((key) => {
    const name = W.DOCS[key].title;
    pages.push({ file: "doc-" + key + ".html", template: docTemplate, name: name,
        description: "시계탑에 흐른 피 공식 위키 '" + name + "' 문서 한국어 번역", image: "site.jpg", alt: SITE_NAME });
});

fs.mkdirSync(path.join(root, "c"), { recursive: true });
pages.forEach(writePage);

const keep = new Set(pages.map((page) => page.file));
const removed = fs.readdirSync(path.join(root, "c")).map((file) => "c/" + file).filter((file) => file.endsWith(".html"))
    .concat(fs.readdirSync(root).filter((file) => /^(edition|type|doc)-[a-z0-9_-]+\.html$/.test(file)))
    .filter((file) => !keep.has(file));
removed.forEach((file) => fs.unlinkSync(path.join(root, file)));

console.log(`페이지 ${pages.length}개(캐릭터 ${catalog.length}): 새로 씀 ${stats.written} / 그대로 ${stats.same} / 지움 ${removed.length}`);
if (missingImages.length) {
    console.log(`FAIL 미리보기 그림 없음 ${missingImages.length}개: ${missingImages.join(", ")} → node tools/build-og-images.js`);
    process.exitCode = 1;
}
