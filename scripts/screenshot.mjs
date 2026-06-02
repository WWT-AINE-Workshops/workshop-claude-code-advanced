import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const path = args.find((a) => a.startsWith('/')) ?? '/';
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? Number(args[i + 1]) : fallback;
};
const width = flag('width', 1280);
const height = flag('height', 900);
const base = process.env.COPPERLINE_URL ?? 'http://localhost:5173';
const slug = path === '/' ? 'home' : path.replace(/^\//, '').replace(/[^a-z0-9]+/gi, '-');

mkdirSync('.screenshots', { recursive: true });
const out = `.screenshots/${slug}-${width}.png`;
let browser;
try {
  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(base + path, { waitUntil: 'networkidle' });
  await page.screenshot({ path: out, fullPage: true });
  console.log(out);
} catch (err) {
  const hint = /Executable doesn't exist|browser.*not installed/i.test(err.message)
    ? 'Run: npx playwright install chromium'
    : 'Is "npm run dev" running?';
  console.error(`Could not capture ${base}${path}. ${hint}\n${err.message}`);
  process.exitCode = 1;
} finally {
  await browser?.close();
}
