# @mockmaster/core

> Core mocking engine for mock-master - Path matching and HTTP routing

Part of the [mock-master](https://github.com/PxPerfectMike/MockMaster) monorepo.

## Installation

```bash
npm install @mockmaster/core
```

## Features

- **Path Matching** - Exact paths, parameters (`:id`), and wildcards (`*`)
- **HTTP Methods** - GET, POST, PUT, DELETE, PATCH, and more
- **Type Safe** - Full TypeScript support with strict typing
- **Zero Dependencies** - Lightweight and fast

## Usage

### Path Matching

```typescript
import { matchPath } from '@mockmaster/core'

// Exact match
matchPath('/users', '/users') // true
matchPath('/users', '/posts') // false

// Parameter matching
matchPath('/users/:id', '/users/123') // true
matchPath('/users/:id', '/users/abc') // true

// Wildcard matching
matchPath('/api/*', '/api/users') // true
matchPath('/api/*', '/api/users/123') // true
```

### Mock Matching

```typescript
import { createMock, findMatchingMock } from '@mockmaster/core'

const mocks = [
  createMock('/users', 'GET', { users: [] }),
  createMock('/users/:id', 'GET', { id: 1, name: 'John' }),
]

// Find matching mock
const mock = findMatchingMock(mocks, '/users/123', 'GET')
console.log(mock?.response) // { id: 1, name: 'John' }
```

## API

### `matchPath(pattern: string, path: string): boolean`

Matches a URL path against a pattern.

**Patterns:**
- Exact: `/users`
- Parameters: `/users/:id` (matches any value)
- Wildcards: `/api/*` (matches any path after `/api/`)

### `matchMethod(pattern: string, method: string): boolean`

Matches an HTTP method (case-insensitive).

### `createMock<T>(path: string, method: string, response: T): Mock<T>`

Creates a mock object with path, method, and response.

### `findMatchingMock<T>(mocks: Mock<T>[], path: string, method: string): Mock<T> | undefined`

Finds the first mock matching the given path and method.

### `extractParams(pattern: string, path: string): Record<string, string> | null`

Extracts parameter values from a path.

```typescript
import { extractParams } from '@mockmaster/core'

const params = extractParams('/users/:id', '/users/123')
// { id: '123' }

const params2 = extractParams('/users/:userId/posts/:postId', '/users/1/posts/42')
// { userId: '1', postId: '42' }
```

### `createMatcher(patterns: string[]): (path: string) => boolean`

Creates a matcher function from multiple patterns.

```typescript
import { createMatcher } from '@mockmaster/core'

const matcher = createMatcher(['/api/*', '/users/:id'])

matcher('/api/users')    // true
matcher('/users/123')    // true
matcher('/posts/456')    // false
```

## Links

- [Main Documentation](https://github.com/PxPerfectMike/MockMaster)
- [npm Organization](https://www.npmjs.com/org/mockmaster)
- [Report Issues](https://github.com/PxPerfectMike/MockMaster/issues)

## License

MIT
