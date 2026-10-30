import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { compile } from 'json-schema-to-typescript'
import { rustContract } from './rust.ts'

type Pin = { repository: string; ref: string }

const ROOT = join(import.meta.dirname, '..')
const PACKAGE = join(ROOT, 'packages', 'contract')
const DIRECTIONS = { sent: 'Sent', accepted: 'Accepted' } as const

const pin = JSON.parse(readFileSync(join(ROOT, 'contract.json'), 'utf8')) as Pin
if (!/^[0-9a-f]{40}$/.test(pin.ref)) {
  console.error(`contract.json ref must be a full commit sha, got ${pin.ref}`)
  process.exit(2)
}

const check = process.argv.includes('--check')
const stale: string[] = []

function current(path: string): string | null {
  try {
    return readFileSync(path, 'utf8')
  } catch {
    return null
  }
}

function emit(path: string, text: string): void {
  if (current(path) === text) return
  if (check) {
    stale.push(path.slice(ROOT.length + 1))
    return
  }
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, text)
}

for (const [direction, name] of Object.entries(DIRECTIONS)) {
  const url = `https://raw.githubusercontent.com/${pin.repository}/${pin.ref}/contract/${direction}.schema.json`
  const response = await fetch(url)
  if (!response.ok) {
    console.error(`${url}: HTTP ${response.status}`)
    process.exit(1)
  }
  const schema = await response.text()
  emit(join(PACKAGE, 'schema', `${direction}.schema.json`), schema)
  const types = await compile(JSON.parse(schema), name, {
    unreachableDefinitions: true,
    additionalProperties: false,
    bannerComment: `// Generated from ${pin.repository}@${pin.ref} contract/${direction}.schema.json by npm run contract. Do not edit.`,
  })
  emit(join(PACKAGE, 'src', `${direction}.ts`), types)
  if (direction === 'accepted') {
    const banner = `Generated from ${pin.repository}@${pin.ref} contract/accepted.schema.json by npm run contract. Do not edit.`
    emit(join(ROOT, 'rust', 'rivethub-plugin', 'src', 'contract.rs'), rustContract(JSON.parse(schema), banner))
  }
}

if (stale.length > 0) {
  console.error(`the contract is stale (${stale.join(', ')}): run npm run contract and commit the result`)
  process.exit(1)
}
