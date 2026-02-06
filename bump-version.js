import fs from 'fs'
import path from 'path'

const envPath = path.resolve(process.cwd(), '.env')

if (!fs.existsSync(envPath)) {
  console.error('.env 文件不存在')
  process.exit(1)
}

const envContent = fs.readFileSync(envPath, 'utf-8')

const match = envContent.match(/^VITE_VERSION\s*=\s*(.+)$/m)

if (!match) {
  console.error('未找到 VITE_VERSION')
  process.exit(1)
}

const oldVersion = match[1].trim()
const parts = oldVersion.split('.').map(Number)

if (parts.length !== 3 || parts.some(isNaN)) {
  console.error('VITE_VERSION 格式必须是 x.y.z')
  process.exit(1)
}

parts[2] += 1 // patch +1
const newVersion = parts.join('.')

const newEnvContent = envContent.replace(/^VITE_VERSION\s*=\s*.+$/m, `VITE_VERSION = ${newVersion}`)

fs.writeFileSync(envPath, newEnvContent)

console.log(`✅ VITE_VERSION: ${oldVersion} → ${newVersion}`)
