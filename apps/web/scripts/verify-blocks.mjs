// Vérification navigateur des blocs Nexus Noir custom.
// Usage: node scripts/verify-blocks.mjs
import puppeteer from "puppeteer-core";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TITLE = "Blocs test " + Math.floor(Math.random() * 1e6);

const jsErrors = [];
function watch(page) {
  page.on("pageerror", (e) => jsErrors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    const t = m.text();
    if (t.includes("status of 401") || t.includes("status of 403")) return;
    jsErrors.push(`console.error: ${t}`);
  });
  // Le bouton dialogue ouvre un window.prompt : on l'accepte avec un locuteur.
  page.on("dialog", async (d) => {
    await d.accept("Le Gardien");
  });
}
async function until(page, fn, arg, ms = 12000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    if (await page.evaluate(fn, arg).catch(() => false)) return true;
    await sleep(250);
  }
  return false;
}
async function clickByTitle(page, title) {
  await page.evaluate((t) => {
    [...document.querySelectorAll("button")].find((b) => b.getAttribute("title")?.startsWith(t))?.click();
  }, title);
}
// NB: le sélecteur est passé en ARGUMENT (page.evaluate ne capture pas les closures).
const previewHas = (page, sel) =>
  until(page, (s) => {
    const previews = [...document.querySelectorAll(".nn-prose")].filter((el) => !el.classList.contains("nn-editor"));
    return previews.some((el) => el.querySelector(s));
  }, sel);

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
let ok = true;
const step = (cond, msg) => { console.log((cond ? "✓ " : "✗ ") + msg); ok &&= cond; };

try {
  const page = await browser.newPage();
  watch(page);

  await page.goto(`${BASE}/connexion`, { waitUntil: "domcontentloaded" });
  await until(page, () => !!document.querySelector('input[type="email"]'));
  await page.type('input[type="email"]', "admin@example.com");
  await page.type('input[type="password"]', "password");
  await page.click('button[type="submit"]');
  step(await until(page, () => location.pathname === "/"), "connexion admin");

  await page.goto(`${BASE}/admin/nouvelles/nouveau`, { waitUntil: "domcontentloaded" });
  step(await until(page, () => !!document.querySelector(".ProseMirror")), "éditeur monté");
  await page.type('input[placeholder="Titre de la nouvelle"]', TITLE);

  await page.click(".ProseMirror");
  await page.keyboard.type("Un fragment retrouvé dans le secteur 7.");
  await sleep(300);

  // On enveloppe successivement (les blocs s'imbriquent, peu importe : on
  // vérifie que chaque commande + rendu fonctionne).
  await clickByTitle(page, "Bloc lore");
  step(await previewHas(page, '[data-nn="lore"]'), "bloc lore rendu");

  await clickByTitle(page, "Bloc transmission");
  step(await previewHas(page, '[data-nn="transmission"]'), "bloc transmission rendu");

  await clickByTitle(page, "Violence");
  step(await previewHas(page, '[data-nn="violence"]'), "bloc violence rendu");

  await clickByTitle(page, "Dialogue");
  step(await previewHas(page, '[data-nn="dialogue"][data-speaker="Le Gardien"]'), "dialogue avec locuteur rendu");

  // Enregistrer + publier
  await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "Enregistrer")?.click());
  await until(page, () => /\/admin\/nouvelles\/\d+/.test(location.pathname));
  await sleep(1000);
  await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "Publier")?.click());
  step(await until(page, () => document.querySelector("select")?.value === "published", undefined, 20000), "publication");

  const slug = await page.evaluate(() => {
    const a = [...document.querySelectorAll("a")].find((x) => x.textContent.trim() === "Voir");
    return a ? new URL(a.href).pathname : null;
  });
  if (slug) {
    await page.goto(`${BASE}${slug}`, { waitUntil: "domcontentloaded" });
    const allFour = await until(page, () => {
      const b = document.body.innerHTML;
      return ["lore", "transmission", "violence", "dialogue"].every((n) => b.includes(`data-nn="${n}"`));
    });
    step(allFour, "les 4 blocs présents sur la page publique");
  } else {
    step(false, "lien public");
  }

  if (jsErrors.length) {
    console.log("\n❌ ERREURS JS :");
    jsErrors.forEach((e) => console.log("  " + e));
    ok = false;
  }
} finally {
  await browser.close();
}

console.log(ok ? "\n✅ OK — blocs Nexus Noir (dialogue+locuteur, lore, transmission, violence)" : "\n❌ ÉCHEC");
process.exit(ok ? 0 : 1);
