import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/** Guards the golden rule: @amt/sim stays pure. Scans src/ for forbidden constructs. */
const FORBIDDEN = [
  'Math.random',
  'Date.now',
  'new Date',
  'process.env',
  'fetch(',
  "from 'node:",
  'from "node:',
  '@amt/content',
];

function listTsFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? listTsFiles(full) : full.endsWith('.ts') ? [full] : [];
  });
}

describe('sim purity', () => {
  it('src/ contains no forbidden constructs', () => {
    const srcDir = join(__dirname, '..', 'src');
    const offenders: string[] = [];
    for (const file of listTsFiles(srcDir)) {
      const text = readFileSync(file, 'utf8');
      for (const token of FORBIDDEN) if (text.includes(token)) offenders.push(`${file}: ${token}`);
    }
    expect(offenders).toEqual([]);
  });
});
