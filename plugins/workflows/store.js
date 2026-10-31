import { randomUUID } from 'node:crypto'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'

const SCHEMA = `
CREATE TABLE IF NOT EXISTS workflows (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS steps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workflow_id TEXT NOT NULL,
  position INTEGER NOT NULL,
  agent TEXT NOT NULL,
  prompt TEXT NOT NULL,
  UNIQUE (workflow_id, position)
);
CREATE TABLE IF NOT EXISTS runs (
  id TEXT PRIMARY KEY,
  workflow_id TEXT NOT NULL,
  workflow_name TEXT NOT NULL,
  status TEXT NOT NULL,
  result TEXT,
  started_at INTEGER NOT NULL,
  finished_at INTEGER
);
CREATE TABLE IF NOT EXISTS run_steps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id TEXT NOT NULL,
  position INTEGER NOT NULL,
  agent TEXT NOT NULL,
  prompt TEXT NOT NULL,
  status TEXT NOT NULL,
  task_id TEXT,
  result TEXT,
  started_at INTEGER,
  finished_at INTEGER
);
`

export class Store {
  #db

  constructor(dataDir) {
    mkdirSync(dataDir, { recursive: true })
    this.#db = new DatabaseSync(join(dataDir, 'workflows.db'))
    this.#db.exec('PRAGMA journal_mode = WAL')
    this.#db.exec('PRAGMA busy_timeout = 5000')
    this.#db.exec(SCHEMA)
  }

  workflows() {
    return this.#db
      .prepare(
        `SELECT w.id, w.name, w.updated_at AS updatedAt,
                (SELECT COUNT(*) FROM steps s WHERE s.workflow_id = w.id) AS stepCount
         FROM workflows w
         ORDER BY w.updated_at DESC`,
      )
      .all()
  }

  get(id) {
    return this.#db
      .prepare('SELECT id, name, created_at AS createdAt, updated_at AS updatedAt FROM workflows WHERE id = ?')
      .get(id)
  }

  steps(workflowId) {
    return this.#db
      .prepare(
        'SELECT id, workflow_id AS workflowId, position, agent, prompt FROM steps WHERE workflow_id = ? ORDER BY position',
      )
      .all(workflowId)
  }

  create(name) {
    const now = Date.now()
    const id = this.#freshId(name)
    this.#db
      .prepare('INSERT INTO workflows (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)')
      .run(id, name, now, now)
    return this.get(id)
  }

  rename(id, name) {
    this.#db.prepare('UPDATE workflows SET name = ?, updated_at = ? WHERE id = ?').run(name, Date.now(), id)
  }

  addStep(workflowId, agent, prompt) {
    const row = this.#db
      .prepare('SELECT COALESCE(MAX(position), 0) AS maxPos FROM steps WHERE workflow_id = ?')
      .get(workflowId)
    const position = Number(row.maxPos) + 1
    this.#db
      .prepare('INSERT INTO steps (workflow_id, position, agent, prompt) VALUES (?, ?, ?, ?)')
      .run(workflowId, position, agent, prompt)
    this.#touch(workflowId)
  }

  removeStep(workflowId, stepId) {
    this.#db.prepare('DELETE FROM steps WHERE workflow_id = ? AND id = ?').run(workflowId, Number(stepId))
    this.#renumber(workflowId)
    this.#touch(workflowId)
  }

  moveStep(workflowId, stepId, direction) {
    const steps = this.steps(workflowId)
    const index = steps.findIndex((step) => String(step.id) === String(stepId))
    const swap = direction === 'up' ? index - 1 : index + 1
    if (index < 0 || swap < 0 || swap >= steps.length) return
    const current = steps[index]
    const other = steps[swap]
    const update = this.#db.prepare('UPDATE steps SET position = ? WHERE id = ?')
    update.run(-1, current.id)
    update.run(current.position, other.id)
    update.run(other.position, current.id)
    this.#touch(workflowId)
  }

