/**
 * Records the report walkthrough by driving the published page.
 *   node tools/record-walkthrough.mjs <url> <outDir>
 */
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const URL_ = process.argv[2] ?? "https://sana-qa-report.vercel.app/";
const OUT = process.argv[3] ?? "media-out";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1, colorScheme: "light",
  recordVideo: { dir: OUT, size: { width: 1280, height: 720 } },
});
const page = await context.newPage();
const beat = (ms) => page.waitForTimeout(ms);

await page.goto(URL_, { waitUntil: "networkidle" });
await page.addStyleTag({ content: `
  #wt { position:fixed; left:0; right:0; bottom:0; z-index:99; background:rgba(12,14,16,.92); color:#fff;
        font:600 22px/1.35 "Public Sans",system-ui,sans-serif; padding:14px 28px 16px; }
  #wt small { display:block; font:400 16px/1.35 system-ui,sans-serif; color:#ffd60a; margin-top:4px; }
  .wt-hi { outline:3px solid #ffd60a; outline-offset:4px; transition:outline-color .3s; }` });
await page.evaluate(() => { const d = document.createElement("div"); d.id = "wt"; d.innerHTML = "sana.run QA-2609-11 walkthrough<small>Panduan laporan QA-2609-11</small>"; document.body.appendChild(d); });

const say = (en, id) => page.evaluate(([en, id]) => {
  document.getElementById("wt").innerHTML = en + "<small>" + id + "</small>";
}, [en, id]);

const go = async (selector, en, id, hold = 4200, offset = 90) => {
  await page.evaluate(([sel, off]) => {
    document.querySelectorAll(".wt-hi").forEach((n) => n.classList.remove("wt-hi"));
    const el = typeof sel === "string" ? document.querySelector(sel) : null;
    if (!el) return;
    el.classList.add("wt-hi");
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - off, behavior: "smooth" });
  }, [selector, offset]);
  await say(en, id);
  await beat(hold);
};

const h2 = (n) => `section:nth-of-type(${n}) h2`;

await go(".masthead", "QA-2609-11: defect report for spot and perps trading on sana.run, prepared by nayrbryanGaming.",
  "Laporan cacat perdagangan spot dan perps sana.run, disusun oleh nayrbryanGaming.", 5200, 20);
await go(h2(2), "Scope and method: manual testing with real funds, six screen recordings and four screenshots.",
  "Metode: pengujian manual dengan dana nyata, enam rekaman layar dan empat tangkapan layar.");
await go(h2(3), "Severity follows the P0 to P3 scale of the brief.", "Tingkat keparahan mengikuti skala P0 sampai P3 dari brief.");
await go(h2(4), "Thirteen defects: three P1, eight P2, two P3, plus eleven improvement proposals.",
  "Tiga belas cacat: tiga P1, delapan P2, dua P3, ditambah sebelas usulan perbaikan.", 5000);

await go(".rec", "A-05, the most serious finding: one confirmed short produced both a success and an Order Failed message, while the order filled.",
  "A-05, temuan paling berat: satu short menghasilkan pesan berhasil dan Order Failed, padahal order terisi.", 5200);
await page.evaluate(() => {
  const v = document.querySelector('.rec video'); v.scrollIntoView({ behavior: "smooth", block: "center" });
  v.muted = true; v.currentTime = 2; v.play();
});
await say("Every defect embeds a short muted highlight clip cut to the key moments.", "Setiap cacat memuat klip sorotan singkat tanpa suara.");
await beat(9000);
await page.evaluate(() => document.querySelector('.rec video').pause());

await go(".rec figure.tall", "Evidence frames are shown one by one, each with a timecode.", "Gambar bukti ditampilkan satu per satu, lengkap dengan kode waktu.", 4000, 60);
await go(".rec dl.fnote", "Under every figure: what it shows, severity, cause, possible impact, solution, evidence, steps to reproduce and feedback.",
  "Di bawah setiap gambar: yang terlihat, tingkat, penyebab, dampak, solusi, bukti, langkah reproduksi dan masukan.", 6500, 140);

for (const [id, en, idn] of [
  ["A-06", "A-06: the confirmation shows 0.0120 SOL, but the position fills 0.01 SOL.", "A-06: konfirmasi menampilkan 0,0120 SOL, posisi terisi 0,01 SOL."],
  ["A-01", "A-01: the Buy button stays enabled beside a Not enough USDC warning.", "A-01: tombol beli tetap aktif di samping peringatan saldo tidak cukup."],
  ["A-13", "A-13: a rate-limited account read shows zero balance and zero positions.", "A-13: pembacaan akun yang terkena batas laju menampilkan saldo dan posisi nol."],
  ["A-11", "A-11: the perps chart has no interval selector.", "A-11: grafik perps tidak punya pilihan interval."],
]) {
  await page.evaluate((id) => {
    const s = [...document.querySelectorAll(".rec .id")].find((n) => n.textContent.trim() === id);
    document.querySelectorAll(".wt-hi").forEach((n) => n.classList.remove("wt-hi"));
    const r = s.closest(".rec"); r.classList.add("wt-hi");
    window.scrollTo({ top: r.getBoundingClientRect().top + window.scrollY - 20, behavior: "smooth" });
  }, id);
  await say(en, idn);
  await beat(4200);
}

await go(h2(6), "Improvement proposals are filed separately from defects.", "Usulan perbaikan dicatat terpisah dari cacat.");
await go(h2(8), "A recommended fix order, starting with A-05.", "Urutan perbaikan yang disarankan, dimulai dari A-05.");
await go(h2(9), "Complete, uncut and muted recordings are kept for independent verification.",
  "Rekaman utuh tanpa potongan dan tanpa suara disimpan untuk verifikasi.", 4800);
await go(h2(10), "Coverage limitations are stated openly.", "Keterbatasan pengujian disampaikan terbuka.");
await go(h2(11), "An estimated value of the findings closes the report.", "Estimasi nilai temuan menutup laporan.");

await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
await say("The full Indonesian edition is at /id, and the Word edition is in /docs.",
  "Edisi bahasa Indonesia lengkap ada di /id, dan edisi Word ada di /docs.");
await beat(5500);

await context.close();
await browser.close();
console.log("recorded");
