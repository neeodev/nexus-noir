// Vérification navigateur réelle (pilote le Chrome local via puppeteer-core).
// Usage: node scripts/verify-reactions.mjs
import puppeteer from "puppeteer-core";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE = process.env.BASE_URL ?? "http://localhost:3001";
const STORY = `${BASE}/nouvelles/le-dernier-verre`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const jsErrors = [];
const net = [];
function watch(page) {
  page.on("pageerror", (e) => jsErrors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    const t = m.text();
    if (t.includes("status of 401")) return; // 401 attendu sur /auth/user (visiteur)
    jsErrors.push(`console.error: ${t}`);
  });
  page.on("response", (r) => {
    const u = r.url();
    if (u.includes("/api/v1/") || u.includes("/sanctum/")) net.push(`${r.status()} ${u}`);
  });
}

// Poll une condition côté page sans jeter (retourne true/false).
async function until(page, fn, ms = 12000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    if (await page.evaluate(fn).catch(() => false)) return true;
    await sleep(250);
  }
  return false;
}

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
let ok = true;
try {
  const page = await browser.newPage();
  watch(page);

  // 1. Visiteur
  await page.goto(STORY, { waitUntil: "domcontentloaded" });
  const guestBar = await until(page, () => document.querySelectorAll('.mt-12 button').length >= 7);
  console.log(guestBar ? "✓ visiteur : ReactionBar affichée" : "✗ visiteur : bar absente");
  ok &&= guestBar;

  // 2. Connexion
  await page.goto(`${BASE}/connexion`, { waitUntil: "domcontentloaded" });
  await until(page, () => !!document.querySelector('input[type="email"]'));
  await page.type('input[type="email"]', "test@example.com");
  await page.type('input[type="password"]', "password");
  await page.click('button[type="submit"]');
  const loggedIn = await until(page, () => location.pathname === "/");
  console.log(loggedIn ? "✓ connexion → redirection accueil" : "✗ connexion : pas de redirection");
  ok &&= loggedIn;

  // 3. Nouvelle + clic réaction
  await page.goto(STORY, { waitUntil: "domcontentloaded" });
  const barAuth = await until(page, () => document.querySelectorAll('.mt-12 button').length >= 7);
  ok &&= barAuth;
  if (barAuth) {
    await page.click(".mt-12 button");
    const active = await until(page, () => !!document.querySelector(".border-red-700"));
    console.log(active ? "✓ clic réaction → bouton actif" : "✗ clic : aucun bouton actif");
    ok &&= active;

    // 4. Toggle off
    if (active) {
      await page.click(".border-red-700");
      const off = await until(page, () => !document.querySelector(".border-red-700"));
      console.log(off ? "✓ re-clic → toggle off" : "✗ toggle off échoué");
      ok &&= off;
    }
  }

  console.log("\n=== réseau API ===");
  net.forEach((l) => console.log("  " + l));
  if (jsErrors.length) {
    console.log("\n❌ ERREURS JS :");
    jsErrors.forEach((e) => console.log("  " + e));
    ok = false;
  }
} finally {
  await browser.close();
}

console.log(ok && jsErrors.length === 0 ? "\n✅ OK — flux complet sans erreur JS" : "\n❌ ÉCHEC");
process.exit(ok && jsErrors.length === 0 ? 0 : 1);
