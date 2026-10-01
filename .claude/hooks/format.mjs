import { execFileSync } from 'node:child_process';

let input = '';
for await (const chunk of process.stdin) input += chunk;
const file = JSON.parse(input || '{}').tool_input?.file_path;
if (typeof file === 'string' && /\.(ts|tsx|js|mjs|json|css|md)$/.test(file)) {
  try {
    execFileSync('npx', ['prettier', '--write', file], { stdio: 'ignore' });
  } catch {
    process.exitCode = 0;
  }
}
