// Vérification navigateur de l'upload d'images (couverture + image inline).
// Usage: node scripts/verify-images.mjs
import puppeteer from "puppeteer-core";
import { writeFileSync } from "node:fs";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TITLE = "Images test " + Math.floor(Math.random() * 1e6);

// Petit PNG 2x2 valide.
const PNG = "/tmp/nn-verify.png";
writeFileSync(
  PNG,
  Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAEklEQVR4nGNgYGD4z8DAwMAAAA8AAf8X9b0AAAAASUVORK5CYII=",
    "base64",
  ),
);

const jsErrors = [];
function watch(page) {
  page.on("pageerror", (e) => jsErrors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    const t = m.text();
    if (t.includes("status of 401") || t.includes("status of 403")) return;
    jsErrors.push(`console.error: ${t}`);
  });
}
async function until(page, fn, arg, ms = 15000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    if (await page.evaluate(fn, arg).catch(() => false)) return true;
    await sleep(250);
  }
  return false;
}

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

  // Image inline : 1er input file (toolbar). On dépose le fichier directement.
  let inputs = await page.$$('input[type="file"]');
  await inputs[0].uploadFile(PNG);
  const inlineOk = await until(page, () => {
    const previews = [...document.querySelectorAll(".nn-prose")].filter((el) => !el.classList.contains("nn-editor"));
    return previews.some((el) => el.querySelector('img[src*="/storage/media"]'));
  });
  step(inlineOk, "image inline uploadée + rendue dans l'aperçu");

  // Couverture : dernier input file (panneau Paramètres).
  inputs = await page.$$('input[type="file"]');
  await inputs[inputs.length - 1].uploadFile(PNG);
  step(
    await until(page, () => document.body.innerHTML.includes("Retirer")),
    "couverture uploadée (miniature + bouton Retirer)",
  );

  // Enregistrer + publier
  await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "Enregistrer")?.click());
  await until(page, () => /\/admin\/nouvelles\/\d+/.test(location.pathname));
  await sleep(1200);
  await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "Publier")?.click());
  step(await until(page, () => document.querySelector("select")?.value === "published", undefined, 20000), "publication");

  const slug = await page.evaluate(() => {
    const a = [...document.querySelectorAll("a")].find((x) => x.textContent.trim() === "Voir");
    return a ? new URL(a.href).pathname : null;
  });
  if (slug) {
    await page.goto(`${BASE}${slug}`, { waitUntil: "domcontentloaded" });
    const imgs = await until(page, () => document.querySelectorAll('img[src*="/storage/media"]').length >= 2);
    step(imgs, "couverture + image inline visibles sur la page publique");
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

console.log(ok ? "\n✅ OK — images (inline + couverture, éditeur + public)" : "\n❌ ÉCHEC");
process.exit(ok ? 0 : 1);
