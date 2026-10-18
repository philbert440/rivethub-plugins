import assert from 'node:assert/strict'
import { test } from 'node:test'
import { type Commit, commitFindings, parseLog } from '../scripts/commits.ts'

const commit = (overrides: Partial<Commit>): Commit => ({
  hash: '0123456789abcdef0123456789abcdef01234567',
  name: 'Ada Example',
  email: 'ada@example.org',
  body: 'feat(web): add the session list\n',
  ...overrides,
})

test('a person with a clean message passes', () => {
  assert.deepEqual(commitFindings(commit({})), [])
})

test('attribution trailers are blocked', () => {
  for (const trailer of [
    'Co-authored-by: X <x@example.org>',
    'Claude-Session: https://example.org',
    'Signed-off-by: X <x@example.org>',
  ]) {
    assert.equal(commitFindings(commit({ body: `fix: thing\n\n${trailer}\n` })).length, 1, trailer)
  }
})

test('AI attribution text is blocked, a mention alone is not', () => {
  assert.equal(commitFindings(commit({ body: 'docs: note\n\nGenerated with Claude Code\n' })).length, 1)
  assert.deepEqual(commitFindings(commit({ body: 'docs: explain the OpenAI-compatible client\n' })), [])
})

test('tool and bot identities are blocked', () => {
  assert.equal(commitFindings(commit({ name: 'dependabot[bot]', email: 'x@users.noreply.github.com' })).length, 1)
  assert.equal(commitFindings(commit({ name: 'Claude', email: 'noreply@anthropic.com' })).length, 1)
})

test('git log records are parsed', () => {
  const log = 'aaaa\x1fAda\x1fada@example.org\x1ffeat: one\n\x1e\nbbbb\x1fBo\x1fbo@example.org\x1ffix: two\n\x1e\n'
  assert.deepEqual(
    parseLog(log).map((entry) => [entry.hash, entry.name, entry.body.trim()]),
    [
      ['aaaa', 'Ada', 'feat: one'],
      ['bbbb', 'Bo', 'fix: two'],
    ],
  )
})
