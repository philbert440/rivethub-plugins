import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

export type Finding = { rule: string; match: string }
export type Denylists = { privacy: Set<string>; secrets: Set<string> }

const UUID = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi
const UUID_FULL = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const EMAIL = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g
const HOME = /\/home\/([A-Za-z0-9._-]+)/g
const IPV4 = /\b(\d{1,3}(?:\.\d{1,3}){1,3})\b/g
const IPV4_FULL = /\b(?:\d{1,3}\.){3}\d{1,3}(?:\/\d{1,2})?\b/g
const IPV6_INTERNAL = /\b(?:f[cd][0-9a-f]{2}|fe80)(?::[0-9a-f]{0,4}){2,}\b/gi
const WG_KEY = /\b[A-Za-z0-9+/]{43}=/g
const LAN_HOST = /\b[a-z0-9][a-z0-9-]*\.lan\b/gi
const WORD = /\b[A-Za-z][A-Za-z0-9]*\b/g
const NONSPACE = /\S+/g
const HYPHEN = /\b[A-Za-z][A-Za-z0-9]*(?:-[A-Za-z0-9]+)+\b/g
const TITLE = /^[A-Z][a-z]+$/
const LINUX_AFTER = /^\s+Linux\b/
const AGENT_WORD = /(^|-)(rivet|grokbot)(-|$)/i
const HOST_LIKE = /^[A-Za-z]{2,}\d+$/
const TOKENS: ReadonlyArray<[RegExp, string]> = [
  [/\bsk-[A-Za-z0-9_-]{20,}/, 'API key shape (sk-…)'],
  [/\bgh[pousr]_[A-Za-z0-9]{30,}/, 'GitHub token'],
  [/\bxox[abprs]-[A-Za-z0-9-]{10,}/, 'Slack token'],
  [/\bAKIA[0-9A-Z]{16}\b/, 'AWS access key'],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'private key block'],
  [/\b[0-9]{17,19}:[A-Za-z0-9_-]{35}\b/, 'Telegram bot token'],
  [/\bMT[A-Za-z0-9]{22,}\.[A-Za-z0-9_-]{6}\.[A-Za-z0-9_-]{27,}/, 'Discord bot token'],
]
const ALLOWED_HOME_USERS = new Set(['ubuntu', 'runner', 'rivet', 'rivetos', 'rivethub', 'user', 'example'])
const BINARY_EXTENSIONS = new Set([
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'ico',
  'svg',
  'pdf',
  'zip',
  'gz',
  'woff',
  'woff2',
  'ttf',
  'otf',
  'mp3',
  'wav',
  'ogg',
  'mp4',
  'webm',
  'so',
  'a',
  'bin',
  'wasm',
])
const UNSCANNED = new Set([
  'scripts/data/privacy-denylist.json',
  'scripts/data/secret-denylist.json',
  'package-lock.json',
])

export const sha256 = (value: string): string => createHash('sha256').update(value).digest('hex')

export function loadDenylists(dir: string): Denylists {
  const load = (name: string): Set<string> => {
    const file = JSON.parse(readFileSync(join(dir, name), 'utf8')) as { sha256: string[] }
    return new Set(file.sha256.filter((hash) => /^[0-9a-f]{64}$/i.test(hash)).map((hash) => hash.toLowerCase()))
  }
  return { privacy: load('privacy-denylist.json'), secrets: load('secret-denylist.json') }
}

const isIdentChar = (char: string | undefined): boolean => char !== undefined && /[A-Za-z0-9-]/.test(char)
const isWgTail = (char: string | undefined): boolean => char !== undefined && /[A-Za-z0-9+/=]/.test(char)
const isAlphanumeric = (char: string | undefined): boolean => char !== undefined && /[\p{L}\p{N}]/u.test(char)

function wordStart(line: string, index: number): number {
  let start = index
  while (start > 0 && isIdentChar(line[start - 1])) start -= 1
  return start
}

