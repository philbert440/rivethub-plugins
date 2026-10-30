import type { Settings } from '@rivethub/plugin-sdk'

const MiB = 1024 * 1024
const AUDIO_LIMIT = 15 * MiB
const SPEAK_LIMIT = 64 * 1024
const INPUT_LIMIT = 4096
const TRANSCRIPT_LIMIT = MiB
const SPEECH_LIMIT = 30 * MiB
const SNIPPET_CHARS = 240
const SNIPPET_BYTES = 8 * 1024
const STT_TIMEOUT_MS = 60_000
const TTS_TIMEOUT_MS = 120_000
const WAV = 'audio/wav'
const MEDIA = new Set([
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
  'audio/mpeg',
  'audio/mp3',
  'audio/mp4',
  'audio/m4a',
  'audio/x-m4a',
  'audio/aac',
  'audio/webm',
  'audio/ogg',
  'audio/flac',
  'application/octet-stream',
  'video/webm',
])

class VoiceError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

type Endpoint = { url: URL } | { fault: string } | undefined
type Endpoints = { stt: Endpoint; tts: Endpoint; instructions: string | undefined }

const text = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined

function endpoint(raw: unknown, kind: string): Endpoint {
  const value = text(raw)
  if (value === undefined) return undefined
  const url = URL.parse(value)
  if (url === null || (url.protocol !== 'http:' && url.protocol !== 'https:') || url.hostname === '') {
    return { fault: `voice ${kind} URL is invalid: ${value} must be an http or https URL with a host` }
  }
  return { url }
}

const answer = (status: number, body: unknown): Response => Response.json(body, { status })

function failure(error: unknown): Response {
  if (error instanceof VoiceError) return answer(error.status, { error: error.message })
  return answer(500, { error: error instanceof Error ? error.message : String(error) })
}

function snippet(bytes: Uint8Array): string {
  if (bytes.length === 0) return 'upstream body was empty'
  return Array.from(new TextDecoder().decode(bytes)).slice(0, SNIPPET_CHARS).join('')
}

function upstream(route: string, detail: string): VoiceError {
  console.error(`[voice] ${route} upstream failed: ${detail}`)
  return new VoiceError(502, `voice upstream failed: ${detail}`)
}

const status = (response: Response): string => `status ${response.status} ${response.statusText}`.trimEnd()

function cause(error: unknown): string {
  const parts: string[] = []
  let current: unknown = error
  while (current instanceof Error && parts.length < 8) {
    parts.push(current.message)
    current = current.cause
  }
  return Array.from(parts.join(': ')).slice(0, SNIPPET_CHARS).join('')
}

async function read(body: ReadableStream<Uint8Array> | null, limit: number): Promise<Uint8Array> {
  if (body === null) return new Uint8Array()
  const reader = body.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    for (let next = await reader.read(); !next.done; next = await reader.read()) {
      size += next.value.length
      if (size > limit) throw new RangeError()
      chunks.push(next.value)
    }
  } finally {
    reader.releaseLock()
  }
  return Buffer.concat(chunks)
}

async function prefix(response: Response): Promise<Uint8Array> {
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    for await (const chunk of response.body ?? []) {
      chunks.push(chunk.subarray(0, SNIPPET_BYTES - size))
      size += chunk.length
      if (size >= SNIPPET_BYTES) break
    }
  } catch {}
  return Buffer.concat(chunks)
}

function media(header: string | null): string {
  const named = header?.split(';')[0]?.trim().toLowerCase() ?? ''
  return MEDIA.has(named) ? named : WAV
}

function capped(body: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  let seen = 0
  return body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        seen += chunk.length
        if (seen > SPEECH_LIMIT) controller.error(new Error('upstream audio exceeds 30 MiB'))
        else controller.enqueue(chunk)
      },
    }),
  )
}

type Speak = { input: string; instructions?: string; voice?: string }

function speakBody(bytes: Uint8Array): Speak {
  let document: unknown
  try {
    document = JSON.parse(new TextDecoder().decode(bytes))
  } catch {
    throw new VoiceError(400, 'speak body must be JSON')
  }
  if (typeof document !== 'object' || document === null || Array.isArray(document)) {
    throw new VoiceError(400, 'speak body must be a JSON object')
  }
  const { input, instructions, voice } = document as Record<string, unknown>
  for (const [key, value] of Object.entries({ input, instructions, voice })) {
    if (value !== undefined && value !== null && typeof value !== 'string') {
      throw new VoiceError(400, `${key} must be a string`)
    }
  }
  if (typeof input !== 'string' || input === '') throw new VoiceError(400, 'input required')
  if (Buffer.byteLength(input) > INPUT_LIMIT) throw new VoiceError(400, 'input exceeds 4096 UTF-8 bytes')
  return {
    input,
    ...(typeof instructions === 'string' ? { instructions } : {}),
    ...(typeof voice === 'string' ? { voice } : {}),
  }
}

