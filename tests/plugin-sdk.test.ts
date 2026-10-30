import assert from 'node:assert/strict'
import { test } from 'node:test'
import { Refusal, router } from '@rivethub/plugin-sdk'

const deliver = (seq: number, event: object): string => JSON.stringify({ seq, at: 0, missed: 0, event })

test('an action refusal answers 422 naming its fields, and an accepted action answers its actions', async () => {
  const route = router({
    actions: {
      add: ({ values }) => {
        if (values?.title === undefined) throw new Refusal('Give it a title', { title: 'Required' })
        return [{ type: 'refresh' }]
      },
    },
  })
  assert.deepEqual(await route('POST', '/actions/add', JSON.stringify({ context: {} })), {
    status: 422,
    body: { message: 'Give it a title', fields: { title: 'Required' } },
  })
  assert.deepEqual(await route('POST', '/actions/add', JSON.stringify({ values: { title: 'x' }, context: {} })), {
    status: 200,
    body: { actions: [{ type: 'refresh' }] },
  })
})

test('a tool that throws answers its message as an error result', async () => {
  const route = router({
    tools: {
      add_item: ({ title }) => {
        if (typeof title !== 'string') throw new Error('title must be a string')
        return `added ${title}`
      },
    },
  })
  assert.deepEqual(await route('POST', '/tools/add_item', JSON.stringify({ arguments: { title: 'x' } })), {
    status: 200,
    body: { text: 'added x' },
  })
  assert.deepEqual(await route('POST', '/tools/add_item', JSON.stringify({ arguments: {} })), {
    status: 200,
    body: { text: 'title must be a string', isError: true },
  })
})

test('a repeated delivery is handled once, a failed one is retried, settings go to the settings handler', async () => {
  const seen: string[] = []
  let failing = true
  const route = router({
    events: {
      'session.idle': ({ sessionId }) => {
        if (sessionId === 'b' && failing) {
          failing = false
          throw new Error('not yet')
        }
        seen.push(sessionId)
      },
    },
    settings: (values) => {
      seen.push(JSON.stringify(values))
    },
  })
  const idle = (sessionId: string) => ({ type: 'session.idle', sessionId })
  const status = async (seq: number, event: object) => (await route('POST', '/events', deliver(seq, event))).status
  assert.equal(await status(1, idle('a')), 204)
  assert.equal(await status(1, idle('a')), 204)
  assert.equal(await status(2, { type: 'settings.changed', values: { on: true } }), 204)
  assert.equal(await status(3, idle('b')), 500)
  assert.equal(await status(3, idle('b')), 204)
  assert.deepEqual(seen, ['a', '{"on":true}', 'b'])
})

test('health answers and an unknown route is the plug-in’s own 404', async () => {
  const route = router({})
  assert.equal((await route('GET', '/health', '')).status, 200)
  assert.equal((await route('POST', '/views/main', '{}')).status, 404)
})
