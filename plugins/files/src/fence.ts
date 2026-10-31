import type { Stats } from 'node:fs'
import { lstat, realpath, stat } from 'node:fs/promises'
import { isAbsolute, join, relative, sep } from 'node:path'

export class FilesError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export const escaped = (): FilesError => new FilesError(403, 'path escapes the files root')

export const failed = (what: string, error: unknown): FilesError =>
  new FilesError(500, `${what} failed: ${error instanceof Error ? error.message : String(error)}`)

export const code = (error: unknown): string | undefined =>
  error instanceof Error ? (error as NodeJS.ErrnoException).code : undefined

export type Follow = 'target' | 'entry'
export type Final = 'mustExist' | 'mayBeNew'
export type Located = { absolute: string; relative: string }
export type Failures = { missing: FilesError; what: string }

export function inside(root: string, path: string): boolean {
  const rest = relative(root, path)
  return rest === '' || (rest !== '..' && !rest.startsWith(`..${sep}`) && !isAbsolute(rest))
}

export async function openRoot(configured: string): Promise<string> {
  const unavailable = new FilesError(503, `files root not available: ${configured}`)
  if (!isAbsolute(configured)) throw unavailable
  try {
    const root = await realpath(configured)
    if ((await stat(root)).isDirectory()) return root
  } catch (error) {
    console.error(`[files] files root ${configured} is not available: ${String(error)}`)
  }
  throw unavailable
}

function segments(raw: string): string[] {
  if (raw.includes('\0') || raw.includes('\\') || raw.startsWith('/') || raw.startsWith('~')) throw escaped()
  const parts = raw.split('/').filter((part) => part !== '' && part !== '.')
  if (parts.includes('..')) throw escaped()
  return parts
}

async function linked(path: string, root: string, on: Failures): Promise<string> {
  try {
    const target = await realpath(path)
    if (inside(root, target)) return target
  } catch (error) {
    if (code(error) === 'ENOENT') throw on.missing
    throw failed(on.what, error)
  }
  throw escaped()
}

export async function locate(root: string, raw: string, follow: Follow, final: Final, on: Failures): Promise<Located> {
  const parts = segments(raw)
  let current = root
  for (const [index, part] of parts.entries()) {
    const last = index + 1 === parts.length
    const next = join(current, part)
    let found: Stats
    try {
      found = await lstat(next)
    } catch (error) {
      if (code(error) === 'ENOENT' && last && final === 'mayBeNew') {
        current = next
        continue
      }
      if (code(error) === 'ENOENT' || code(error) === 'ENOTDIR') throw on.missing
      throw failed(on.what, error)
    }
    current = found.isSymbolicLink() && !(last && follow === 'entry') ? await linked(next, root, on) : next
  }
  if (!inside(root, current)) throw escaped()
  return { absolute: current, relative: parts.join('/') }
}

export async function shown(path: string, root: string): Promise<Stats> {
  const own = await lstat(path)
  if (!own.isSymbolicLink()) return own
  try {
    const target = await realpath(path)
    return inside(root, target) ? await stat(target) : own
  } catch (error) {
    if (code(error) === 'ENOENT') return own
    throw error
  }
}
