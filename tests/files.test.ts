import assert from 'node:assert/strict'
import { mkdir, mkdtemp, readFile, realpath, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, test } from 'node:test'
import { Files } from '../plugins/files/src/files.ts'

const scratch = await realpath(await mkdtemp(join(tmpdir(), 'files-plugin-')))
after(() => rm(scratch, { recursive: true, force: true }))

let trees = 0

async function tree(): Promise<{ files: Files; root: string; outside: string }> {
  const base = join(scratch, String(++trees))
  const root = join(base, 'root')
  const outside = join(base, 'outside')
  await mkdir(join(root, 'nested'), { recursive: true })
  await mkdir(outside)
  await writeFile(join(root, 'nested', 'leaf.txt'), 'leaf')
  await writeFile(join(outside, 'secret'), 'SECRET')
  await symlink(join(outside, 'secret'), join(root, 'out'))
  await symlink(outside, join(root, 'outdir'))
  await symlink(join(root, 'nested'), join(root, 'aliasdir'))
  const files = new Files()
  files.configure({ root })
  return { files, root, outside }
}

const call = (method: string, route: string, body?: string): Request =>
  new Request(`http://plugin/http/${route}`, { method, ...(body === undefined ? {} : { body }) })

async function refused(response: Response, status: number, error: string): Promise<void> {
  assert.equal(response.status, status)
  assert.deepEqual(await response.json(), { error })
}

test('no path climbs out of the root, plain or percent-encoded', async () => {
  const { files } = await tree()
  for (const encoded of [
    '..',
    'nested/../..',
    '%2Fetc%2Fpasswd',
    '~%2Fx',
    'a%5Cb',
    '%2e%2e',
    '..%2F..%2Fsecret',
    '%2e%2e%2fsecret',
  ]) {
    const query = `path=${encoded}`
    await refused(await files.download(call('GET', `download?${query}`)), 403, 'path escapes the files root')
    await refused(await files.list(call('GET', `list?${query}`)), 403, 'path escapes the files root')
    await refused(await files.delete(call('DELETE', `delete?${query}`)), 403, 'path escapes the files root')
  }
  await refused(await files.upload(call('POST', 'upload?dir=..&name=x', 'x')), 403, 'path escapes the files root')
  await refused(await files.rename(call('POST', 'rename?from=nested&to=../moved')), 403, 'path escapes the files root')
})

test('links are followed only while they stay inside the root', async () => {
  const { files, outside } = await tree()
  await refused(await files.download(call('GET', 'download?path=out')), 403, 'path escapes the files root')
  await refused(await files.list(call('GET', 'list?path=outdir')), 403, 'path escapes the files root')
  await refused(
    await files.upload(call('POST', 'upload?dir=outdir&name=planted', 'x')),
    403,
    'path escapes the files root',
  )
  const aliased = await files.download(call('GET', 'download?path=aliasdir/leaf.txt'))
  assert.equal(aliased.status, 200)
  assert.equal(await aliased.text(), 'leaf')
  const listed = (await (await files.list(call('GET', 'list'))).json()) as { entries: { name: string; type: string }[] }
  assert.deepEqual(
    listed.entries.map(({ name, type }) => `${type}:${name}`),
    ['dir:aliasdir', 'dir:nested', 'file:out', 'file:outdir'],
  )
  assert.equal((await files.delete(call('DELETE', 'delete?path=outdir'))).status, 200)
  assert.equal((await files.delete(call('DELETE', 'delete?path=out'))).status, 200)
  assert.equal(await readFile(join(outside, 'secret'), 'utf8'), 'SECRET')
})

test('uploads land whole under their name, never clobber unasked, and hide their part file', async () => {
  const { files, root } = await tree()
  const first = await files.upload(call('POST', 'upload?dir=nested&name=new.txt', 'one'))
  assert.deepEqual(await first.json(), { ok: true, path: 'nested/new.txt' })
  await refused(await files.upload(call('POST', 'upload?dir=nested&name=new.txt', 'two')), 409, 'file exists')
  assert.equal((await files.upload(call('POST', 'upload?dir=nested&name=new.txt&overwrite=1', 'two'))).status, 200)
  assert.equal(await readFile(join(root, 'nested', 'new.txt'), 'utf8'), 'two')
  await refused(await files.upload(call('POST', 'upload?dir=nested&name=..', 'x')), 422, 'invalid file name')
  await writeFile(join(root, 'nested', '.new.txt.part-1-2'), 'partial')
  const listed = (await (await files.list(call('GET', 'list?path=nested'))).json()) as { entries: { name: string }[] }
  assert.deepEqual(
    listed.entries.map(({ name }) => name),
    ['leaf.txt', 'new.txt'],
  )
})

test('a node without a root answers that the browser is disabled', async () => {
  const files = new Files()
  files.configure({})
  await refused(await files.list(call('GET', 'list')), 503, 'files browser disabled on this node')
  files.configure({ root: 'relative/root' })
  await refused(await files.list(call('GET', 'list')), 503, 'files root not available: relative/root')
})
