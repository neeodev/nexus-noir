// Vérification navigateur de l'éditeur (Bureau Noir).
// Usage: node scripts/verify-editor.mjs
import puppeteer from "puppeteer-core";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const MARK = "PassageDeTestNexus" + Math.floor(Math.random() * 1e6);
const TITLE = "Histoire de test " + Math.floor(Math.random() * 1e6);

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
async function until(page, fn, arg, ms = 12000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    if (await page.evaluate(fn, arg).catch(() => false)) return true;
    await sleep(250);
  }
  return false;
}
// Clique le bouton dont le texte est EXACTEMENT `label` (évite "Publier" vs "Dépublier").
async function clickButton(page, label) {
  return page.evaluate((lbl) => {
    const btn = [...document.querySelectorAll("button, a")].find(
      (b) => b.textContent.trim() === lbl,
    );
    if (btn) { btn.click(); return true; }
    return false;
  }, label);
}

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
let ok = true;
const step = (cond, msg) => { console.log((cond ? "✓ " : "✗ ") + msg); ok &&= cond; };

try {
  const page = await browser.newPage();
  watch(page);

  // Connexion admin (super_admin)
  await page.goto(`${BASE}/connexion`, { waitUntil: "domcontentloaded" });
  await until(page, () => !!document.querySelector('input[type="email"]'));
  await page.type('input[type="email"]', "admin@example.com");
  await page.type('input[type="password"]', "password");
  await page.click('button[type="submit"]');
  step(await until(page, () => location.pathname === "/"), "connexion admin");

  // Liste admin -> créer
  await page.goto(`${BASE}/admin/nouvelles`, { waitUntil: "domcontentloaded" });
  step(await until(page, () => document.body.innerText.includes("Nouvelle")), "liste admin chargée");
  await page.goto(`${BASE}/admin/nouvelles/nouveau`, { waitUntil: "domcontentloaded" });
  step(await until(page, () => !!document.querySelector(".ProseMirror")), "éditeur monté");

  // Titre
  await page.type('input[placeholder="Titre de la nouvelle"]', TITLE);

  // Frappe dans l'éditeur Tiptap
  await page.click(".ProseMirror");
  await page.keyboard.type(MARK + " contenu de l'histoire.");

  // Aperçu (à droite) : .nn-prose NON éditable contient le texte
  const previewOk = await until(
    page,
    (m) => {
      const previews = [...document.querySelectorAll(".nn-prose")].filter(
        (el) => !el.classList.contains("nn-editor"),
      );
      return previews.some((el) => el.innerText.includes(m));
    },
    MARK,
  );
  step(previewOk, "aperçu live reflète la frappe");

  // Test d'un bouton de style : gras
  await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) => x.getAttribute("title") === "Gras");
    b?.click();
  });
  await page.keyboard.type("MotEnGras");
  const boldOk = await until(page, () => {
    const previews = [...document.querySelectorAll(".nn-prose")].filter((el) => !el.classList.contains("nn-editor"));
    return previews.some((el) => el.querySelector("strong"));
  });
  step(boldOk, "bouton Gras produit du <strong> dans l'aperçu");

  // Enregistrer
  await clickButton(page, "Enregistrer");
  step(await until(page, () => document.body.innerText.includes("Enregistré")), "enregistrement (brouillon)");
  step(await until(page, () => /\/admin\/nouvelles\/\d+/.test(location.pathname)), "URL passée en mode édition (id)");
  await sleep(1000); // laisse l'autosave éventuel se terminer

  // Publier (le serveur PHP de dev est mono-thread → on laisse le temps)
  await clickButton(page, "Publier");
  step(
    await until(page, () => document.querySelector("select")?.value === "published", undefined, 20000),
    "publication (statut publié)",
  );

  // Lien "Voir" -> page publique
  const slug = await page.evaluate(() => {
    const a = [...document.querySelectorAll("a")].find((x) => x.textContent.trim() === "Voir");
    return a ? new URL(a.href).pathname : null;
  });
  step(Boolean(slug), "lien public disponible");
  if (slug) {
    await page.goto(`${BASE}${slug}`, { waitUntil: "domcontentloaded" });
    step(await until(page, (m) => document.body.innerText.includes(m), MARK), "contenu visible sur la page publique");
  }

  if (jsErrors.length) {
    console.log("\n❌ ERREURS JS :");
    jsErrors.forEach((e) => console.log("  " + e));
    ok = false;
  }
} finally {
  await browser.close();
}

console.log(ok ? "\n✅ OK — éditeur complet (frappe, style, aperçu, brouillon, publication, public)" : "\n❌ ÉCHEC");
process.exit(ok ? 0 : 1);