export class Voice {
  #endpoints: Endpoints = { stt: undefined, tts: undefined, instructions: undefined }

  configure(values: Settings): void {
    this.#endpoints = {
      stt: endpoint(values.sttUrl, 'transcription'),
      tts: endpoint(values.ttsUrl, 'synthesis'),
      instructions: text(values.instructions),
    }
    for (const found of [this.#endpoints.stt, this.#endpoints.tts]) {
      if (found !== undefined && 'fault' in found) console.error(`[voice] ${found.fault}`)
    }
  }

  #configured(kind: 'stt' | 'tts'): URL {
    const found = this.#endpoints[kind]
    if (found === undefined) {
      throw new VoiceError(
        501,
        `voice ${kind === 'stt' ? 'transcription' : 'synthesis'} is not configured on this node`,
      )
    }
    if ('fault' in found) throw new VoiceError(501, found.fault)
    return found.url
  }

  async transcribe(request: Request): Promise<Response> {
    if (request.method !== 'POST') return answer(404, { error: 'not found' })
    try {
      const url = this.#configured('stt')
      const audio = await read(request.body, AUDIO_LIMIT).catch((error: unknown) => {
        if (error instanceof RangeError) throw new VoiceError(413, 'audio body too large')
        throw new VoiceError(400, `the voice request body failed: ${cause(error)}`)
      })
      if (audio.length === 0) throw new VoiceError(400, 'empty audio body')
      const form = new FormData()
      form.append('file', new Blob([audio], { type: media(request.headers.get('content-type')) }), 'speech.audio')
      const response = await fetch(url, {
        method: 'POST',
        body: form,
        signal: AbortSignal.timeout(STT_TIMEOUT_MS),
      }).catch((error: unknown) => {
        throw upstream('transcribe', cause(error))
      })
      if (!response.ok) {
        throw upstream('transcribe', `${status(response)}: ${snippet(await prefix(response))}`)
      }
      const body = await read(response.body, TRANSCRIPT_LIMIT).catch(async (error: unknown) => {
        await response.body?.cancel().catch(() => undefined)
        throw upstream(
          'transcribe',
          error instanceof RangeError ? 'upstream transcription exceeds 1 MiB' : cause(error),
        )
      })
      let parsed: unknown
      try {
        parsed = JSON.parse(new TextDecoder().decode(body))
      } catch {
        throw upstream('transcribe', snippet(body))
      }
      const transcript = (parsed as { text?: unknown } | null)?.text
      if (typeof transcript !== 'string') throw upstream('transcribe', snippet(body))
      return answer(200, { text: transcript })
    } catch (error) {
      return failure(error)
    }
  }

  async speak(request: Request): Promise<Response> {
    if (request.method !== 'POST') return answer(404, { error: 'not found' })
    try {
      const url = this.#configured('tts')
      const bytes = await read(request.body, SPEAK_LIMIT).catch((error: unknown) => {
        if (error instanceof RangeError) throw new VoiceError(400, 'speak body too large')
        throw new VoiceError(400, `the voice request body failed: ${cause(error)}`)
      })
      const body = speakBody(bytes)
      const instructions = body.instructions ?? this.#endpoints.instructions
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          input: body.input,
          response_format: 'wav',
          ...(instructions === undefined ? {} : { instructions }),
          ...(body.voice === undefined ? {} : { voice: body.voice }),
        }),
        signal: AbortSignal.timeout(TTS_TIMEOUT_MS),
      }).catch((error: unknown) => {
        throw upstream('speak', cause(error))
      })
      if (!response.ok) {
        throw upstream('speak', `${status(response)}: ${snippet(await prefix(response))}`)
      }
      if (Number(response.headers.get('content-length') ?? 0) > SPEECH_LIMIT) {
        await response.body?.cancel()
        throw upstream('speak', 'upstream audio exceeds 30 MiB')
      }
      const type = response.headers.get('content-type') || WAV
      return new Response(response.body === null ? null : capped(response.body), {
        status: 200,
        headers: { 'content-type': type },
      })
    } catch (error) {
      return failure(error)
    }
  }
}
