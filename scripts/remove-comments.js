const fs = require('fs')
const path = require('path')
const babel = require('@babel/core')

const root = process.cwd()
const jsExts = new Set(['.js', '.jsx', '.ts', '.tsx'])
const cssExts = new Set(['.css', '.scss', '.sass'])
const ignorePaths = ['node_modules', '.git', 'coverage', 'dist', 'build', '.githooks']

function isIgnored(p) {
  return ignorePaths.some(part => p.includes(path.sep + part + path.sep) || p.endsWith(path.sep + part))
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (isIgnored(full)) continue
    if (entry.isDirectory()) walk(full)
    else processFile(full)
  }
}

function processFile(filePath) {
  const ext = path.extname(filePath)
  if (jsExts.has(ext)) stripJsComments(filePath)
  else if (cssExts.has(ext)) stripCssComments(filePath)
}

function stripJsComments(filePath) {
  try {
    const src = fs.readFileSync(filePath, 'utf8')
    const out = babel.transformSync(src, {
      filename: filePath,
      presets: [['@babel/preset-env', { targets: { node: 'current' } }], '@babel/preset-react'],
      comments: false,
      generatorOpts: { comments: false },
      configFile: false,
      babelrc: false,
    })
    if (out && out.code && out.code !== src) {
      fs.writeFileSync(filePath, out.code, 'utf8')
      console.log('Stripped comments:', filePath)
    }
  } catch (err) {
    console.error('Error processing', filePath, err.message)
  }
}

function stripCssComments(filePath) {
  try {
    const src = fs.readFileSync(filePath, 'utf8')
    const out = src.replace(/\/\*[\s\S]*?\*\//g, '')
    if (out !== src) {
      fs.writeFileSync(filePath, out, 'utf8')
      console.log('Stripped CSS comments:', filePath)
    }
  } catch (err) {
    console.error('Error processing', filePath, err.message)
  }
}

walk(root)
console.log('remove-comments completed')
process.exit(0)
