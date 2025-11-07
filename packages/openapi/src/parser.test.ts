import { describe, it, expect } from 'vitest'
import { parseSpec, parseYaml, parseJson } from './parser'
import type { OpenAPISpec } from './types'

describe('parseYaml', () => {
  it('should parse valid YAML OpenAPI spec', () => {
    const yaml = `
openapi: 3.0.0
info:
  title: Test API
  version: 1.0.0
paths:
  /users:
    get:
      summary: Get users
      responses:
        '200':
          description: Success
    `

    const result = parseYaml(yaml)

    expect(result.openapi).toBe('3.0.0')
    expect(result.info.title).toBe('Test API')
    expect(result.info.version).toBe('1.0.0')
    expect(result.paths['/users']).toBeDefined()
  })

  it('should parse YAML with components', () => {
    const yaml = `
openapi: 3.0.0
info:
  title: Test API
  version: 1.0.0
paths: {}
components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
    `

    const result = parseYaml(yaml)

    expect(result.components).toBeDefined()
    expect(result.components?.schemas?.User).toBeDefined()
    expect(result.components?.schemas?.User.type).toBe('object')
  })

  it('should throw error for invalid YAML', () => {
    const invalidYaml = `
    this is not valid: yaml: structure:
      - bad
      - indentation
    without proper: [nesting
    `

    expect(() => parseYaml(invalidYaml)).toThrow()
  })

  it('should handle empty paths', () => {
    const yaml = `
openapi: 3.0.0
info:
  title: Empty API
  version: 1.0.0
paths: {}
    `

    const result = parseYaml(yaml)

    expect(result.paths).toEqual({})
  })
})

describe('parseJson', () => {
  it('should parse valid JSON OpenAPI spec', () => {
    const json = JSON.stringify({
      openapi: '3.0.0',
      info: {
        title: 'Test API',
        version: '1.0.0',
      },
      paths: {
        '/users': {
          get: {
            summary: 'Get users',
            responses: {
              '200': {
                description: 'Success',
              },
            },
          },
        },
      },
    })

    const result = parseJson(json)

    expect(result.openapi).toBe('3.0.0')
    expect(result.info.title).toBe('Test API')
    expect(result.paths['/users']).toBeDefined()
  })

  it('should parse JSON with nested structures', () => {
    const spec = {
      openapi: '3.0.0',
      info: { title: 'API', version: '1.0.0' },
      paths: {
        '/users/{id}': {
          get: {
            parameters: [
              {
                name: 'id',
                in: 'path' as const,
                required: true,
                schema: { type: 'integer' as const },
              },
            ],
            responses: {
              '200': {
                description: 'User found',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object' as const,
                      properties: {
                        id: { type: 'integer' as const },
                        name: { type: 'string' as const },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    }

    const result = parseJson(JSON.stringify(spec))

    expect(result.paths['/users/{id}'].get?.parameters).toBeDefined()
    expect(result.paths['/users/{id}'].get?.parameters?.[0].name).toBe('id')
  })

  it('should throw error for invalid JSON', () => {
    const invalidJson = '{ this is not valid json }'

    expect(() => parseJson(invalidJson)).toThrow()
  })
})

describe('parseSpec', () => {
  it('should detect and parse YAML spec', () => {
    const yaml = `
openapi: 3.0.0
info:
  title: YAML API
  version: 1.0.0
paths: {}
    `

    const result = parseSpec(yaml)

    expect(result.info.title).toBe('YAML API')
  })

  it('should detect and parse JSON spec', () => {
    const json = JSON.stringify({
      openapi: '3.0.0',
      info: { title: 'JSON API', version: '1.0.0' },
      paths: {},
    })

    const result = parseSpec(json)

    expect(result.info.title).toBe('JSON API')
  })

  it('should handle spec with servers', () => {
    const spec = {
      openapi: '3.0.0',
      info: { title: 'API', version: '1.0.0' },
      servers: [
        { url: 'https://api.example.com', description: 'Production' },
        { url: 'https://staging.example.com', description: 'Staging' },
      ],
      paths: {},
    }

    const result = parseSpec(JSON.stringify(spec))

    expect(result.servers).toHaveLength(2)
    expect(result.servers?.[0].url).toBe('https://api.example.com')
  })

  it('should preserve all path methods', () => {
    const spec = {
      openapi: '3.0.0',
      info: { title: 'API', version: '1.0.0' },
      paths: {
        '/resource': {
          get: { responses: { '200': { description: 'OK' } } },
          post: { responses: { '201': { description: 'Created' } } },
          put: { responses: { '200': { description: 'Updated' } } },
          delete: { responses: { '204': { description: 'Deleted' } } },
          patch: { responses: { '200': { description: 'Patched' } } },
        },
      },
    }

    const result = parseSpec(JSON.stringify(spec))
    const resourcePath = result.paths['/resource']

    expect(resourcePath.get).toBeDefined()
    expect(resourcePath.post).toBeDefined()
    expect(resourcePath.put).toBeDefined()
    expect(resourcePath.delete).toBeDefined()
    expect(resourcePath.patch).toBeDefined()
  })
})
