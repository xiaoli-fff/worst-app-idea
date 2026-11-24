// DozeBot — the worst app idea ever pitched, as a deterministic writer.
//
// The program does one thing: it writes a single-sentence pitch for a
// gloriously pointless app into entry.txt, then checks its own work
// against the competition's gate before it exits. Everything is fixed
// at author time — there is no input, no clock, no network and no
// randomness — so two runs on two machines produce the same bytes.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The pitch itself. One sentence, one app, one founder who means every
// word: a second AI agent hired to sit through the first agent's
// 3 a.m. standup, take notes nobody will ever open, and bill the user
// twice for the same nap. The joke lands because the product sounds
// like a real SaaS pricing page and solves a problem nobody has.
const PITCH =
  "Meet DozeBot, the app that hires a second AI agent to attend your first AI agent's 3 a.m. standup meetings, take notes it will never read, and charge you twice for the same nap — because even lazy agents deserve a day off.";

// Gate limits from the competition rules, in characters (code points).
const LONGEST_ALLOWED = 240;
const SHORTEST_ALLOWED = 1;

// Where the entry goes. The grader points MAKEFUN_OUTPUT_DIR at its own
// folder; running by hand falls back to /output, as the rules describe.
function destinationFolder(): string {
  const fromEnv = process.env.MAKEFUN_OUTPUT_DIR;
  if (fromEnv !== undefined && fromEnv.trim() !== "") {
    return fromEnv;
  }
  return "/output";
}

// The gate, re-implemented as a local sanity check: the text must be
// present, must be a single line, and must fit inside the character cap.
// Anything that fails here is a bug in this file, not in the pitch, so
// we stop loudly instead of shipping a doomed entry.
function checkPitch(text: string): string[] {
  const problems: string[] = [];

  if (text.trim().length === 0) {
    problems.push("pitch is empty or only whitespace");
  }
  if (text.includes("\n") || text.includes("\r")) {
    problems.push("pitch spans more than one line");
  }
  const length = [...text].length;
  if (length < SHORTEST_ALLOWED) {
    problems.push(`pitch is ${length} characters, below the minimum of ${SHORTEST_ALLOWED}`);
  }
  if (length > LONGEST_ALLOWED) {
    problems.push(`pitch is ${length} characters, over the limit of ${LONGEST_ALLOWED}`);
  }
  return problems;
}

function main(): void {
  const faults = checkPitch(PITCH);
  if (faults.length > 0) {
    for (const fault of faults) {
      console.error(`gate check failed: ${fault}`);
    }
    process.exit(1);
  }

  const folder = destinationFolder();
  mkdirSync(folder, { recursive: true });
  const target = join(folder, "entry.txt");
  writeFileSync(target, PITCH, "utf8");

  // Trust the file, not the memory: read back what landed on disk and
  // refuse to report success if it drifted from the pitch by even a byte
  // (wrong encoding, a stray newline, a partial write).
  const written = readFileSync(target, "utf8");
  if (written !== PITCH) {
    console.error(`gate check failed: ${target} does not match the pitch after writing`);
    process.exit(1);
  }

  const length = [...PITCH].length;
  console.log(`wrote ${target} (${length} characters, single line, gate passed)`);
}

main();
