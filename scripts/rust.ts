type Json = null | boolean | number | string | Json[] | { [key: string]: Json }
type Node = { [key: string]: Json }

type Field = { json: string; rust: string; type: string; attrs: string[] }
type Variant = { value: string; name: string; fields: Field[] }
type Item =
  | { kind: 'alias'; name: string; target: string }
  | { kind: 'struct'; name: string; fields: Field[]; deny: boolean }
  | { kind: 'enum'; name: string; values: string[] }
  | { kind: 'tagged'; name: string; tag: string; variants: Variant[]; deny: boolean }
  | { kind: 'untagged'; name: string; variants: { name: string; type: string }[] }
type Shape = { rust: string; nullable: boolean; kind: 'bool' | 'vec' | 'map' | 'other' }

export const RUST_ROOTS = [
  'PluginManifest',
  'View',
  'ViewRequest',
  'ViewActionRequest',
  'ViewActionResult',
  'ViewActionRefusal',
  'CanvasEventRequest',
  'CanvasResponse',
  'PluginToolCall',
  'PluginToolResult',
  'PluginEventDelivery',
  'PluginJobRequest',
  'PluginJobResult',
  'PluginSelf',
  'PluginViewsChanged',
  'PluginNotify',
  'GatewayError',
]

const KEYWORDS = new Set(
  'as async await break const continue crate dyn else enum extern false fn for gen if impl in let loop match mod move mut pub ref return self static struct super trait true try type unsafe use where while yield'.split(
    ' ',
  ),
)
const INTEGERS: Record<string, string> = {
  int8: 'i8',
  int16: 'i16',
  int32: 'i32',
  int64: 'i64',
  uint8: 'u8',
  uint16: 'u16',
  uint32: 'u32',
  uint64: 'u64',
}
const DEFAULTABLE = new Set(['String', 'bool', 'f64', 'JsonObject', ...Object.values(INTEGERS)])

const isNode = (value: Json | undefined): value is Node =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

function unsupported(at: string, schema: Json | undefined): never {
  throw new Error(`${at}: no Rust mapping for ${JSON.stringify(schema)}`)
}

function refName(ref: Json | undefined, at: string): string {
  if (typeof ref !== 'string' || !ref.startsWith('#/$defs/')) unsupported(at, ref)
  return ref.slice('#/$defs/'.length)
}

const pascal = (value: string): string => {
  const name = value
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
  return /^[0-9]/.test(name) ? `V${name}` : name
}

