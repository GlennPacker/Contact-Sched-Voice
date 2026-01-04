import { spawn } from 'child_process'
import path from 'path'

const eslintBin = process.platform === 'win32'
  ? path.resolve(path.join('node_modules', '.bin', 'eslint.cmd'))
  : path.resolve(path.join('node_modules', '.bin', 'eslint'))

const args = process.argv.length > 2 ? process.argv.slice(2) : ['.', '--ext', '.js,.jsx']

let proc
if (process.platform === 'win32') {
  proc = spawn('cmd.exe', ['/c', eslintBin, ...args], { stdio: 'inherit' })
} else {
  proc = spawn(eslintBin, args, { stdio: 'inherit' })
}

proc.on('close', (code) => process.exit(code))
