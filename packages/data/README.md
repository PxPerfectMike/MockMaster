# @mockmaster/data

> Data factories and fake data generation for mock-master

Part of the [mock-master](https://github.com/PxPerfectMike/MockMaster) monorepo.

## Installation

```bash
npm install @mockmaster/data
```

## Features

- **Factory System** - Define reusable data factories with sequences
- **Faker.js Integration** - Generate realistic fake data
- **Type Safe** - Full TypeScript support with type inference
- **Functional API** - Pure functions, immutable data

## Usage

### Define a Factory

```typescript
import { defineFactory, build, fake } from '@mockmaster/data'

const userFactory = defineFactory('user', {
  id: (ctx) => ctx.sequence('user'),
  name: () => fake.person.fullName(),
  email: () => fake.internet.email(),
  role: () => fake.helpers.arrayElement(['admin', 'user', 'guest']),
})
```

### Build Data

```typescript
// Generate with defaults
const user1 = build(userFactory)
// { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user' }

const user2 = build(userFactory)
// { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'admin' }

// Override specific fields
const admin = build(userFactory, { overrides: { role: 'admin' } })
// { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'admin' }
```

### Build Multiple

```typescript
import { buildList } from '@mockmaster/data'

const users = buildList(userFactory, 10)
// Array of 10 users with sequential IDs
```

### Reset Sequences

```typescript
import { resetSequences } from '@mockmaster/data'

// Reset all sequences (useful in test setup)
resetSequences()

const user = build(userFactory)
// { id: 1, ... } - starts from 1 again
```

## API

### `defineFactory<T>(name: string, definition: FactoryDefinition<T>): Factory<T>`

Defines a reusable factory for generating test data.

### `build<T>(factory: Factory<T>, options?: BuildOptions<T>): T`

Builds a single instance from a factory.

### `buildList<T>(factory: Factory<T>, count: number, options?: BuildOptions<T>): T[]`

Builds multiple instances from a factory.

### `resetSequences(): void`

Resets all sequence counters to 1.

### `fake`

Re-exported Faker.js instance for generating realistic data:
- `fake.person.fullName()`
- `fake.internet.email()`
- `fake.datatype.number()`
- `fake.helpers.arrayElement(array)`
- And many more!

## Examples

### Complex Factory

```typescript
const postFactory = defineFactory('post', {
  id: (ctx) => ctx.sequence('post'),
  title: () => fake.lorem.sentence(),
  body: () => fake.lorem.paragraphs(3),
  authorId: () => fake.datatype.number({ min: 1, max: 100 }),
  tags: () => fake.helpers.arrayElements(['typescript', 'testing', 'mocking'], 2),
  createdAt: () => fake.date.past(),
})
```

### Use in Tests

```typescript
import { describe, it, beforeEach } from 'vitest'
import { resetSequences } from '@mockmaster/data'

describe('User API', () => {
  beforeEach(() => {
    resetSequences() // Reset for deterministic tests
  })

  it('should create user', () => {
    const user = build(userFactory, { overrides: { role: 'admin' } })
    // Test with generated user...
  })
})
```

## Links

- [Main Documentation](https://github.com/PxPerfectMike/MockMaster)
- [Faker.js Documentation](https://fakerjs.dev/)
- [npm Organization](https://www.npmjs.com/org/mockmaster)

## License

MIT