function privateIp(token: string): 'private' | 'public' | null {
  const head = token.split('/')[0] ?? ''
  const parts = head.split('.').map(Number)
  if (parts.some((part) => !Number.isInteger(part) || part > 255)) return null
  const [a, b] = parts
  if (a === undefined || b === undefined) return null
  if (a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127)) {
    return 'private'
  }
  const reserved =
    a === 0 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    a >= 224 ||
    (a === 192 && b === 0) ||
    (a === 198 && [18, 19, 51].includes(b)) ||
    (a === 203 && b === 0)
  return reserved ? null : 'public'
}

function trailingCommaBefore(line: string, index: number): boolean {
  let at = index - 2
  while (at >= 0 && (line[at] === ' ' || line[at] === '\t')) at -= 1
  return at >= 0 && line[at] === ','
}

function inTagContext(line: string, index: number, token: string): boolean {
  const end = index + token.length
  const start = wordStart(line, index)
  if (line.startsWith('--', start)) return false
  const hyphenBefore = index >= 2 && line[index - 1] === '-' && isAlphanumeric(line[index - 2])
  const hyphenAfter = end + 1 < line.length && line[end] === '-' && isAlphanumeric(line[end + 1])
  if (hyphenBefore || hyphenAfter) {
    let stop = end
    while (stop < line.length && isIdentChar(line[stop])) stop += 1
    return AGENT_WORD.test(line.slice(start, stop))
  }
  const quote = index > 0 ? line[index - 1] : undefined
  const quoted = (quote === "'" || quote === '"' || quote === '`') && line[end] === quote
  if (!quoted) return false
  if (token.toLowerCase() === 'arch') return false
  const before = index >= 2 ? line[index - 2] : undefined
  if (before !== undefined && (isAlphanumeric(before) || '_[(,'.includes(before))) return false
  return !trailingCommaBefore(line, index)
}

function checkPersona(line: string, index: number, token: string): boolean {
  if (token.length > 4) return true
  if (TITLE.test(token)) return !LINUX_AFTER.test(line.slice(index + token.length))
  return inTagContext(line, index, token)
}

const isUnder = (file: string, dir: string): boolean =>
  file === dir || file.startsWith(`${dir}/`) || file.includes(`/${dir}/`)

function isReadme(file: string): boolean {
  const name = file.split('/').pop() ?? ''
  const [stem, ext] = name.split(/\.(.*)/s)
  if (ext === undefined) return name.toLowerCase() === 'readme'
  return stem?.toLowerCase() === 'readme' && /^[A-Za-z0-9]+$/.test(ext)
}

const isMarkerFile = (file: string): boolean =>
  isUnder(file, 'docs') || isUnder(file, 'fixtures') || /\.mdx?$/i.test(file) || isReadme(file)

const isOwnerIdentityFile = (file: string): boolean =>
  file === 'LICENSE' ||
  file.endsWith('/LICENSE') ||
  file === 'NOTICE' ||
  file.endsWith('/NOTICE') ||
  file === '.github/CODEOWNERS'

const isFixtureFile = (file: string): boolean => ['fixtures', 'testdata', 'golden'].some((dir) => isUnder(file, dir))

export function isScanned(file: string): boolean {
  const extension = file.split('.').pop()?.toLowerCase() ?? ''
  return !UNSCANNED.has(file) && !(file.includes('.') && BINARY_EXTENSIONS.has(extension))
}

function denylistedNames(line: string, ownerFile: boolean, deny: Set<string>, out: Finding[]): void {
  for (const found of line.matchAll(UUID)) {
    if (deny.has(sha256(found[0].toLowerCase()))) out.push({ rule: 'denylist-uuid', match: found[0] })
  }
  for (const found of line.matchAll(EMAIL)) {
    if (!ownerFile && deny.has(sha256(found[0].toLowerCase()))) out.push({ rule: 'denylist-email', match: found[0] })
  }
  for (const found of line.matchAll(HYPHEN)) {
    const token = found[0]
    if (UUID_FULL.test(token) || line.startsWith('--', wordStart(line, found.index))) continue
    const lower = token.toLowerCase()
    const parts = lower.split('-')
    const agentTag = parts.includes('rivet') || parts.includes('grokbot')
    const hit = deny.has(sha256(lower)) || (agentTag && parts.some((part) => part !== '' && deny.has(sha256(part))))
    if (hit) out.push({ rule: 'denylist-tag', match: token })
  }
  for (const found of line.matchAll(WORD)) {
    const token = found[0]
    const hashed = deny.has(sha256(token.toLowerCase()))
    if (checkPersona(line, found.index, token)) {
      if (!ownerFile && hashed) out.push({ rule: 'denylist-persona', match: token })
    } else if (HOST_LIKE.test(token) && hashed) {
      out.push({ rule: 'denylist-host', match: token })
    }
  }
}

