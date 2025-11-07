# @mockmaster/cli

> File system operations and OpenAPI scenario generation for mock-master

Part of the [mock-master](https://github.com/PxPerfectMike/MockMaster) monorepo.

## Installation

```bash
npm install @mockmaster/cli
```

## Features

- **File System Operations** - Save and load scenarios to/from disk
- **OpenAPI Integration** - Generate scenarios from OpenAPI specifications
- **Scenario Management** - List, read, write, and delete scenarios
- **Type Safe** - Full TypeScript support

## Usage

### Generate Scenarios from OpenAPI

```typescript
import { generateScenariosFromSpec } from '@mockmaster/cli'
import { parseYaml } from '@mockmaster/openapi'

// Parse your OpenAPI spec
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

// Generate scenarios with realistic mock data
const scenarios = generateScenariosFromSpec(spec, 'user-api')

console.log(scenarios[0])
// Scenario with recordings for each endpoint
```

### Save Scenarios to Disk

```typescript
import { writeScenario } from '@mockmaster/cli'

// Save scenario to ./scenarios/user-api.json
await writeScenario('./scenarios', scenario)
```

### Load Scenarios from Disk

```typescript
import { readScenario } from '@mockmaster/cli'

// Load scenario from disk
const scenario = await readScenario('./scenarios', 'user-api')

if (scenario) {
  console.log('Loaded:', scenario.name)
  console.log('Recordings:', scenario.recordings.length)
}
```

### List All Scenarios

```typescript
import { listScenarios } from '@mockmaster/cli'

// List all scenarios in directory
const allScenarios = await listScenarios('./scenarios')

allScenarios.forEach((s) => {
  console.log(`${s.name}: ${s.recordings.length} recordings`)
})
```

### Delete a Scenario

```typescript
import { deleteScenario } from '@mockmaster/cli'

// Delete scenario file
await deleteScenario('./scenarios', 'user-api')
```

## API

### Generation

- `generateScenariosFromSpec(spec: OpenAPISpec, scenarioName: string): Scenario[]` - Generate scenarios from OpenAPI spec with realistic mock data

### File Operations

- `writeScenario(directory: string, scenario: Scenario): Promise<void>` - Write scenario to disk as JSON
- `readScenario(directory: string, name: string): Promise<Scenario | null>` - Read scenario from disk
- `listScenarios(directory: string): Promise<Scenario[]>` - List all scenarios in directory
- `deleteScenario(directory: string, name: string): Promise<void>` - Delete scenario file

## Complete Workflow Example

```typescript
import { parseYaml } from '@mockmaster/openapi'
import { generateScenariosFromSpec, writeScenario, readScenario } from '@mockmaster/cli'
import { createReplayHandler } from '@mockmaster/msw-adapter'

// 1. Parse OpenAPI spec
const spec = parseYaml(openApiYaml)

// 2. Generate scenarios with mock data
const scenarios = generateScenariosFromSpec(spec, 'my-api')

// 3. Save to disk
await writeScenario('./scenarios', scenarios[0])

// 4. Later, load from disk
const loaded = await readScenario('./scenarios', 'my-api')

// 5. Create replay handler
if (loaded) {
  const handler = createReplayHandler(loaded)

  // 6. Use in tests
  const response = handler({ method: 'GET', path: '/users' })
  console.log(response.body)
}
```

## File Format

Scenarios are saved as JSON files:

```
./scenarios/
  ├── user-api.json
  ├── payment-api.json
  └── notification-api.json
```

Each file contains:
```json
{
  "name": "user-api",
  "description": "Generated from User API (1.0.0)",
  "recordings": [
    {
      "request": {
        "method": "GET",
        "url": "https://api.example.com/users",
        "path": "/users",
        "timestamp": 1234567890
      },
      "response": {
        "status": 200,
        "body": [...],
        "headers": {...},
        "timestamp": 1234567890
      }
    }
  ],
  "createdAt": 1234567890,
  "updatedAt": 1234567890
}
```

## Use Cases

- **Version Control** - Commit scenarios as JSON files
- **Test Fixtures** - Store test data as scenarios
- **CI/CD** - Use scenarios in automated tests
- **Team Sharing** - Share API responses across team

## Related Packages

- `@mockmaster/openapi` - OpenAPI parsing and generation
- `@mockmaster/msw-adapter` - Record & replay functionality
- `@mockmaster/data` - Factory system for generating test data

## Links

- [Main Documentation](https://github.com/PxPerfectMike/MockMaster)
- [npm Organization](https://www.npmjs.com/org/mockmaster)

## License

MIT