const snake = (json: string): string => {
  const name = json
    .replace(/^\$/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .toLowerCase()
  return KEYWORDS.has(name) ? `r#${name}` : name
}

function references(schema: Json, found: string[]): void {
  if (Array.isArray(schema)) {
    for (const item of schema) references(item, found)
  } else if (isNode(schema)) {
    for (const [key, value] of Object.entries(schema)) {
      if (key === '$ref') found.push(refName(value, key))
      else references(value, found)
    }
  }
}

function reachable(defs: Node, roots: string[]): string[] {
  const kept = new Set<string>()
  const pending = [...roots]
  for (let name = pending.pop(); name !== undefined; name = pending.pop()) {
    if (kept.has(name)) continue
    const schema = defs[name]
    if (schema === undefined) throw new Error(`the contract has no definition ${name}`)
    kept.add(name)
    references(schema, pending)
  }
  return [...kept].sort()
}

function shape(schema: Json | undefined, at: string): Shape {
  if (!isNode(schema)) unsupported(at, schema)
  const plain = (rust: string): Shape => ({ rust, nullable: false, kind: 'other' })
  if (schema.$ref !== undefined) return plain(refName(schema.$ref, at))
  if (Array.isArray(schema.anyOf)) {
    const present = schema.anyOf.filter((branch) => !(isNode(branch) && branch.type === 'null'))
    if (present.length !== 1 || schema.anyOf.length !== 2) unsupported(at, schema)
    return { ...shape(present[0], at), nullable: true }
  }
  if (Array.isArray(schema.type)) {
    const present = schema.type.filter((type) => type !== 'null')
    if (present.length !== 1 || schema.type.length !== 2) unsupported(at, schema)
    return { ...shape({ ...schema, type: present[0] ?? null }, at), nullable: true }
  }
  switch (schema.type) {
    case 'string':
      return plain('String')
    case 'boolean':
      return { rust: 'bool', nullable: false, kind: 'bool' }
    case 'number':
      return plain('f64')
    case 'integer': {
      const rust = INTEGERS[typeof schema.format === 'string' ? schema.format : 'int64']
      if (rust === undefined) unsupported(at, schema)
      return plain(rust)
    }
    case 'array': {
      const item = shape(schema.items, `${at}[]`)
      return { rust: `Vec<${item.nullable ? `Option<${item.rust}>` : item.rust}>`, nullable: false, kind: 'vec' }
    }
    case 'object': {
      if (schema.properties !== undefined) unsupported(at, schema)
      if (schema.additionalProperties === true) return plain('JsonObject')
      const value = shape(schema.additionalProperties, `${at}{}`)
      const rust = value.nullable ? `Option<${value.rust}>` : value.rust
      return { rust: `BTreeMap<String, ${rust}>`, nullable: false, kind: 'map' }
    }
    default:
      return unsupported(at, schema)
  }
}

function fields(schema: Node, at: string, skip?: string): Field[] {
  const properties = isNode(schema.properties) ? schema.properties : {}
  const required = new Set(Array.isArray(schema.required) ? schema.required : [])
  return Object.entries(properties)
    .filter(([json]) => json !== skip)
    .map(([json, property]) => {
      const where = `${at}.${json}`
      const found = shape(property, where)
      const rust = snake(json)
      const attrs = rust.replace(/^r#/, '') === json ? [] : [`rename = "${json}"`]
      let type = found.rust
      if (found.nullable) {
        type = `Option<${found.rust}>`
        if (!required.has(json)) attrs.push('skip_serializing_if = "Option::is_none"')
      } else if (!required.has(json)) {
        if (found.kind === 'bool') attrs.push('default', 'skip_serializing_if = "std::ops::Not::not"')
        else if (found.kind === 'vec') attrs.push('default', 'skip_serializing_if = "Vec::is_empty"')
        else if (found.kind === 'map') attrs.push('default', 'skip_serializing_if = "BTreeMap::is_empty"')
        else if (isNode(property) && property.default !== undefined) attrs.push('default')
        else {
          type = `Option<${found.rust}>`
          attrs.push('skip_serializing_if = "Option::is_none"')
        }
      }
      return { json, rust, type, attrs }
    })
}

function untaggedName(branch: Json, at: string): string {
  if (!isNode(branch)) unsupported(at, branch)
  if (branch.$ref !== undefined) return refName(branch.$ref, at)
  if (branch.type === 'boolean') return 'Bool'
  if (branch.type === 'number') return 'Number'
  if (branch.type === 'integer') return 'Integer'
  if (branch.type === 'string') return 'Text'
  if (branch.type === 'array' && isNode(branch.items)) {
    if (branch.items.type === 'string') return 'List'
    const words = refName(branch.items.$ref, at).match(/[A-Z][a-z0-9]*/g) ?? []
    return `${words.at(-1) ?? ''}s`
  }
  return unsupported(at, branch)
}

function item(name: string, schema: Json | undefined): Item {
  if (!isNode(schema)) unsupported(name, schema)
  if (Array.isArray(schema.oneOf)) {
    const branches = schema.oneOf.map((branch) => (isNode(branch) ? branch : unsupported(name, branch)))
    const tags = branches.map((branch) =>
      Object.entries(isNode(branch.properties) ? branch.properties : {}).find(
        ([, property]) => isNode(property) && typeof property.const === 'string',
      ),
    )
    const tag = tags[0]?.[0]
    if (tag === undefined || tags.some((found) => found?.[0] !== tag)) unsupported(name, schema)
    const variants = branches.map((branch, index) => {
      const found = tags[index]?.[1]
      const value = isNode(found) && typeof found.const === 'string' ? found.const : unsupported(name, branch)
      return { value, name: pascal(value), fields: fields(branch, `${name}.${value}`, tag) }
    })
    return { kind: 'tagged', name, tag, variants, deny: branches.every((b) => b.additionalProperties === false) }
  }
  if (Array.isArray(schema.anyOf)) {
    const variants = schema.anyOf.map((branch, index) => ({
      name: untaggedName(branch, `${name}.anyOf[${index}]`),
      type: shape(branch, `${name}.anyOf[${index}]`).rust,
    }))
    if (new Set(variants.map((variant) => variant.name)).size !== variants.length) unsupported(name, schema)
    return { kind: 'untagged', name, variants }
  }
  if (schema.type === 'string' && Array.isArray(schema.enum)) {
    return { kind: 'enum', name, values: schema.enum.map((value) => String(value)) }
  }
  if (schema.type === 'object' && isNode(schema.properties)) {
    return { kind: 'struct', name, fields: fields(schema, name), deny: schema.additionalProperties === false }
  }
  return { kind: 'alias', name, target: shape(schema, name).rust }
}

function defaults(items: Map<string, Item>): Set<string> {
  const known = new Map<string, boolean>()
  const defaultable = (type: string): boolean => {
    if (DEFAULTABLE.has(type) || /^(Option|Vec|BTreeMap)</.test(type)) return true
    const found = items.get(type)
    if (found === undefined || known.get(type) === false) return false
    if (known.has(type)) return known.get(type) === true
    known.set(type, false)
    const result =
      found.kind === 'alias'
        ? defaultable(found.target)
        : found.kind === 'struct' && found.fields.every((field) => defaultable(field.type))
    known.set(type, result)
    return result
  }
  return new Set([...items.keys()].filter((name) => items.get(name)?.kind === 'struct' && defaultable(name)))
}

function fieldLines(field: Field, indent: string, visibility: string): string[] {
  const attrs = field.attrs.length > 0 ? [`${indent}#[serde(${field.attrs.join(', ')})]`] : []
  return [...attrs, `${indent}${visibility}${field.rust}: ${field.type},`]
}

function render(item: Item, defaultable: Set<string>): string[] {
  const derive = (extra: string[]) =>
    `#[derive(${['Debug', 'Clone', ...extra, 'Serialize', 'Deserialize'].join(', ')})]`
  switch (item.kind) {
    case 'alias':
      return [`pub type ${item.name} = ${item.target};`]
    case 'struct':
      return [
        derive(defaultable.has(item.name) ? ['Default', 'PartialEq'] : ['PartialEq']),
        ...(item.deny ? ['#[serde(deny_unknown_fields)]'] : []),
        `pub struct ${item.name} {`,
        ...item.fields.flatMap((field) => fieldLines(field, '    ', 'pub ')),
        '}',
      ]
    case 'enum':
      return [
        derive(['Copy', 'PartialEq', 'Eq', 'Hash']),
        `pub enum ${item.name} {`,
        ...item.values.flatMap((value) => [`    #[serde(rename = "${value}")]`, `    ${pascal(value)},`]),
        '}',
      ]
    case 'tagged':
      return [
        derive(['PartialEq']),
        `#[serde(tag = "${item.tag}"${item.deny ? ', deny_unknown_fields' : ''})]`,
        `pub enum ${item.name} {`,
        ...item.variants.flatMap((variant) => [
          `    #[serde(rename = "${variant.value}")]`,
          ...(variant.fields.length === 0
            ? [`    ${variant.name},`]
            : [
                `    ${variant.name} {`,
                ...variant.fields.flatMap((field) => fieldLines(field, '        ', '')),
                '    },',
              ]),
        ]),
        '}',
      ]
    case 'untagged':
      return [
        derive(['PartialEq']),
        '#[serde(untagged)]',
        `pub enum ${item.name} {`,
        ...item.variants.map((variant) => `    ${variant.name}(${variant.type}),`),
        '}',
      ]
  }
}

export function rustContract(schema: Json, banner: string): string {
  const defs = isNode(schema) && isNode(schema.$defs) ? schema.$defs : unsupported('$defs', schema)
  const items = new Map(reachable(defs, RUST_ROOTS).map((name) => [name, item(name, defs[name])]))
  const defaultable = defaults(items)
  const body = [...items.values()].map((found) => render(found, defaultable).join('\n'))
  const usesMap = body.some((text) => text.includes('BTreeMap<'))
  return [
    `// ${banner}`,
    '',
    ...(usesMap ? ['use std::collections::BTreeMap;', ''] : []),
    'use serde::{Deserialize, Serialize};',
    '',
    'pub type JsonObject = serde_json::Map<String, serde_json::Value>;',
    '',
    body.join('\n\n'),
    '',
  ].join('\n')
}
