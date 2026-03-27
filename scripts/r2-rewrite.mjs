#!/usr/bin/env node
/**
 * Rewrite image references in markdown content and source code
 * to point to R2 public URL instead of local /public paths.
 *
 * Reads R2_PUBLIC_URL from secrets/.cloudflare.env
 * Usage: node scripts/r2-rewrite.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(__dirname, '..');
const envFile = path.join(projectDir, 'secrets/.cloudflare.env');

// Parse env file
function loadEnv(filePath) {
  const vars = {};
  const content = fs.readFileSync(filePath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    vars[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1);
  }
  return vars;
}

const env = loadEnv(envFile);
const R2_URL = env.R2_PUBLIC_URL;

if (!R2_URL) {
  console.error('Error: R2_PUBLIC_URL not set in secrets/.cloudflare.env');
  console.error('Set it to your R2 public URL, e.g.:');
  console.error('  R2_PUBLIC_URL=https://assets.sagarsarkale.com');
  console.error('  R2_PUBLIC_URL=https://pub-xxx.r2.dev');
  process.exit(1);
}

// Image path prefixes that were uploaded to R2
const IMAGE_DIRS = [
  'attn', 'blt1', 'blt2', 'kvcache', 'llava', 'lora',
  'lstm', 'mcp1', 'mcp2', 'mcp3', 'personal', 'pos-enc',
  'rnns', 'vectordb',
];

// Patterns to match: /dirname/filename.ext or dirname/filename.ext
const pattern = new RegExp(
  `(["'(])\\/?(?:${IMAGE_DIRS.join('|')})\\/[^"')\\s]+\\.(?:png|jpg|jpeg|gif|webp|svg)`,
  'g'
);

function rewriteFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  let count = 0;

  const rewritten = content.replace(pattern, (match) => {
    const quote = match[0]; // preserve the opening quote/paren
    const imgPath = match.slice(1).replace(/^\//, ''); // strip leading /
    count++;
    return `${quote}${R2_URL}/${imgPath}`;
  });

  if (count > 0) {
    fs.writeFileSync(filePath, rewritten);
    console.log(`  ${path.relative(projectDir, filePath)} — ${count} references`);
  }
  return count;
}

function walkDir(dir, extensions) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules' && entry.name !== '.next') {
      results.push(...walkDir(fullPath, extensions));
    } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

console.log(`Rewriting image references to: ${R2_URL}`);
console.log('');

let totalRefs = 0;

// Rewrite markdown content
const mdFiles = walkDir(path.join(projectDir, 'content'), ['.md', '.mdx']);
for (const f of mdFiles) totalRefs += rewriteFile(f);

// Rewrite source files (shortcode converter, components, pages)
const srcFiles = walkDir(path.join(projectDir, 'src'), ['.tsx', '.ts', '.jsx', '.js']);
for (const f of srcFiles) totalRefs += rewriteFile(f);

console.log('');
console.log(`Done. Rewrote ${totalRefs} image references.`);
console.log('');
console.log('You can now delete the uploaded image directories from public/:');
for (const dir of IMAGE_DIRS) {
  const dirPath = path.join(projectDir, 'public', dir);
  if (fs.existsSync(dirPath)) {
    console.log(`  rm -rf public/${dir}/`);
  }
}
