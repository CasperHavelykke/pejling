// Laver skærmbilleder til butikkerne ud fra appens browserudgave.
//
// Brug: start appen med `npx expo start`, og kør så fra en mappe, hvor
// puppeteer-core og pngjs er installeret:
//   node scripts/skaermbilleder.js <mappe> [ios|android] [da|en]
// Kører appen på en anden port end 8081, sættes den med PORT=8082.
// Pakkerne er med vilje ikke en del af appens afhængigheder.
// Størrelse: 1290 × 2796 px, som er 430 × 932 punkter i tredobbelt opløsning.
// Appen tegnes i området mellem statuslinjen og hjemmestregen, og de to
// bånd lægges på bagefter i samme farve som skærmens kant.

const puppeteer = require("puppeteer-core");
const { PNG } = require("pngjs");
const fs = require("fs");
const path = require("path");

const OUT = process.argv[2];
// "ios" giver 1290 × 2796 til App Store. "android" giver 1200 × 2400 til
// Google Play, som højst tillader forholdet 2:1.
const TARGET = process.argv[3] === "android" ? "android" : "ios";
const LANG = process.argv[4] === "en" ? "en" : "da";
const URL = "http://localhost:" + (process.env.PORT || "8081");
const W = TARGET === "android" ? 400 : 430;
const H = TARGET === "android" ? 800 : 932;
const TOP = TARGET === "android" ? 36 : 59; // statuslinje
const BOTTOM = TARGET === "android" ? 22 : 34; // hjemmestreg
const SCALE = 3;

// Appens ur: lørdag 26. september 2026 kl. 23.41.
const NOW = new Date(2026, 8, 26, 23, 41, 0).getTime();
const MIN = 60_000;
const at = (d, h, m) => new Date(2026, 8, d, h, m).getTime();

let id = 1;
const e = (kind, unitsX10, t) => ({ id: id++, kind, unitsX10, t, weightKg: 80, sex: "m" });

const HISTORY = [
  e("øl", 10, at(4, 18, 30)),
  e("vin", 12, at(4, 19, 40)),
  e("øl", 10, at(5, 21, 0)),
  e("drink", 15, at(5, 21, 50)),
  e("drink", 15, at(5, 22, 40)),
  e("øl_alm_50", 15, at(5, 23, 30)),
  e("shot", 10, at(6, 0, 20)),
  e("vin", 12, at(12, 19, 0)),
  e("vin", 12, at(12, 20, 10)),
  e("øl", 10, at(18, 20, 0)),
  e("drink", 15, at(19, 21, 0)),
  e("drink", 15, at(19, 21, 50)),
  e("øl", 10, at(19, 22, 40)),
  e("shot", 10, at(19, 23, 30)),
  e("øl", 10, at(25, 19, 0)),
];

const LIGHT = [e("øl", 10, NOW - 75 * MIN), e("drink", 15, NOW - 12 * MIN)];

const EVENING = [
  e("øl", 10, NOW - 165 * MIN),
  e("vin", 12, NOW - 120 * MIN),
  e("øl", 10, NOW - 70 * MIN),
  e("drink", 15, NOW - 12 * MIN),
];

const HEAVY = [
  e("øl", 10, NOW - 170 * MIN),
  e("drink", 15, NOW - 140 * MIN),
  e("drink", 15, NOW - 110 * MIN),
  e("shot", 10, NOW - 95 * MIN),
  e("øl_stærk_50", 23, NOW - 70 * MIN),
  e("drink", 15, NOW - 40 * MIN),
  e("shot", 10, NOW - 25 * MIN),
  e("drink", 15, NOW - 6 * MIN),
];

const SHOTS = [
  { name: "01-hovedskaerm", drinks: LIGHT, mode: "simple" },
  { name: "02-avanceret", drinks: LIGHT, mode: "advanced" },
  {
    name: "03-i-aften",
    drinks: EVENING,
    mode: "simple",
    click: LANG === "en" ? "Show the list" : "Vis listen",
  },
  {
    name: "04-historik",
    drinks: [...HISTORY, ...EVENING],
    mode: "simple",
    path: "/historik",
    click: LANG === "en" ? "Saturday 19 September" : "lørdag 19. september",
  },
  { name: "05-tag-hjem", drinks: HEAVY, mode: "simple" },
];

const hex = (r, g, b) =>
  "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");

