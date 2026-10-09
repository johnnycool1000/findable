// Minimal .env loader — no dependency needed.
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export function loadEnv() {
  const roots = [
    process.cwd(),
    resolve(dirname(fileURLToPath(import.meta.url)), '..'),
  ];
  for (const root of roots) {
    const file = resolve(root, '.env');
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
    break;
  }
  if (!process.env.TINYFISH_API_KEY) {
    console.error('Missing TINYFISH_API_KEY. Create a .env file with:\n  TINYFISH_API_KEY=sk-tinyfish-...\nGet a key at https://agent.tinyfish.ai/api-keys');
    process.exit(1);
  }
  return process.env.TINYFISH_API_KEY;
}
