# @mockmaster/msw-adapter

> Record & replay HTTP requests for deterministic testing

Part of the [mock-master](https://github.com/PxPerfectMike/MockMaster) monorepo.

## Installation

```bash
npm install @mockmaster/msw-adapter
```

## Features

- **Record & Replay** - Capture real API responses and replay them
- **Scenario Management** - Organize recordings into reusable scenarios
- **Persistence** - Serialize/deserialize scenarios as JSON
- **Type Safe** - Full TypeScript support
- **Deterministic** - Replay the same responses every time

## Usage

### Create a Scenario

```typescript
import { createScenario } from '@mockmaster/msw-adapter'

const scenario = createScenario('my-api', 'Production API responses')
```

### Record Requests

```typescript
import { createRecording, addRecordingToScenario } from '@mockmaster/msw-adapter'

// Create a recording
const recording = createRecording(
  {
    method: 'GET',
    url: 'https://api.example.com/users',
    path: '/users',
    timestamp: Date.now(),
  },
  {
    status: 200,
    body: [
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Smith' },
    ],
    headers: { 'Content-Type': 'application/json' },
    timestamp: Date.now(),
  }
)

// Add to scenario
const updatedScenario = addRecordingToScenario(scenario, recording)
```

### Replay Requests

```typescript
import { createReplayHandler } from '@mockmaster/msw-adapter'

// Create replay handler
const handler = createReplayHandler(scenario)

// Replay a request
const response = handler({ method: 'GET', path: '/users' })

console.log(response)
// {
//   status: 200,
//   body: [{ id: 1, name: 'John Doe' }, { id: 2, name: 'Jane Smith' }],
//   headers: { 'Content-Type': 'application/json' }
// }
```

### Persist Scenarios

```typescript
import { serializeScenario, deserializeScenario } from '@mockmaster/msw-adapter'

// Serialize to JSON string
const json = serializeScenario(scenario)

// Save to file (use with @mockmaster/cli or fs)
// await writeFile('scenario.json', json)

// Deserialize from JSON
const loaded = deserializeScenario(json)
```

## API

### Scenario Management

- `createScenario(name: string, description?: string): Scenario` - Create a new scenario
- `addRecordingToScenario(scenario: Scenario, recording: Recording): Scenario` - Add recording to scenario

### Recording

- `createRecording(request: RecordedRequest, response: RecordedResponse): Recording` - Create a recording

### Replay

- `createReplayHandler(scenario: Scenario): ReplayHandler` - Create a replay handler
- `handler(request: { method: string, path: string }): RecordedResponse | undefined` - Replay a request

### Persistence

- `serializeScenario(scenario: Scenario): string` - Serialize to JSON
- `deserializeScenario(json: string): Scenario` - Deserialize from JSON

## Complete Example

```typescript
import {
  createScenario,
  createRecording,
  addRecordingToScenario,
  createReplayHandler,
  serializeScenario,
} from '@mockmaster/msw-adapter'

// 1. Create scenario
let scenario = createScenario('user-api', 'User management endpoints')

// 2. Add recordings
const getUsers = createRecording(
  { method: 'GET', url: 'https://api.example.com/users', path: '/users', timestamp: Date.now() },
  { status: 200, body: [{ id: 1, name: 'John' }], timestamp: Date.now() }
)

const createUser = createRecording(
  { method: 'POST', url: 'https://api.example.com/users', path: '/users', timestamp: Date.now() },
  { status: 201, body: { id: 2, name: 'Jane' }, timestamp: Date.now() }
)

scenario = addRecordingToScenario(scenario, getUsers)
scenario = addRecordingToScenario(scenario, createUser)

// 3. Save to JSON
const json = serializeScenario(scenario)
console.log('Saved:', json)

// 4. Replay later
const handler = createReplayHandler(scenario)

const response1 = handler({ method: 'GET', path: '/users' })
console.log('GET /users:', response1)

const response2 = handler({ method: 'POST', path: '/users' })
console.log('POST /users:', response2)
```

## Use Cases

- **Integration Tests** - Replay recorded API responses for consistent tests
- **Offline Development** - Work without network access
- **Contract Testing** - Verify client behavior against recorded responses
- **Demo Environments** - Present apps without live backend

## Related Packages

- `@mockmaster/cli` - File system operations for saving/loading scenarios
- `@mockmaster/openapi` - Generate scenarios from OpenAPI specs
- `@mockmaster/core` - Low-level mocking utilities

## Links

- [Main Documentation](https://github.com/PxPerfectMike/MockMaster)
- [npm Organization](https://www.npmjs.com/org/mockmaster)

## License

MIT
