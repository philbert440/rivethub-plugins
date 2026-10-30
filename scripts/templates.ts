import { cpSync, mkdirSync, rmSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const ROOT = join(import.meta.dirname, '..')
const TEMPLATES = ['javascript']
const SDK = ['index.ts', 'plugin.ts', 'rivethub.ts', 'serve.ts', 'types.ts']

const state = process.argv[2] ?? process.env.RIVETHUB_STATE_DIR ?? join(homedir(), '.rivethub')
const target = join(state, 'plugin-templates')

for (const name of TEMPLATES) {
  const into = join(target, name)
  rmSync(into, { recursive: true, force: true })
  cpSync(join(ROOT, 'templates', name), into, { recursive: true })
  mkdirSync(join(into, 'sdk'))
  for (const file of SDK) cpSync(join(ROOT, 'packages', 'plugin-sdk', 'src', file), join(into, 'sdk', file))
  console.log(`installed the ${name} template in ${into}`)
}
