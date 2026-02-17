#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const REPO_ROOT = path.resolve(process.cwd(), '..');
const SOURCE_DIR = path.join(REPO_ROOT, 'specs');
const DEST_DIR = path.join(process.cwd(), 'src', 'content', 'specs');

async function rimraf(dir) {
  await fs.rm(dir, { recursive: true, force: true });
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function* walkMarkdownFiles(baseDir, currentDir = baseDir) {
  const entries = await fs.readdir(currentDir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(currentDir, entry.name);
    if (entry.isDirectory()) {
      yield* walkMarkdownFiles(baseDir, fullPath);
      continue;
    }
    if (!entry.isFile()) continue;
    if (entry.name.toLowerCase().endsWith('.md')) {
      const relativePath = path.relative(baseDir, fullPath);
      yield { fullPath, relativePath };
    }
  }
}

async function main() {
  // Clean destination to avoid stale pages
  await rimraf(DEST_DIR);
  await ensureDir(DEST_DIR);

  let count = 0;
  for await (const file of walkMarkdownFiles(SOURCE_DIR)) {
    const destPath = path.join(DEST_DIR, file.relativePath);
    await ensureDir(path.dirname(destPath));
    await fs.copyFile(file.fullPath, destPath);
    count += 1;
  }

  process.stdout.write(`Synced ${count} markdown file(s) from specs/ to web/src/content/specs/\n`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