function statusBar(color) {
  // Ur, signal, wifi og batteri som på en iPhone.
  return `
  <div style="position:absolute;left:0;right:0;top:0;height:${TOP}px;color:${color};font:600 17px -apple-system,'SF Pro Text','Segoe UI',Inter,sans-serif">
    <div style="position:absolute;left:${TARGET === "android" ? 24 : 52}px;top:${TARGET === "android" ? 9 : 21}px;letter-spacing:-0.2px;font-size:${TARGET === "android" ? 15 : 17}px">${LANG === "en" ? "23:41" : "23.41"}</div>
    <svg style="position:absolute;right:${TARGET === "android" ? 20 : 34}px;top:${TARGET === "android" ? 11 : 23}px" width="78" height="14" viewBox="0 0 78 14" fill="${color}">
      <rect x="0" y="9" width="3.2" height="4" rx="1"/><rect x="5" y="6.5" width="3.2" height="6.5" rx="1"/>
      <rect x="10" y="3.5" width="3.2" height="9.5" rx="1"/><rect x="15" y="0.5" width="3.2" height="12.5" rx="1"/>
      <path d="M32 3.2c2.6 0 4.9 1 6.6 2.7l-1.2 1.3A7.6 7.6 0 0 0 32 5a7.6 7.6 0 0 0-5.4 2.2l-1.2-1.3A9.4 9.4 0 0 1 32 3.2zm0 3.6c1.6 0 3 .6 4.1 1.7l-1.2 1.3a4 4 0 0 0-5.8 0l-1.2-1.3A5.8 5.8 0 0 1 32 6.8zm0 3.5c.7 0 1.3.3 1.8.8L32 13l-1.8-1.900c.5-.5 1.1-.800 1.8-.800z"/>
      <rect x="47.5" y="1" width="24" height="12" rx="3.6" fill="none" stroke="${color}" stroke-opacity="0.4"/>
      <rect x="49.2" y="2.7" width="20.6" height="8.6" rx="2.2"/>
      <path d="M73 5v4c.8-.300 1.5-1.1 1.5-2S73.8 5.3 73 5z" fill-opacity="0.45"/>
    </svg>
  </div>`;
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: "new",
    args: ["--hide-scrollbars"],
  });

  for (const shot of SHOTS) {
    const page = await browser.newPage();
    await page.setViewport({
      width: W,
      height: H - TOP - BOTTOM,
      deviceScaleFactor: SCALE,
      isMobile: true,
      hasTouch: true,
    });

    // Flyt appens ur til lørdag aften, og læg prøvedata ind før første visning.
    await page.evaluateOnNewDocument(
      (now, drinks, mode, lang) => {
        const offset = now - Date.now();
        const Real = Date;
        class Fake extends Real {
          constructor(...a) {
            if (a.length === 0) super(Real.now() + offset);
            else super(...a);
          }
          static now() {
            return Real.now() + offset;
          }
        }
        window.Date = Fake;
        localStorage.setItem("pejling.drinks", JSON.stringify(drinks));
        localStorage.setItem(
          "pejling.settings",
          JSON.stringify({ weightKg: "80", sex: "m", mode, lang }),
        );
      },
      NOW,
      shot.drinks,
      shot.mode,
      LANG,
    );

    await page.goto(URL + (shot.path ?? "/"), { waitUntil: "networkidle0" });
    await page.evaluate(() => document.fonts.ready);
    await new Promise((r) => setTimeout(r, 1500));

    if (shot.click) {
      await page.evaluate((label) => {
        const el = [...document.querySelectorAll("[role=button],[role=link]")].find(
          (b) => (b.getAttribute("aria-label") || "").includes(label),
        );
        if (!el) throw new Error("fandt ikke: " + label);
        el.click();
      }, shot.click);
    }
    // Lad animationerne falde til ro.
    await new Promise((r) => setTimeout(r, 1600));

    const appPng = await page.screenshot({ type: "png" });
    await page.close();

    // Farven langs øverste og nederste kant bruges til de to bånd.
    const img = PNG.sync.read(appPng);
    const px = (x, y) => {
      const i = (y * img.width + x) * 4;
      return [img.data[i], img.data[i + 1], img.data[i + 2]];
    };
    const topColor = hex(...px(6, 2));
    const bottomColor = hex(...px(6, img.height - 3));
    const lum = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    const barInk = lum(px(6, 2)) > 140 ? "#000000" : "#ffffff";

    const frame = await browser.newPage();
    await frame.setViewport({ width: W, height: H, deviceScaleFactor: SCALE });
    await frame.setContent(`<!doctype html><html><body style="margin:0;width:${W}px;height:${H}px;position:relative;overflow:hidden;background:${topColor}">
      <div style="position:absolute;left:0;right:0;bottom:0;height:${BOTTOM + 40}px;background:${bottomColor}"></div>
      <img src="data:image/png;base64,${appPng.toString("base64")}" style="position:absolute;left:0;top:${TOP}px;width:${W}px;height:${H - TOP - BOTTOM}px"/>
      ${statusBar(barInk)}
      <div style="position:absolute;left:50%;bottom:${TARGET === "android" ? 7 : 8}px;width:${TARGET === "android" ? 108 : 139}px;height:${TARGET === "android" ? 4 : 5}px;margin-left:${TARGET === "android" ? -54 : -69.5}px;border-radius:3px;background:${barInk};opacity:0.9"></div>
    </body></html>`);
    await new Promise((r) => setTimeout(r, 300));
    const file = path.join(OUT, shot.name + ".png");
    await frame.screenshot({ path: file, type: "png" });
    await frame.close();

    const done = PNG.sync.read(fs.readFileSync(file));
    console.log(shot.name, done.width + "x" + done.height, "top", topColor, "bund", bottomColor);
  }

  await browser.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
