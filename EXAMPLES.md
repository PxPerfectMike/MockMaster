# mock-master Examples & Recipes

Practical examples showing how to use mock-master in real-world scenarios.

## Basic Usage Example

```typescript
import { createScenario, createRecording, createReplayHandler, addRecordingToScenario } from '@mock-master/msw-adapter'

// Create a scenario
const scenario = createScenario('simple-api', 'Basic GET request')

// Add a recording
const recording = createRecording(
  {
    method: 'GET',
    url: 'https://api.example.com/hello',
    path: '/hello',
    timestamp: Date.now()
  },
  {
    status: 200,
    body: { message: 'Hello, World!' },
    timestamp: Date.now()
  }
)

const updatedScenario = addRecordingToScenario(scenario, recording)
const handler = createReplayHandler(updatedScenario)
const response = handler({ method: 'GET', path: '/hello' })
```

## OpenAPI Integration

### Generate from YAML

```typescript
import { parseYaml } from '@mock-master/openapi'
import { generateScenariosFromSpec } from '@mock-master/cli'

const yamlSpec = parseYaml(`
openapi: 3.0.0
info:
  title: Pet Store
  version: 1.0.0
paths:
  /pets:
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
`)

const scenarios = generateScenariosFromSpec(yamlSpec, 'pet-store')
```

## Factory System

```typescript
import { defineFactory, build, fake, resetSequences } from '@mock-master/data'

const userFactory = defineFactory('user', {
  id: (ctx) => ctx.sequence('user'),
  name: () => fake.person.fullName(),
  email: () => fake.internet.email()
})

// Generate users
const user1 = build(userFactory) // { id: 1, name: '...', email: '...' }
const user2 = build(userFactory) // { id: 2, ... }

// With overrides
const admin = build(userFactory, { overrides: { name: 'Admin' } })

// Reset for tests
resetSequences()
```

## Persistence

```typescript
import { writeScenario, readScenario, listScenarios } from '@mock-master/cli'

// Save
await writeScenario('./scenarios', scenario)

// Load
const loaded = await readScenario('./scenarios', 'my-api')

// List all
const all = await listScenarios('./scenarios')
```

## Testing Integration

### Vitest

```typescript
import { describe, it, expect, beforeAll } from 'vitest'
import { createReplayHandler } from '@mock-master/msw-adapter'
import { readScenario } from '@mock-master/cli'

describe('API Client', () => {
  let handler

  beforeAll(async () => {
    const scenario = await readScenario('./scenarios', 'test')
    handler = createReplayHandler(scenario)
  })

  it('should fetch data', () => {
    const response = handler({ method: 'GET', path: '/data' })
    expect(response.status).toBe(200)
  })
})
```

## Best Practices

1. Version control your scenarios
2. Separate scenarios per feature
3. Use factories for dynamic data
4. Reset sequences in test setup
5. Document your scenarios
6. Keep scenarios small and focused

---

**More examples in the integration tests!**
