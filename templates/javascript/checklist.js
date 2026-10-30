import { readFileSync, renameSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const KEPT_FILINGS = 5

export class Checklist {
  #file
  #state

  constructor(dataDir) {
    this.#file = join(dataDir, 'checklist.json')
    try {
      this.#state = JSON.parse(readFileSync(this.#file, 'utf8'))
    } catch {
      this.#state = { next: 1, items: [], filings: [] }
    }
  }

  get items() {
    return this.#state.items
  }

  get filings() {
    return this.#state.filings
  }

  get open() {
    return this.#state.items.filter((item) => !item.done).length
  }

  add(title) {
    const item = { id: String(this.#state.next), title, done: false }
    this.#state.next += 1
    this.#state.items.push(item)
    this.#save()
    return item
  }

  toggle(id) {
    const item = this.#state.items.find((found) => found.id === id)
    if (item !== undefined) {
      item.done = !item.done
      this.#save()
    }
    return item
  }

  remove(ids) {
    this.#state.items = this.#state.items.filter((item) => !ids.includes(item.id))
    this.#save()
  }

  place(positions) {
    for (const { id, x, y } of positions) {
      const item = this.#state.items.find((found) => found.id === id)
      if (item !== undefined) Object.assign(item, { x, y })
    }
    this.#save()
  }

  filed(filing) {
    this.#state.filings = [filing, ...this.#state.filings].slice(0, KEPT_FILINGS)
    this.#save()
  }

  #save() {
    writeFileSync(`${this.#file}.tmp`, JSON.stringify(this.#state))
    renameSync(`${this.#file}.tmp`, this.#file)
  }
}
