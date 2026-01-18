import fs from 'fs';
import path from 'path';


const IGNORED_DIRS = ['node_modules', '.next', 'coverage', 'dist', 'public'];
const ALLOWED_EXTS = ['.js', '.jsx', '.ts', '.tsx', '.scss', '.css', '.json', '.md', '.html'];

function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (!IGNORED_DIRS.includes(f)) walk(full, fileList);
    } else {
      const ext = path.extname(full).toLowerCase();
      if (ALLOWED_EXTS.includes(ext)) fileList.push(full);
    }
  }
  return fileList;
}

function checkFile(filePath) {
  const src = fs.readFileSync(filePath, 'utf8');
    const slash = String.fromCharCode(47);
    const star = String.fromCharCode(42);
    const blockRegex = new RegExp(slash + '\\' + star + '[\\s\\S]*?' + '\\' + star + slash, 'g');
    const blockMatches = src.match(blockRegex);
  const results = [];
  if (blockMatches && blockMatches.length) {
    results.push({ type: 'block', count: blockMatches.length });
  }
  const lines = src.split(/\r?\n/);
  const lineMatches = [];
  lines.forEach((ln, idx) => {
    const slash = String.fromCharCode(47);
    const idxOf = ln.indexOf(slash + slash);
    if (idxOf !== -1) {
      const lower = ln.toLowerCase();
      if (lower.includes('http' + ':' + '//') || lower.includes('https' + ':' + '//') || lower.includes('data:')) return;
      lineMatches.push({ line: idx + 1, text: ln.trim() });
    }
  });
  if (lineMatches.length) results.push({ type: 'line', matches: lineMatches });

  return results;
}


import { createRequire } from 'module';
const require = createRequire(import.meta.url);
let ignoredFiles = [];
try {
  const eslintConfig = require('../eslint.config.js').default;
  if (Array.isArray(eslintConfig) && eslintConfig[0]?.ignores) {
    ignoredFiles = eslintConfig[0].ignores.map(pattern => pattern.replace('/**', ''));
  }
} catch (e) {}

function isIgnored(filePath) {
  return ignoredFiles.some(ignore => filePath.endsWith(ignore));
}

function main() {
  const root = process.cwd();
  const files = walk(root);
  let hasErrors = false;
  for (const f of files) {
    if (isIgnored(f)) continue;
    const res = checkFile(f);
    if (res.length) {
      hasErrors = true;
      console.error(`Comments found in ${f}:`);
      res.forEach(r => {
        if (r.type === 'block') {
          console.error(`  ${r.count} block comment(s)`);
        } else if (r.type === 'line') {
          r.matches.forEach(m => console.error(`  line ${m.line}: ${m.text}`));
        }
      });
    }
  }
  if (hasErrors) process.exit(2);
}

main();
