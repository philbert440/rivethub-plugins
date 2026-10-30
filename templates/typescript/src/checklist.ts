import { readFileSync, renameSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { EventOf } from '@rivethub/plugin-sdk'

export type Item = { id: string; title: string; done: boolean; x?: number; y?: number }
export type Filing = Omit<EventOf<'session.placed'>, 'type'> & { at: number }
type State = { next: number; items: Item[]; filings: Filing[] }

const KEPT_FILINGS = 5

export class Checklist {
  readonly #file: string
  #state: State

  constructor(dataDir: string) {
    this.#file = join(dataDir, 'checklist.json')
    try {
      this.#state = JSON.parse(readFileSync(this.#file, 'utf8')) as State
    } catch {
      this.#state = { next: 1, items: [], filings: [] }
    }
  }

  get items(): readonly Item[] {
    return this.#state.items
  }

  get filings(): readonly Filing[] {
    return this.#state.filings
  }

  get open(): number {
    return this.#state.items.filter((item) => !item.done).length
  }

  add(title: string): Item {
    const item = { id: String(this.#state.next), title, done: false }
    this.#state.next += 1
    this.#state.items.push(item)
    this.#save()
    return item
  }

  toggle(id: string): Item | undefined {
    const item = this.#state.items.find((found) => found.id === id)
    if (item !== undefined) {
      item.done = !item.done
      this.#save()
    }
    return item
  }

  remove(ids: readonly string[]): void {
    this.#state.items = this.#state.items.filter((item) => !ids.includes(item.id))
    this.#save()
  }

  place(positions: readonly { id: string; x: number; y: number }[]): void {
    for (const { id, x, y } of positions) {
      const item = this.#state.items.find((found) => found.id === id)
      if (item !== undefined) Object.assign(item, { x, y })
    }
    this.#save()
  }

  filed(filing: Filing): void {
    this.#state.filings = [filing, ...this.#state.filings].slice(0, KEPT_FILINGS)
    this.#save()
  }

  #save(): void {
    writeFileSync(`${this.#file}.tmp`, JSON.stringify(this.#state))
    renameSync(`${this.#file}.tmp`, this.#file)
  }
}
