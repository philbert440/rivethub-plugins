import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

export type Commit = { hash: string; name: string; email: string; body: string }

const BLOCKED_TRAILERS = /^(Co-authored-by|Claude-Session|Signed-off-by):/im
const BLOCKED_TEXT = /(claude|anthropic|cursor|copilot|chatgpt|openai|generated with)/i
const AI_TEXT = /(generated with|session_|co-authored)/i
const BLOCKED_IDENTITY =
  /(claude|anthropic|cursor|copilot|chatgpt|openai|dependabot|renovate|github-actions|\[bot\]|^root@)/i

export function commitFindings(commit: Commit): string[] {
  const findings: string[] = []
  if (BLOCKED_TRAILERS.test(commit.body)) {
    findings.push('AUTHORSHIP commit message carries a Co-authored-by / Claude-Session / Signed-off-by trailer')
  }
  if (BLOCKED_TEXT.test(commit.body) && AI_TEXT.test(commit.body)) {
    findings.push('AUTHORSHIP commit message carries AI attribution text')
  }
  if (BLOCKED_IDENTITY.test(commit.name) || BLOCKED_IDENTITY.test(commit.email)) {
    findings.push(`AUTHORSHIP ${commit.name} <${commit.email}> is a tool or bot identity, not a person`)
  }
  return findings.map((finding) => `${finding} (${commit.hash.slice(0, 8)})`)
}

export function parseLog(log: string): Commit[] {
  return log
    .split('\x1e')
    .map((record) => record.replace(/^\n+|\n+$/g, ''))
    .filter(Boolean)
    .flatMap((record) => {
      const [hash, name, email, body] = record.split('\x1f')
      return hash === undefined || name === undefined || email === undefined || body === undefined
        ? []
        : [{ hash, name, email, body }]
    })
}

function main(): void {
  const range = process.argv[2]
  if (range === undefined) {
    console.error('usage: node scripts/commits.ts <base>..<head>')
    process.exit(2)
  }
  const log = execFileSync('git', ['log', '--format=%H%x1f%an%x1f%ae%x1f%B%x1e', range], { encoding: 'utf8' })
  const findings = parseLog(log).flatMap(commitFindings)
  for (const finding of findings) console.error(finding)
  if (findings.length > 0) process.exit(1)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main()
