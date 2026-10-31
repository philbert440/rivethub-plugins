import { constants } from 'node:fs'
import { link, lstat, mkdir, open, readdir, rename, rm, rmdir, stat, unlink } from 'node:fs/promises'
import { dirname, extname, join } from 'node:path'
import { Readable } from 'node:stream'
import type { Settings } from '@rivethub/plugin-sdk'
import { code, escaped, FilesError, failed, inside, type Located, locate, openRoot, shown } from './fence.ts'

const GiB = 1024 * 1024 * 1024
const INLINE: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  avif: 'image/avif',
  ico: 'image/x-icon',
  txt: 'text/plain; charset=utf-8',
  md: 'text/plain; charset=utf-8',
  log: 'text/plain; charset=utf-8',
  xml: 'text/plain; charset=utf-8',
  json: 'application/json',
  csv: 'text/csv; charset=utf-8',
  pdf: 'application/pdf',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  mp4: 'video/mp4',
  webm: 'video/webm',
}

type Entry = { name: string; type: 'dir' | 'file'; size: number; mtime: number }

const answer = (body: unknown): Response => Response.json(body)
const changed = (path: string): Response => answer({ ok: true, path })
const missing = (message: string): FilesError => new FilesError(404, message)
const joined = (dir: string, name: string): string => (dir === '' ? name : `${dir}/${name}`)
const upload = /^\..+\.part-\d+-\d+$/

function method(request: Request, expected: string): URLSearchParams {
  if (request.method !== expected) throw new FilesError(405, 'method not allowed')
  return new URL(request.url).searchParams
}

function named(raw: string | null, kind: 'file' | 'directory'): string {
  if (raw === null || raw === '' || raw === '.' || raw === '..' || /[/\\\0]/.test(raw)) {
    throw new FilesError(422, `invalid ${kind} name`)
  }
  return raw
}

function disposition(inline: boolean, name: string): string {
  const kind = inline ? 'inline' : 'attachment'
  if (/^[\x20-\x7e]+$/.test(name) && !/["\\]/.test(name)) return `${kind}; filename="${name}"`
  const encoded = Array.from(Buffer.from(name, 'utf8'))
    .map((byte) => {
      const char = String.fromCharCode(byte)
      return /[A-Za-z0-9\-_.~]/.test(char) ? char : `%${byte.toString(16).toUpperCase().padStart(2, '0')}`
    })
    .join('')
  return `${kind}; filename*=UTF-8''${encoded}`
}

async function directory(located: Located): Promise<void> {
  const found = await stat(located.absolute).catch(() => undefined)
  if (found?.isDirectory() !== true) throw missing('no such directory')
}

async function absent(dest: string, overwrite: boolean): Promise<void> {
  const found = await lstat(dest).catch((error: unknown) => {
    if (code(error) === 'ENOENT') return undefined
    throw failed('upload', error)
  })
  if (found?.isDirectory()) throw new FilesError(409, 'directory exists')
  if (found !== undefined && !overwrite) throw new FilesError(409, 'file exists')
}

async function written(temp: string, body: ReadableStream<Uint8Array> | null): Promise<void> {
  const handle = await open(temp, 'wx').catch(async (error: unknown) => {
    if (code(error) !== 'EEXIST') throw failed('upload', error)
    if ((await lstat(temp)).isSymbolicLink()) throw escaped()
    throw new FilesError(500, 'upload failed: upload temp already exists')
  })
  try {
    let total = 0
    for await (const chunk of body ?? []) {
      total += chunk.length
      if (total > GiB) throw new FilesError(413, 'upload exceeds 1 GiB cap')
      await handle.write(chunk)
    }
    await handle.sync()
  } finally {
    await handle.close()
  }
}

async function removed(path: string, recursive: boolean): Promise<void> {
  const found = await lstat(path)
  if (!found.isDirectory()) return unlink(path)
  if (recursive) return rm(path, { recursive: true })
  if ((await readdir(path)).length === 0) return rmdir(path)
  throw new FilesError(409, 'directory not empty (pass recursive=1)')
}

function respond(work: () => Promise<Response>): Promise<Response> {
  return work().catch((error: unknown) => {
    if (error instanceof FilesError) return Response.json({ error: error.message }, { status: error.status })
    return Response.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 })
  })
}

export class Files {
  #root: string | undefined
  #seq = 0

  configure(values: Settings): void {
    const root = values.root
    this.#root = typeof root === 'string' && root.trim() !== '' ? root.trim() : undefined
  }

  #configured(): string {
    if (this.#root === undefined) throw new FilesError(503, 'files browser disabled on this node')
    return this.#root
  }

  list(request: Request): Promise<Response> {
    return respond(async () => {
      const configured = this.#configured()
      const query = method(request, 'GET')
      const root = await openRoot(configured)
      const located = await locate(root, query.get('path') ?? '', 'target', 'mustExist', {
        missing: missing('no such directory'),
        what: 'list',
      })
      await directory(located)
      const entries: Entry[] = []
      try {
        for (const name of await readdir(located.absolute)) {
          if (upload.test(name)) continue
          const found = await shown(join(located.absolute, name), root)
          entries.push({
            name,
            type: found.isDirectory() ? 'dir' : 'file',
            size: found.size,
            mtime: Math.trunc(found.mtimeMs),
          })
        }
      } catch (error) {
        throw failed('list', error)
      }
      entries.sort((a, b) =>
        a.type !== b.type ? (a.type === 'dir' ? -1 : 1) : a.name < b.name ? -1 : a.name > b.name ? 1 : 0,
      )
      return answer({ path: located.relative, root, entries })
    })
  }

