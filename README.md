# rivethub-workflows

Workflows for RivetHub, and the start of its plugin system: custom parts of RivetHub that anyone can add. A plugin that
proves valuable for everyone gets promoted into the platform, with its domain moving into a
[rivethub-runtime](https://github.com/philbert440/rivethub-runtime) context and its payloads into the contract.

Workflows run outside the runtime and talk to it only through its published contract, the same way every client does.

## The contract

`contract.json` pins a runtime commit. `npm run contract` fetches that commit's `contract/sent.schema.json` and
`contract/accepted.schema.json`, vendors them under `packages/contract/schema/`, and generates the
`@rivethub/contract` types:

- `Sent`: what the runtime sends (responses, events).
- `Accepted`: what the runtime accepts (requests, capture batches).

To move to a newer runtime, set `ref` in `contract.json` to a commit on the runtime's `main`, run `npm run contract`, and
commit the schema and type diff in its own PR. If a workflow needs something the contract doesn't offer, propose the
change to the runtime first.

## Rules

- Talk to the runtime only over its HTTP and WebSocket API. Never read its database or files.
- Types come from `@rivethub/contract`. Never hand-write a DTO.
- No code comments: names and types carry the meaning.
- Conventional Commits, authored by people, with no AI attribution trailers or text.

## Checks

`npm run check` runs what CI runs: Biome lint and format, `tsc` in strict mode, the tests, the contract freshness check
and the privacy scan. Run it before every push.