  remove(id) {
    this.#db.prepare('DELETE FROM steps WHERE workflow_id = ?').run(id)
    this.#db.prepare('DELETE FROM workflows WHERE id = ?').run(id)
  }

  runs(limit = 30) {
    return this.#db
      .prepare(
        `SELECT id, workflow_id AS workflowId, workflow_name AS workflowName, status, result,
                started_at AS startedAt, finished_at AS finishedAt
         FROM runs ORDER BY started_at DESC LIMIT ?`,
      )
      .all(limit)
  }

  runsFor(workflowId) {
    return this.#db
      .prepare(
        `SELECT id, workflow_id AS workflowId, workflow_name AS workflowName, status, result,
                started_at AS startedAt, finished_at AS finishedAt
         FROM runs WHERE workflow_id = ? ORDER BY started_at DESC`,
      )
      .all(workflowId)
  }

  getRun(id) {
    return this.#db
      .prepare(
        `SELECT id, workflow_id AS workflowId, workflow_name AS workflowName, status, result,
                started_at AS startedAt, finished_at AS finishedAt
         FROM runs WHERE id = ?`,
      )
      .get(id)
  }

  runSteps(runId) {
    return this.#db
      .prepare(
        `SELECT id, run_id AS runId, position, agent, prompt, status, task_id AS taskId, result,
                started_at AS startedAt, finished_at AS finishedAt
         FROM run_steps WHERE run_id = ? ORDER BY position`,
      )
      .all(runId)
  }

  activeRun(workflowId) {
    return this.#db.prepare(`SELECT id FROM runs WHERE workflow_id = ? AND status = 'running' LIMIT 1`).get(workflowId)
  }

  unfinished() {
    return this.#db.prepare(`SELECT id FROM runs WHERE status = 'running' ORDER BY started_at`).all()
  }

  startRun(workflow) {
    const steps = this.steps(workflow.id)
    const runId = randomUUID()
    const now = Date.now()
    this.#db.exec('BEGIN')
    try {
      this.#db
        .prepare('INSERT INTO runs (id, workflow_id, workflow_name, status, started_at) VALUES (?, ?, ?, ?, ?)')
        .run(runId, workflow.id, workflow.name, 'running', now)
      const insert = this.#db.prepare(
        'INSERT INTO run_steps (run_id, position, agent, prompt, status) VALUES (?, ?, ?, ?, ?)',
      )
      for (const step of steps) insert.run(runId, step.position, step.agent, step.prompt, 'pending')
      this.#db.exec('COMMIT')
    } catch (error) {
      this.#db.exec('ROLLBACK')
      throw error
    }
    return this.getRun(runId)
  }

  markStepRunning(stepId, taskId) {
    this.#db
      .prepare(`UPDATE run_steps SET status = 'running', task_id = ?, started_at = ? WHERE id = ?`)
      .run(taskId ?? null, Date.now(), stepId)
  }

  finishStep(stepId, status, result) {
    this.#db
      .prepare('UPDATE run_steps SET status = ?, result = ?, finished_at = ? WHERE id = ?')
      .run(status, result, Date.now(), stepId)
  }

  finishRun(runId, status, result) {
    this.#db
      .prepare('UPDATE runs SET status = ?, result = ?, finished_at = ? WHERE id = ?')
      .run(status, result, Date.now(), runId)
  }

  #touch(id) {
    this.#db.prepare('UPDATE workflows SET updated_at = ? WHERE id = ?').run(Date.now(), id)
  }

  #renumber(workflowId) {
    const steps = this.steps(workflowId)
    const update = this.#db.prepare('UPDATE steps SET position = ? WHERE id = ?')
    for (const [index, step] of steps.entries()) update.run(-(index + 1), step.id)
    for (const [index, step] of steps.entries()) update.run(index + 1, step.id)
  }

  #freshId(name) {
    const base =
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 24) || 'workflow'
    let id = base
    let n = 2
    while (this.get(id) !== undefined) {
      id = `${base.slice(0, 20)}-${n}`
      n += 1
    }
    return id
  }
}