  download(request: Request): Promise<Response> {
    return respond(async () => {
      const configured = this.#configured()
      const query = method(request, 'GET')
      const root = await openRoot(configured)
      const located = await locate(root, query.get('path') ?? '', 'target', 'mustExist', {
        missing: missing('no such file'),
        what: 'download',
      })
      const handle = await open(
        located.absolute,
        constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK,
      ).catch((error: unknown) => {
        if (code(error) === 'ENOENT') throw missing('no such file')
        if (code(error) === 'ELOOP') throw escaped()
        throw failed('download', error)
      })
      const found = await handle.stat()
      if (!found.isFile() || found.size > GiB) {
        await handle.close()
        throw found.isFile() ? new FilesError(413, 'download exceeds 1 GiB cap') : missing('no such file')
      }
      const name = located.relative.split('/').at(-1) ?? ''
      const type = INLINE[extname(name).slice(1).toLowerCase()]
      return new Response(Readable.toWeb(handle.createReadStream()) as ReadableStream<Uint8Array>, {
        headers: {
          'content-type': type ?? 'application/octet-stream',
          'content-disposition': disposition(type !== undefined, name),
          'x-content-type-options': 'nosniff',
        },
      })
    })
  }

  upload(request: Request): Promise<Response> {
    return respond(async () => {
      const configured = this.#configured()
      const query = method(request, 'POST')
      const name = named(query.get('name'), 'file')
      const overwrite = query.get('overwrite') === '1'
      const root = await openRoot(configured)
      const parent = await locate(root, query.get('dir') ?? '', 'target', 'mustExist', {
        missing: missing('no such directory'),
        what: 'upload',
      })
      await directory(parent)
      const dest = join(parent.absolute, name)
      const temp = join(parent.absolute, `.${name}.part-${process.pid}-${++this.#seq}`)
      if (!inside(root, dest) || !inside(root, temp)) throw escaped()
      await absent(dest, overwrite)
      try {
        await written(temp, request.body)
        await absent(dest, overwrite)
        if (overwrite) {
          await rename(temp, dest).catch((error: unknown) => {
            throw failed('upload', error)
          })
        } else {
          await link(temp, dest).catch((error: unknown) => {
            throw code(error) === 'EEXIST' ? new FilesError(409, 'file exists') : failed('upload', error)
          })
        }
      } finally {
        await rm(temp, { force: true })
      }
      return changed(joined(parent.relative, name))
    })
  }

  mkdir(request: Request): Promise<Response> {
    return respond(async () => {
      const configured = this.#configured()
      const query = method(request, 'POST')
      const name = named(query.get('name'), 'directory')
      const root = await openRoot(configured)
      const parent = await locate(root, query.get('dir') ?? '', 'target', 'mustExist', {
        missing: missing('no such directory'),
        what: 'mkdir',
      })
      await directory(parent)
      await mkdir(join(parent.absolute, name)).catch((error: unknown) => {
        throw code(error) === 'EEXIST' ? new FilesError(409, 'directory exists') : failed('mkdir', error)
      })
      return changed(joined(parent.relative, name))
    })
  }

  rename(request: Request): Promise<Response> {
    return respond(async () => {
      const configured = this.#configured()
      const query = method(request, 'POST')
      const from = query.get('from')
      const to = query.get('to')
      if (!from || !to) throw new FilesError(422, 'from and to are required')
      const root = await openRoot(configured)
      const source = await locate(root, from, 'entry', 'mustExist', {
        missing: missing('no such path'),
        what: 'rename',
      })
      const destinationMissing = missing('destination directory does not exist')
      const dest = await locate(root, to, 'entry', 'mayBeNew', { missing: destinationMissing, what: 'rename' })
      if (source.relative === dest.relative) throw new FilesError(422, 'from and to are the same path')
      if (source.relative === '' || dest.relative === '') throw new FilesError(403, 'cannot rename the files root')
      if ((await shown(source.absolute, root)).isDirectory() && inside(source.absolute, dest.absolute)) {
        throw new FilesError(422, 'cannot move a directory into itself')
      }
      const parent = dirname(dest.absolute)
      if (!inside(root, parent) || !(await stat(parent).catch(() => undefined))?.isDirectory()) {
        throw destinationMissing
      }
      if ((await lstat(dest.absolute).catch(() => undefined))?.isDirectory()) {
        throw new FilesError(409, 'directory exists')
      }
      await rename(source.absolute, dest.absolute).catch((error: unknown) => {
        throw failed('rename', error)
      })
      return changed(dest.relative)
    })
  }

  delete(request: Request): Promise<Response> {
    return respond(async () => {
      const configured = this.#configured()
      const query = method(request, 'DELETE')
      const raw = query.get('path')
      if (!raw) throw new FilesError(422, 'path is required')
      const root = await openRoot(configured)
      const located = await locate(root, raw, 'entry', 'mustExist', {
        missing: missing('no such path'),
        what: 'delete',
      })
      if (located.relative === '') throw new FilesError(403, 'cannot delete the files root')
      await removed(located.absolute, query.get('recursive') === '1').catch((error: unknown) => {
        throw error instanceof FilesError ? error : failed('delete', error)
      })
      return changed(located.relative)
    })
  }
}
