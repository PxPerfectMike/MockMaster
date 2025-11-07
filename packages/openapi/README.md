# @mockmaster/openapi

> OpenAPI 3.0 parsing and mock data generation for mock-master

Part of the [mock-master](https://github.com/yourusername/mock-master) monorepo.

## Installation

```bash
npm install @mockmaster/openapi
```

## Features

- **OpenAPI 3.0 Support** - Parse JSON and YAML specifications
- **$ref Resolution** - Automatic reference resolution with circular detection
- **Mock Data Generation** - Generate realistic mock data from schemas
- **Type Safe** - Full TypeScript support
- **Format Support** - Email, UUID, date-time, and more

## Usage

### Parse OpenAPI Specs

```typescript
import { parseYaml, parseJson, parseSpec } from '@mockmaster/openapi'

// Parse YAML
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

// Parse JSON
const spec2 = parseJson('{"openapi":"3.0.0",...}')

// Auto-detect format
const spec3 = parseSpec(content) // Detects YAML or JSON
```

### Extract Operations

```typescript
import { getAllOperations } from '@mockmaster/openapi'

const operations = getAllOperations(spec)
// [
//   { path: '/users', method: 'get', operation: {...} },
//   { path: '/users', method: 'post', operation: {...} },
//   { path: '/users/{id}', method: 'get', operation: {...} }
// ]
```

### Generate Mock Data from Schema

```typescript
import { generateFromSchema } from '@mockmaster/openapi'

const mockData = generateFromSchema({
  type: 'object',
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
    email: { type: 'string', format: 'email' },
    age: { type: 'integer', minimum: 18, maximum: 100 },
    role: { type: 'string', enum: ['admin', 'user'] },
  },
})

console.log(mockData)
// {
//   id: 42,
//   name: 'John Doe',
//   email: 'john@example.com',
//   age: 25,
//   role: 'admin'
// }
```

### Resolve $ref References

```typescript
import { resolveAllRefs } from '@mockmaster/openapi'

const schema = {
  $ref: '#/components/schemas/User',
}

const resolved = resolveAllRefs(spec, schema)
// Returns the actual User schema with all nested refs resolved
```

## API

### Parsing

- `parseYaml(yaml: string): OpenAPISpec` - Parse YAML specification
- `parseJson(json: string): OpenAPISpec` - Parse JSON specification
- `parseSpec(content: string): OpenAPISpec` - Auto-detect and parse

### Operations

- `getAllOperations(spec: OpenAPISpec): Operation[]` - Extract all API operations

### Schema Generation

- `generateFromSchema(schema: Schema): any` - Generate mock data from schema
- Supports: primitives, objects, arrays, enums, formats (email, uuid, date-time, etc.)

### References

- `resolveRef(spec: OpenAPISpec, ref: string): unknown` - Resolve a single $ref
- `resolveAllRefs(spec: OpenAPISpec, schema: Schema): Schema` - Resolve all nested $refs

## Supported Schema Types

- **Primitives**: string, number, integer, boolean
- **Formats**: email, uuid, date, date-time, uri, hostname
- **Complex**: object, array
- **Constraints**: enum, minimum, maximum, minLength, maxLength
- **References**: $ref with circular detection

## Example: Full Workflow

```typescript
import { parseYaml, getAllOperations, generateFromSchema } from '@mockmaster/openapi'

// 1. Parse spec
const spec = parseYaml(yamlContent)

// 2. Get operations
const operations = getAllOperations(spec)

// 3. Generate mock for each operation
operations.forEach((op) => {
  const response = op.operation.responses['200']
  const schema = response?.content?.['application/json']?.schema

  if (schema) {
    const mockData = generateFromSchema(schema)
    console.log(`${op.method.toUpperCase()} ${op.path}:`, mockData)
  }
})
```

## Links

- [Main Documentation](https://github.com/yourusername/mock-master)
- [OpenAPI Specification](https://swagger.io/specification/)
- [npm Organization](https://www.npmjs.com/org/mockmaster)

## License

MIT
