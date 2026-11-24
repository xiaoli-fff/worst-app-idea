// The Worst App Idea Ever Pitched (Node 22, standard library only): writes
// one line — a pitch for the worst, most useless app imaginable — to
// /output/entry.txt.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// Deterministic: no network, no randomness, no time or environment input.
// Both runs write identical bytes.

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const LINE =
  'Meet DozeBot, the app that hires a second AI agent to attend your first AI agent\u2019s 3 a.m. standup meetings, take notes it will never read, and charge you twice for the same nap \u2014 because even lazy agents deserve a day off.';

// Gate (competition.yaml): /output/entry.txt must be UTF-8 text of 1-240
// characters, not only whitespace, and a single line. validateEntry checks
// each of those items separately so a failure names the gate item that was
// missed instead of a bare character count.
function validateEntry(line: string, maxChars: number): string {
  if (line.trim().length === 0) {
    throw new Error('gate failed: entry must not be only whitespace');
  }
  if (line.includes('\n') || line.includes('\r')) {
    throw new Error('gate failed: entry must be a single line with no line break');
  }
  const chars = [...line].length;
  if (chars < 1 || chars > maxChars) {
    throw new Error(`gate failed: entry must be 1-${maxChars} characters, got ${chars}`);
  }
  return line + '\n';
}

const ENTRY = validateEntry(LINE, 240);

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'entry.txt'), ENTRY, 'utf8');
