# MockMaster 🎭

> Type-safe API mocking with record & replay. Fully deterministic.

[![Tests](https://img.shields.io/badge/tests-184%20passing-brightgreen)](https://github.com/PxPerfectMike/MockMaster) [![Coverage](https://img.shields.io/badge/coverage-90%25-brightgreen)](https://github.com/PxPerfectMike/MockMaster) [![TypeScript](https://img.shields.io/badge/typescript-5.3-blue)](https://github.com/PxPerfectMike/MockMaster) [![License](https://img.shields.io/badge/license-MIT-blue)](https://github.com/PxPerfectMike/MockMaster)

**mockmaster** lets you capture real API responses and replay them deterministically. Perfect for testing, offline development, and reliable demos.

## Why mockmaster?

- **🔒 Type Safe** - Full TypeScript support with strict typing
- **🎬 Record & Replay** - Capture production API responses once, replay forever
- **📝 OpenAPI Integration** - Generate mocks from OpenAPI 3.0 specs (JSON & YAML)
- **🏭 Realistic Data** - Built-in factories with Faker.js for authentic test data
- **💾 Version Control** - Store scenarios as JSON, commit with your code
- **🧪 Framework Agnostic** - Works with Vitest, Jest, Playwright, any test framework

## Quick Start

```bash
npm install @mockmaster/openapi @mockmaster/cli @mockmaster/msw-adapter
```

```typescript
import { parseYaml } from '@mockmaster/openapi'
import { generateScenariosFromSpec, writeScenario } from '@mockmaster/cli'
import { createReplayHandler } from '@mockmaster/msw-adapter'

// 1. Parse your OpenAPI spec
const spec = parseYaml(`
openapi: 3.0.0
info:
  title: User API
  version: 1.0.0
paths:
  /users:
    get:
      responses:
        '200':
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    id: { type: integer }
                    name: { type: string }
                    email: { type: string, format: email }
`)

// 2. Generate scenarios with realistic mock data
const scenarios = generateScenariosFromSpec(spec, 'user-api')

// 3. Save to disk (commit these with your tests!)
await writeScenario('./scenarios', scenarios[0])

// 4. Replay in your tests
const handler = createReplayHandler(scenarios[0])
const response = handler({ method: 'GET', path: '/users' })
console.log(response.body) // Array of users with realistic data
```

## Use Cases

- **Testing** - Deterministic API responses for reliable tests
- **Offline Development** - Work without network access
- **CI/CD** - Fast tests that don't hit real APIs
- **Storybook** - Develop UI components with realistic data
- **Demos** - Present apps without backend dependencies
- **Contract Testing** - Validate against OpenAPI specs

## Packages

| Package                    | Description                   |
| -------------------------- | ----------------------------- |
| `@mockmaster/core`        | Path matching & HTTP routing  |
| `@mockmaster/data`        | Factories & Faker integration |
| `@mockmaster/openapi`     | OpenAPI parsing & generation  |
| `@mockmaster/msw-adapter` | Record & replay engine        |
| `@mockmaster/cli`         | File system operations        |

## Examples

### Record & Replay

```typescript
import { createScenario, createRecording, addRecordingToScenario } from '@mockmaster/msw-adapter'
import { writeScenario, readScenario } from '@mockmaster/cli'

// Create a scenario
let scenario = createScenario('my-api', 'Production responses')

// Add recorded responses
const recording = createRecording(
  { method: 'GET', url: 'https://api.example.com/users', path: '/users', timestamp: Date.now() },
  { status: 200, body: [{ id: 1, name: 'John' }], timestamp: Date.now() }
)
scenario = addRecordingToScenario(scenario, recording)

// Save to disk
await writeScenario('./scenarios', scenario)

// Later, load and replay
const loaded = await readScenario('./scenarios', 'my-api')
const handler = createReplayHandler(loaded)
const response = handler({ method: 'GET', path: '/users' })
```

### Factory System

```typescript
import { defineFactory, build, fake } from '@mockmaster/data'

// Define a factory
const userFactory = defineFactory('user', {
  id: (ctx) => ctx.sequence('user'),
  name: () => fake.person.fullName(),
  email: () => fake.internet.email(),
  role: () => fake.helpers.arrayElement(['admin', 'user']),
})

// Generate test data
const user1 = build(userFactory) // { id: 1, name: 'John Doe', ... }
const user2 = build(userFactory) // { id: 2, name: 'Jane Smith', ... }

// Override specific fields
const admin = build(userFactory, { overrides: { role: 'admin' } })
```

### OpenAPI Integration

```typescript
import { parseSpec, getAllOperations, generateFromSchema } from '@mockmaster/openapi'

const spec = parseSpec(yourOpenAPISpec)

// Extract all API operations
const operations = getAllOperations(spec)

// Generate mock data from schema
const mockData = generateFromSchema({
  type: 'object',
  properties: {
    id: { type: 'integer' },
    email: { type: 'string', format: 'email' },
  },
})
```

## Development

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Build packages
pnpm build
```

## Roadmap

- [ ] MSW browser/Node.js integration
- [ ] Interactive CLI commands
- [ ] Middleware system
- [ ] Plugin architecture
- [ ] Visual UI dashboard
- [ ] GraphQL support

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT © [PxPerfectMike](https://github.com/PxPerfectMike)
