/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS helper run with plain node */
const { existsSync } = require('node:fs');
try {
  const path = require('playwright').chromium.executablePath();
  if (!existsSync(path)) process.exit(2);
  process.stdout.write(path);
} catch {
  process.exit(3);
}
