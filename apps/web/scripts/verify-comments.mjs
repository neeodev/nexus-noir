// Vérification navigateur du fil de commentaires (threads).
// Usage: node scripts/verify-comments.mjs
import puppeteer from "puppeteer-core";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE = process.env.BASE_URL ?? "http://localhost:3001";
const STORY = `${BASE}/nouvelles/le-dernier-verre`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const ROOT = "Murmure racine de test " + Math.floor(Math.random() * 1e6);
const REPLY = "Reponse imbriquee de test " + Math.floor(Math.random() * 1e6);

const jsErrors = [];
function watch(page) {
  page.on("pageerror", (e) => jsErrors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    const t = m.text();
    if (t.includes("status of 401")) return;
    jsErrors.push(`console.error: ${t}`);
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

// Clique le 1er bouton dont le texte contient `label` (dans la section commentaires).
async function clickButton(page, label) {
  return page.evaluate((lbl) => {
    const btn = [...document.querySelectorAll("button")].find((b) =>
      b.textContent.trim().toLowerCase().includes(lbl.toLowerCase()),
    );
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  }, label);
}

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
let ok = true;
const step = (cond, msg) => {
  console.log((cond ? "✓ " : "✗ ") + msg);
  ok &&= cond;
};

try {
  const page = await browser.newPage();
  watch(page);

  // Connexion
  await page.goto(`${BASE}/connexion`, { waitUntil: "domcontentloaded" });
  await until(page, () => !!document.querySelector('input[type="email"]'));
  await page.type('input[type="email"]', "test@example.com");
  await page.type('input[type="password"]', "password");
  await page.click('button[type="submit"]');
  step(await until(page, () => location.pathname === "/"), "connexion");

  // Page nouvelle : formulaire racine visible
  await page.goto(STORY, { waitUntil: "domcontentloaded" });
  step(await until(page, () => !!document.querySelector("textarea")), "formulaire commentaire visible");

  // Poste un commentaire racine
  await page.type("textarea", ROOT);
  await clickButton(page, "Publier");
  step(await until(page, (t) => document.body.innerText.includes(t), ROOT), "commentaire racine affiché");

  // Répond au commentaire
  await clickButton(page, "Répondre");
  await until(page, () => document.querySelectorAll("textarea").length >= 2);
  // La dernière textarea = formulaire de réponse (autoFocus)
  await page.evaluate((txt) => {
    const tas = document.querySelectorAll("textarea");
    const ta = tas[tas.length - 1];
    ta.focus();
    const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
    setter.call(ta, txt);
    ta.dispatchEvent(new Event("input", { bubbles: true }));
  }, REPLY);
  // Clique le bouton "Répondre" de soumission (le dernier)
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll("button")].filter(
      (b) => b.textContent.trim() === "Répondre",
    );
    btns[btns.length - 1]?.click();
  });
  step(await until(page, (t) => document.body.innerText.includes(t), REPLY), "réponse imbriquée affichée");

  // La réponse doit être indentée (dans un conteneur à bordure gauche)
  const nested = await page.evaluate((t) => {
    const els = [...document.querySelectorAll(".border-l")];
    return els.some((el) => el.innerText.includes(t));
  }, REPLY);
  step(nested, "réponse rendue en thread (indentée)");

  if (jsErrors.length) {
    console.log("\n❌ ERREURS JS :");
    jsErrors.forEach((e) => console.log("  " + e));
    ok = false;
  }
} finally {
  await browser.close();
}

console.log(ok ? "\n✅ OK — fil de commentaires en thread, sans erreur JS" : "\n❌ ÉCHEC");
process.exit(ok ? 0 : 1);
