import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2];
const all = [];
for (const name of readdirSync(dir)
  .filter((f) => f.endsWith('.json'))
  .sort()) {
  const path = join(dir, name);
  const routeFile = `apps/api/src/routes/${name.replace(/\.json$/, '')}`;
  try {
    const text = String(JSON.parse(readFileSync(path, 'utf8')).result ?? '').trim();
    const unfenced = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    const parsed = JSON.parse(unfenced);
    if (!Array.isArray(parsed)) throw new Error('not an array');
    all.push(...parsed);
  } catch {
    console.error(
      `Could not read the endpoints Claude returned for ${routeFile}. Run the script again; if it keeps failing, open ${path} to see what came back.`,
    );
    process.exit(1);
  }
}
const cmp = (x, y) => (x < y ? -1 : x > y ? 1 : 0);
all.sort((a, b) => cmp(String(a.path), String(b.path)) || cmp(String(a.method), String(b.method)));
process.stdout.write(JSON.stringify(all, null, 2) + '\n');
