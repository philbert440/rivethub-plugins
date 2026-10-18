import assert from 'node:assert/strict'
import { test } from 'node:test'
import { type Denylists, isScanned, scanLine, sha256 } from '../scripts/privacy.ts'

const denylists: Denylists = {
  privacy: new Set(['zorblax', 'canary-host', 'quuxhost7', 'qa', '203.0.113', 'ada@example.org'].map(sha256)),
  secrets: new Set([sha256('s3cr3t-relay-key')]),
}

const ip = (...octets: number[]): string => octets.join('.')
const lan = (name: string): string => [name, 'lan'].join('.')

const rules = (line: string, file = 'src/app.ts'): string[] =>
  scanLine(line, file, denylists).map((finding) => finding.rule)

test('private addresses and lan hosts are blocked', () => {
  assert.deepEqual(rules(`connect to ${ip(192, 168, 4, 20)}`), ['private-ip'])
  assert.deepEqual(rules(`peer ${ip(100, 64, 1, 9)}`), ['private-ip'])
  assert.deepEqual(rules('docs show 192.0.2.10'), [])
  assert.deepEqual(rules(`ssh ${lan('nas')}`), ['lan-host'])
  assert.deepEqual(rules(`ok ${ip(192, 168, 1, 1)} # secret-scan-allow`), [])
})

test('denylisted names, tags, hosts and addresses are blocked by hash', () => {
  assert.deepEqual(rules('ask Zorblax about it'), ['denylist-persona'])
  assert.deepEqual(rules('tag canary-host here'), ['denylist-tag'])
  assert.deepEqual(rules('ping quuxhost7'), ['denylist-persona'])
  assert.deepEqual(rules('relay 203.0.113.7'), ['denylist-ip-prefix'])
  assert.deepEqual(rules('mail ada@example.org'), ['denylist-email'])
  assert.deepEqual(rules('mail ada@example.org', 'LICENSE'), [])
})

test('short persona tokens only count in tag context', () => {
  assert.deepEqual(rules('qa'), [])
  assert.deepEqual(rules('agent "qa"'), ['denylist-persona'])
  assert.deepEqual(rules('rivet-qa'), ['denylist-tag', 'denylist-persona'])
})

test('home paths are blocked in docs or when the user is denylisted', () => {
  assert.deepEqual(rules('/home/runner/work'), [])
  assert.deepEqual(rules('/home/zorblax/x'), ['denylist-persona', 'home-path'])
  assert.deepEqual(rules('/home/someone/x', 'docs/setup.md'), ['home-path'])
  assert.deepEqual(rules('/home/someone/x'), [])
})

test('token shapes and denylisted secrets are blocked', () => {
  assert.deepEqual(rules(`key ghp_${'a'.repeat(36)}`), ['secret'])
  assert.deepEqual(rules(['-----BEGIN OPENSSH', 'PRIVATE KEY-----'].join(' ')), ['secret'])
  assert.deepEqual(rules(`key ghp_${'a'.repeat(36)}`, 'tests/fixtures/x.json'), [])
  assert.deepEqual(rules('key s3cr3t-relay-key'), ['denylist-secret'])
})

test('denylist data, lockfiles and binaries are not scanned', () => {
  assert.equal(isScanned('scripts/data/privacy-denylist.json'), false)
  assert.equal(isScanned('package-lock.json'), false)
  assert.equal(isScanned('assets/logo.png'), false)
  assert.equal(isScanned('src/app.ts'), true)
})