function denylistedAddresses(line: string, pragma: boolean, deny: Set<string>, out: Finding[]): void {
  for (const found of line.matchAll(IPV4)) {
    const token = found[1] ?? ''
    const parts = token.split('.')
    const candidates = [token, parts.slice(0, 3).join('.'), parts.slice(0, 2).join('.')]
    if (candidates.some((candidate) => deny.has(sha256(candidate))))
      out.push({ rule: 'denylist-ip-prefix', match: token })
  }
  for (const found of line.matchAll(IPV4_FULL)) {
    if (!pragma && privateIp(found[0]) === 'private') out.push({ rule: 'private-ip', match: found[0] })
  }
}

function homePaths(line: string, marker: boolean, deny: Set<string>, out: Finding[]): void {
  for (const found of line.matchAll(HOME)) {
    const user = found[1] ?? ''
    if (ALLOWED_HOME_USERS.has(user)) continue
    if (marker || deny.has(sha256(user.toLowerCase()))) out.push({ rule: 'home-path', match: found[0] })
  }
}

function unmaskedSecrets(line: string, fixture: boolean, out: Finding[]): void {
  for (const found of line.matchAll(IPV6_INTERNAL)) out.push({ rule: 'ipv6-internal', match: found[0] })
  for (const found of line.matchAll(WG_KEY)) {
    if (!isWgTail(line[found.index + found[0].length])) out.push({ rule: 'wg-key', match: `${found[0].slice(0, 12)}…` })
  }
  for (const found of line.matchAll(LAN_HOST)) {
    if (line[found.index + found[0].length] !== '.') out.push({ rule: 'lan-host', match: found[0] })
  }
  if (fixture) return
  for (const [pattern, label] of TOKENS) {
    if (pattern.test(line)) out.push({ rule: 'secret', match: label })
  }
}

export function scanLine(line: string, file: string, denylists: Denylists): Finding[] {
  const out: Finding[] = []
  const pragma = line.includes('secret-scan-allow') || line.includes('gate-allow')
  denylistedNames(line, isOwnerIdentityFile(file), denylists.privacy, out)
  denylistedAddresses(line, pragma, denylists.privacy, out)
  homePaths(line, isMarkerFile(file), denylists.privacy, out)
  if (!pragma) unmaskedSecrets(line, isFixtureFile(file), out)
  for (const found of line.matchAll(NONSPACE)) {
    const token = found[0]
    if (
      [...token].length >= 8 &&
      (denylists.secrets.has(sha256(token)) || denylists.secrets.has(sha256(token.toLowerCase())))
    ) {
      out.push({ rule: 'denylist-secret', match: `${[...token].slice(0, 6).join('')}…` })
    }
  }
  return out
}

export function scanText(text: string, file: string, denylists: Denylists): string[] {
  return text
    .split('\n')
    .flatMap((line, index) =>
      scanLine(line, file, denylists).map(
        (finding) => `PRIVACY ${file}:${index + 1}: ${finding.rule}: ${finding.match}`,
      ),
    )
}

function main(): void {
  const denylists = loadDenylists(join(import.meta.dirname, 'data'))
  const mode = process.argv[2]
  let findings: string[]
  if (mode === '--text') {
    findings = scanText(readFileSync(0, 'utf8'), 'stdin', denylists)
  } else if (mode === '--tracked') {
    const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean)
    findings = files.filter(isScanned).flatMap((file) => scanText(readFileSync(file, 'utf8'), file, denylists))
  } else {
    console.error('usage: node scripts/privacy.ts --tracked | --text < input')
    process.exit(2)
  }
  for (const finding of findings) console.error(process.env.CI ? finding.replace(/: [^:]+$/, ': [redacted]') : finding)
  if (findings.length > 0) process.exit(1)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main()
