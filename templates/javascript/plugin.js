import { Checklist } from './checklist.js'
import { connect, pluginEnv, Refusal, serve } from './sdk/index.ts'

const NODE = { width: 180, height: 56, columns: 4, gap: 24 }

const checklist = new Checklist(pluginEnv().dataDir)
const rh = connect()

function node(item, index) {
  return {
    type: 'node',
    id: item.id,
    x: item.x ?? NODE.gap + (index % NODE.columns) * (NODE.width + NODE.gap),
    y: item.y ?? NODE.gap + Math.floor(index / NODE.columns) * (NODE.height + NODE.gap),
    width: NODE.width,
    height: NODE.height,
    shapes: [
      {
        type: 'rect',
        x: 0,
        y: 0,
        width: NODE.width,
        height: NODE.height,
        radius: 12,
        fill: item.done ? 'secondaryContainer' : 'surfaceContainerHigh',
        stroke: item.done ? 'success' : 'outlineVariant',
      },
      {
        type: 'icon',
        x: 12,
        y: 16,
        name: item.done ? 'check_circle' : 'pending',
        size: 24,
        color: item.done ? 'success' : 'onSurfaceVariant',
      },
      { type: 'text', x: 44, y: 19, text: item.title, weight: 'medium', maxWidth: NODE.width - 56 },
    ],
    tooltip: item.done ? 'Done: double-click to reopen' : 'Double-click to mark done',
  }
}

function filed(filing) {
  return [
    { type: 'badge', text: filing.by === 'you' ? 'by you' : 'by the categorizer', tone: 'neutral' },
    { type: 'time', at: filing.at, style: 'relative' },
  ]
}

function main() {
  return {
    title: 'Checklist',
    subtitle: `${checklist.open} open, ${checklist.items.length - checklist.open} done`,
    blocks: [
      {
        type: 'form',
        id: 'add',
        fields: [
          {
            key: 'title',
            label: 'New item',
            input: { type: 'text' },
            required: true,
            placeholder: 'What needs doing?',
          },
        ],
        buttons: [{ label: 'Add', icon: 'add', style: 'primary', action: { type: 'call', action: 'add' } }],
      },
      {
        type: 'list',
        items: checklist.items.map((item) => ({
          id: item.id,
          title: item.title,
          icon: item.done ? 'check_circle' : 'pending',
          action: { type: 'call', action: 'toggle', params: { id: item.id } },
          menu: [
            {
              label: 'Delete',
              icon: 'delete',
              style: 'danger',
              action: { type: 'call', action: 'remove', params: { id: item.id } },
            },
          ],
        })),
        empty: { title: 'Nothing on the list', text: 'Add an item above, or ask an agent to use the add_item tool.' },
      },
      {
        type: 'section',
        title: 'Board',
        subtitle: 'Drag items to arrange them, double-click one to mark it done.',
        blocks: [
          {
            type: 'canvas',
            id: 'board',
            scene: { items: checklist.items.map(node), grid: { size: 8, snap: true } },
            height: 280,
          },
        ],
      },
      {
        type: 'section',
        title: 'Recently filed sessions',
        blocks: [
          {
            type: 'list',
            items: checklist.filings.map((filing) => ({
              id: `${filing.sessionId}-${filing.at}`,
              title: `Session ${filing.sessionId.split(':').pop().slice(0, 8)}`,
              icon: 'folder',
              trailing: filed(filing),
              action: { type: 'openSession', sessionId: filing.sessionId },
              menu: [
                { label: 'Open topic', icon: 'folder_open', action: { type: 'openTopic', topicId: filing.topicId } },
              ],
            })),
            empty: { title: 'No sessions filed yet', text: 'Sessions filed into a topic show here.' },
          },
        ],
      },
    ],
  }
}

const idOf = (params) => String(params?.id ?? '')

await serve({
  views: { main },
  actions: {
    add: ({ values }) => {
      const title = typeof values?.title === 'string' ? values.title.trim() : ''
      if (title === '') throw new Refusal('Give the item a title', { title: 'Required' })
      checklist.add(title)
      return [{ type: 'refresh' }, { type: 'toast', text: `Added ${title}`, tone: 'success' }]
    },
    toggle: ({ params }) => {
      checklist.toggle(idOf(params))
      return [{ type: 'refresh' }]
    },
    remove: ({ params }) => {
      checklist.remove([idOf(params)])
      return [{ type: 'refresh' }]
    },
  },
  canvas: {
    board: ({ event }) => {
      switch (event.type) {
        case 'moved':
          checklist.place(event.items)
          return {}
        case 'activated': {
          const item = checklist.toggle(event.item)
          const index = checklist.items.findIndex((found) => found.id === event.item)
          return {
            ops: item === undefined ? [] : [{ type: 'upsert', item: node(item, index) }],
            actions: [{ type: 'refresh' }],
          }
        }
        case 'deleted':
          checklist.remove(event.items)
          return { ops: [{ type: 'remove', ids: event.items }], actions: [{ type: 'refresh' }] }
        default:
          return {}
      }
    },
  },
  tools: {
    add_item: async ({ title }) => {
      if (typeof title !== 'string' || title.trim() === '') throw new Error('title must be a non-empty string')
      const item = checklist.add(title.trim())
      await rh.viewsChanged(['main'])
      return `Added "${item.title}" to the checklist; ${checklist.open} open.`
    },
  },
  events: {
    'session.placed': async ({ sessionId, topicId, by }, delivery) => {
      checklist.filed({ sessionId, topicId, by, at: delivery.at })
      await rh.viewsChanged(['main'])
    },
  },
})
