# mock-master 🎭

> Next-generation API mocking built with TypeScript, TDD, and functional programming

[![Tests](https://img.shields.io/badge/tests-175%20passing-brightgreen)]() [![Coverage](https://img.shields.io/badge/coverage-90%25-brightgreen)]() [![TypeScript](https://img.shields.io/badge/typescript-5.3-blue)]() [![License](https://img.shields.io/badge/license-MIT-blue)]()

**mock-master** is a type-safe, functional API mocking library with record & replay, OpenAPI-first design, and a powerful factory system for realistic test data.

## ✨ Features

- **🎬 Record & Replay** - Capture real API responses and replay them deterministically
- **📝 OpenAPI First** - Generate scenarios from OpenAPI 3.0 specs (JSON & YAML)
- **🔒 Type Safe** - Built with strict TypeScript, zero escape hatches
- **🧪 Framework Agnostic** - Works with Vitest, Jest, Playwright, any framework
- **⚡ Functional** - Pure functions, immutable data, composable APIs
- **🏭 Factory System** - Generate realistic test data with Faker.js
- **💾 Scenario Management** - Version control your mock scenarios as JSON
- **🎯 175 Tests** - Every feature built with TDD (Test-Driven Development)

## 🚀 Quick Start

```typescript
import { generateScenariosFromSpec } from '@mock-master/cli'
import { createReplayHandler } from '@mock-master/msw-adapter'
import { parseYaml } from '@mock-master/openapi'

// 1. Parse OpenAPI spec
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

// 3. Create replay handler
const handler = createReplayHandler(scenarios[0])

// 4. Replay requests
const response = handler({ method: 'GET', path: '/users' })
console.log(response.body) // Array of users with realistic names & emails!
```

## 📦 Packages

| Package                    | Description                   | Tests |
| -------------------------- | ----------------------------- | ----- |
| `@mock-master/core`        | Path matching & HTTP routing  | 32 ✅ |
| `@mock-master/data`        | Factories & Faker integration | 34 ✅ |
| `@mock-master/openapi`     | OpenAPI parsing & generation  | 55 ✅ |
| `@mock-master/msw-adapter` | Record & replay               | 30 ✅ |
| `@mock-master/cli`         | File system & integration     | 24 ✅ |

**Total: 175 tests passing!** 🎉

## 💡 Use Cases

- **Testing** - Consistent, deterministic mock data for reliable tests
- **Storybook** - Develop UI components with realistic API states
- **Local Dev** - Work offline or with unstable APIs
- **Demos** - Present applications without backend dependencies
- **Contract Testing** - Validate against OpenAPI specifications

## 📚 Examples

### Record & Replay Workflow

```typescript
import { createScenario, createRecording, addRecordingToScenario } from '@mock-master/msw-adapter'
import { writeScenario, readScenario } from '@mock-master/cli'

// Create scenario
let scenario = createScenario('my-api', 'Production responses')

// Add recording
const recording = createRecording(
  { method: 'GET', url: 'https://api.example.com/users', path: '/users', timestamp: Date.now() },
  { status: 200, body: [{ id: 1, name: 'John' }], timestamp: Date.now() }
)
scenario = addRecordingToScenario(scenario, recording)

// Save to disk
await writeScenario('./scenarios', scenario)

// Load and replay later
const loaded = await readScenario('./scenarios', 'my-api')
const handler = createReplayHandler(loaded)
const response = handler({ method: 'GET', path: '/users' })
```

### Factory System

```typescript
import { defineFactory, build, fake } from '@mock-master/data'

// Define factory
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
import { parseSpec, getAllOperations, generateFromSchema } from '@mock-master/openapi'

const spec = parseSpec(yourOpenAPISpecString)

// Extract all API operations
const operations = getAllOperations(spec)
// [{ path: '/users', method: 'get', operation: {...} }, ...]

// Generate mock data from schema
const mockData = generateFromSchema({
  type: 'object',
  properties: {
    id: { type: 'integer' },
    email: { type: 'string', format: 'email' },
  },
})
// { id: 42, email: 'user@example.com' }
```

## 🏗️ Architecture

Built with functional programming principles:

- **Pure Functions** - No side effects, predictable behavior
- **Immutability** - No mutations, spread operators everywhere
- **Composition** - Small, focused functions that compose beautifully
- **Type Safety** - Strict TypeScript with no `any` types

```
mock-master/
├── packages/
│   ├── core/           # Path matching & routing
│   ├── data/           # Factory system & Faker
│   ├── openapi/        # OpenAPI 3.0 parsing
│   ├── msw-adapter/    # Record & replay
│   └── cli/            # File system ops
└── 175 tests ✅
```

## 🛠️ Development

```bash
# Install dependencies
pnpm install

# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage

# Build
pnpm build
```

### Tech Stack

- **pnpm workspaces** + **Turborepo** - Monorepo management
- **TypeScript 5.3** - Strict mode
- **Vitest** - Fast, modern testing
- **Faker.js** - Realistic fake data
- **yaml** - OpenAPI YAML parsing
- **fs-extra** - File system utilities

## ✅ Roadmap

### Completed

- ✅ Core mocking engine (path matching, HTTP methods)
- ✅ Factory system with Faker.js integration
- ✅ OpenAPI 3.0 parsing (JSON & YAML)
- ✅ $ref resolution (with circular detection)
- ✅ Schema-based mock generation
- ✅ Record & replay functionality
- ✅ File system persistence
- ✅ Scenario management
- ✅ End-to-end integration
- ✅ 175 comprehensive tests

### Next

- [ ] Interactive CLI commands
- [ ] MSW browser/Node.js integration
- [ ] Middleware system
- [ ] Plugin architecture
- [ ] Visual UI dashboard
- [ ] GraphQL support

## 🤝 Contributing

Built with love and TDD! Contributions welcome.

**Guidelines:**

- Write tests first (RED → GREEN → REFACTOR)
- Use pure functions, no side effects
- Strict TypeScript, no `any` types
- Keep functions small and focused

## 📄 License

MIT

---

**Built with Test-Driven Development, functional programming, and care** ❤️
