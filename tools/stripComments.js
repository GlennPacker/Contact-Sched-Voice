const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const exts = ['.js', '.jsx', '.sql']
const ignored = ['node_modules', 'coverage', '.git']

function walk(dir) {
  let results = []
  const list = fs.readdirSync(dir)
  list.forEach((file) => {
    const full = path.join(dir, file)
    const stat = fs.statSync(full)
    if (stat && stat.isDirectory()) {
      if (!ignored.includes(file)) results = results.concat(walk(full))
    } else {
      if (exts.includes(path.extname(full))) results.push(full)
    }
  })
  return results
}

function strip(content) {
  // remove block comments /* ... */
  let out = content.replace(/\/\*[\s\S]*?\*\//g, '')
  // remove full-line // comments (leading whitespace then //)
  out = out.replace(/^[ \t]*\/\/.*$/gm, '')
  return out
}

const files = walk(root)
let changed = 0
files.forEach((f) => {
  const orig = fs.readFileSync(f, 'utf8')
  const stripped = strip(orig)
  if (stripped !== orig) {
    fs.writeFileSync(f, stripped, 'utf8')
    changed++
    console.log('Stripped comments:', f)
  }
})
console.log('Done. Files changed:', changed)
