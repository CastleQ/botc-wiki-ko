// 링크 미리보기 그림 만들기 — og/<id>.jpg (400×400, 양피지색 바탕 + 공식 캐릭터 아이콘)
//
// 사용법 (도감 저장소 루트):
//   PWMOD=<playwright 모듈 경로> node tools/build-og-images.js [PG+ public 폴더]
//   기본값: ../pocket-grimoire/public  (아이콘: img/official/<id>_0.webp, 목록: guide/data/catalog.json)
//
// webp를 못 읽는 메신저가 있어 JPG로 만든다. 아이콘 원본은 PG+ 저장소 내장본만 쓴다(외부 주소 금지).
// 이미 있는 그림은 건너뛴다(C-7). 새 캐릭터가 늘었을 때만 실행하면 된다. 다시 만들려면 --force.

const fs = require("fs");
const path = require("path");
const { chromium } = require(process.env.PWMOD || "playwright");

const root = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const force = args.includes("--force");
const publicDir = path.resolve(args.find((a) => !a.startsWith("--")) || path.join(root, "..", "pocket-grimoire", "public"));
const catalog = JSON.parse(fs.readFileSync(path.join(publicDir, "guide", "data", "catalog.json"), "utf8"));
const outDir = path.join(root, "og");
fs.mkdirSync(outDir, { recursive: true });

const BACKGROUND = "#efe6d6";
const SIZE = 400;

chromium.launch().then((browser) => browser.newPage().then((page) => {
    let made = 0;
    let skipped = 0;
    const failed = [];
    return catalog.reduce((chain, entry) => chain.then(() => {
        const out = path.join(outDir, entry.id + ".jpg");
        if (!force && fs.existsSync(out)) {
            skipped += 1;
            return null;
        }
        const icon = path.join(publicDir, "img", "official", entry.id + "_0.webp");
        if (!fs.existsSync(icon)) {
            failed.push(entry.id);
            return null;
        }
        const data = "data:image/webp;base64," + fs.readFileSync(icon).toString("base64");
        return page.evaluate((opts) => new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = canvas.height = opts.size;
                const ctx = canvas.getContext("2d");
                ctx.fillStyle = opts.background;
                ctx.fillRect(0, 0, opts.size, opts.size);
                ctx.imageSmoothingQuality = "high";
                ctx.drawImage(img, 0, 0, opts.size, opts.size);
                resolve(canvas.toDataURL("image/jpeg", 0.88));
            };
            img.onerror = () => resolve("");
            img.src = opts.data;
        }), { data, size: SIZE, background: BACKGROUND }).then((jpg) => {
            if (!jpg.startsWith("data:image/jpeg")) {
                failed.push(entry.id);
                return;
            }
            fs.writeFileSync(out, Buffer.from(jpg.split(",")[1], "base64"));
            made += 1;
        });
    }), Promise.resolve()).then(() => {
        console.log(`미리보기 그림: 새로 만듦 ${made} / 이미 있음 ${skipped} / 실패 ${failed.length}${failed.length ? " (" + failed.join(", ") + ")" : ""}`);
        if (failed.length) {
            process.exitCode = 1;
        }
        return browser.close();
    });
}));
