import fs from 'fs'
import path from 'path'

const IGNORED_DIRS = ['node_modules', '.next', 'coverage', 'dist', 'public']

function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir)
  for (const f of files) {
    const full = path.join(dir, f)
    const stat = fs.statSync(full)
    if (stat.isDirectory()) {
      if (!IGNORED_DIRS.includes(f)) walk(full, fileList)
    } else if (full.endsWith('.scss')) {
      fileList.push(full)
    }
  }
  return fileList
}

function checkFile(filePath) {
  const src = fs.readFileSync(filePath, 'utf8')
  const results = []
  const blockRegex = /\/\*[\s\S]*?\*\//g
  const blockMatches = src.match(blockRegex)
  if (blockMatches && blockMatches.length) {
    results.push({ type: 'block', count: blockMatches.length })
  }
  const lines = src.split(/\r?\n/)
  const lineMatches = []
  lines.forEach((ln, idx) => {
    const idxOf = ln.indexOf('//')
    if (idxOf !== -1) {
      const lower = ln.toLowerCase()
      if (lower.includes('http://') || lower.includes('https://') || lower.includes('data:')) return
      lineMatches.push({ line: idx + 1, text: ln.trim() })
    }
  })
  if (lineMatches.length) results.push({ type: 'line', matches: lineMatches })
  return results
}

function main() {
  const root = process.cwd()
  const files = walk(root)
  let hasErrors = false
  for (const f of files) {
    const res = checkFile(f)
    if (res.length) {
      hasErrors = true
      console.error(`Comments found in ${f}:`)
      res.forEach(r => {
        if (r.type === 'block') {
          console.error(`  ${r.count} block comment(s)`)
        } else if (r.type === 'line') {
          r.matches.forEach(m => console.error(`  line ${m.line}: ${m.text}`))
        }
      })
    }
  }
  if (hasErrors) process.exit(2)
  console.log('No SCSS comments found.')
}

main()
