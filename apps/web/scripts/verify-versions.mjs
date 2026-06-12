// Vérification navigateur de l'historique des versions.
// Usage: node scripts/verify-versions.mjs
import puppeteer from "puppeteer-core";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TITLE = "Versions test " + Math.floor(Math.random() * 1e6);
const A = "ALPHA" + Math.floor(Math.random() * 1e6);
const B = "BETA" + Math.floor(Math.random() * 1e6);

const jsErrors = [];
function watch(page) {
  page.on("pageerror", (e) => jsErrors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    const t = m.text();
    if (t.includes("status of 401") || t.includes("status of 403")) return;
    jsErrors.push(`console.error: ${t}`);
  });
  page.on("dialog", async (d) => await d.accept()); // confirm() de restauration
}
async function until(page, fn, arg, ms = 15000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    if (await page.evaluate(fn, arg).catch(() => false)) return true;
    await sleep(250);
  }
  return false;
}
const clickExact = (page, label) =>
  page.evaluate((l) => [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === l)?.click(), label);
const previewText = (page) =>
  page.evaluate(() => {
    const p = [...document.querySelectorAll(".nn-prose")].filter((el) => !el.classList.contains("nn-editor"))[0];
    return p ? p.innerText : "";
  });

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
let ok = true;
const step = (cond, msg) => { console.log((cond ? "✓ " : "✗ ") + msg); ok &&= cond; };

try {
  const page = await browser.newPage();
  watch(page);
  const isMac = process.platform === "darwin";
  const mod = isMac ? "Meta" : "Control";

  await page.goto(`${BASE}/connexion`, { waitUntil: "domcontentloaded" });
  await until(page, () => !!document.querySelector('input[type="email"]'));
  await page.type('input[type="email"]', "admin@example.com");
  await page.type('input[type="password"]', "password");
  await page.click('button[type="submit"]');
  step(await until(page, () => location.pathname === "/"), "connexion admin");

  await page.goto(`${BASE}/admin/nouvelles/nouveau`, { waitUntil: "domcontentloaded" });
  await until(page, () => !!document.querySelector(".ProseMirror"));
  await page.type('input[placeholder="Titre de la nouvelle"]', TITLE);

  // Version A
  await page.click(".ProseMirror");
  await page.keyboard.type(A);
  await clickExact(page, "Enregistrer");
  step(await until(page, () => /\/admin\/nouvelles\/\d+/.test(location.pathname)), "création (version A enregistrée)");
  await sleep(800);

  // Remplace par version B
  await page.click(".ProseMirror");
  await page.keyboard.down(mod);
  await page.keyboard.press("a");
  await page.keyboard.up(mod);
  await page.keyboard.press("Backspace");
  await page.keyboard.type(B);
  await sleep(300);
  step((await previewText(page)).includes(B) && !(await previewText(page)).includes(A), "contenu remplacé par B");
  await clickExact(page, "Enregistrer");
  await sleep(800);

  // Ouvre l'historique
  await clickExact(page, "Versions");
  step(await until(page, () => [...document.querySelectorAll("button")].some((b) => b.textContent.trim() === "Restaurer")), "historique affiché");

  // Restaure (la version A, la plus ancienne = dernière de la liste)
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll("button")].filter((b) => b.textContent.trim() === "Restaurer");
    btns[btns.length - 1]?.click();
  });
  const back = await until(page, (a) => {
    const p = [...document.querySelectorAll(".nn-prose")].filter((el) => !el.classList.contains("nn-editor"))[0];
    return p ? p.innerText.includes(a) : false;
  }, A);
  step(back, "restauration → contenu A revenu dans l'éditeur");

  if (jsErrors.length) {
    console.log("\n❌ ERREURS JS :");
    jsErrors.forEach((e) => console.log("  " + e));
    ok = false;
  }
} finally {
  await browser.close();
}

console.log(ok ? "\n✅ OK — historique des versions (snapshot + restauration)" : "\n❌ ÉCHEC");
process.exit(ok ? 0 : 1);
