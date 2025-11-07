import { describe, it, expect } from 'vitest'
import { extractPaths, extractOperations, extractSchemas, getAllOperations } from './extract'
import type { OpenAPISpec } from './types'

describe('extractPaths', () => {
  it('should extract all paths from spec', () => {
    const spec: OpenAPISpec = {
      openapi: '3.0.0',
      info: { title: 'API', version: '1.0.0' },
      paths: {
        '/users': {
          get: { responses: { '200': { description: 'OK' } } },
        },
        '/posts': {
          get: { responses: { '200': { description: 'OK' } } },
        },
      },
    }

    const paths = extractPaths(spec)

    expect(Object.keys(paths)).toHaveLength(2)
    expect(paths['/users']).toBeDefined()
    expect(paths['/posts']).toBeDefined()
  })

  it('should return empty object for spec with no paths', () => {
    const spec: OpenAPISpec = {
      openapi: '3.0.0',
      info: { title: 'API', version: '1.0.0' },
      paths: {},
    }

    const paths = extractPaths(spec)

    expect(paths).toEqual({})
  })

  it('should preserve all path item data', () => {
    const spec: OpenAPISpec = {
      openapi: '3.0.0',
      info: { title: 'API', version: '1.0.0' },
      paths: {
        '/users': {
          get: { responses: { '200': { description: 'OK' } } },
          post: { responses: { '201': { description: 'Created' } } },
          parameters: [{ name: 'api_key', in: 'header' }],
        },
      },
    }

    const paths = extractPaths(spec)

    expect(paths['/users'].get).toBeDefined()
    expect(paths['/users'].post).toBeDefined()
    expect(paths['/users'].parameters).toHaveLength(1)
  })
})

describe('extractOperations', () => {
  it('should extract all operations from a path', () => {
    const pathItem = {
      get: {
        operationId: 'getUsers',
        responses: { '200': { description: 'OK' } },
      },
      post: {
        operationId: 'createUser',
        responses: { '201': { description: 'Created' } },
      },
    }

    const operations = extractOperations('/users', pathItem)

    expect(operations).toHaveLength(2)
    expect(operations[0]).toEqual({
      path: '/users',
      method: 'get',
      operation: pathItem.get,
    })
    expect(operations[1]).toEqual({
      path: '/users',
      method: 'post',
      operation: pathItem.post,
    })
  })

  it('should only extract defined HTTP methods', () => {
    const pathItem = {
      get: { responses: { '200': { description: 'OK' } } },
      // No other methods defined
    }

    const operations = extractOperations('/users', pathItem)

    expect(operations).toHaveLength(1)
    expect(operations[0].method).toBe('get')
  })

  it('should handle all HTTP methods', () => {
    const pathItem = {
      get: { responses: { '200': { description: 'OK' } } },
      post: { responses: { '201': { description: 'Created' } } },
      put: { responses: { '200': { description: 'Updated' } } },
      delete: { responses: { '204': { description: 'Deleted' } } },
      patch: { responses: { '200': { description: 'Patched' } } },
      options: { responses: { '200': { description: 'Options' } } },
      head: { responses: { '200': { description: 'Head' } } },
    }

    const operations = extractOperations('/resource', pathItem)

    expect(operations).toHaveLength(7)
    const methods = operations.map((op) => op.method)
    expect(methods).toContain('get')
    expect(methods).toContain('post')
    expect(methods).toContain('put')
    expect(methods).toContain('delete')
    expect(methods).toContain('patch')
    expect(methods).toContain('options')
    expect(methods).toContain('head')
  })
})

describe('getAllOperations', () => {
  it('should extract all operations from all paths', () => {
    const spec: OpenAPISpec = {
      openapi: '3.0.0',
      info: { title: 'API', version: '1.0.0' },
      paths: {
        '/users': {
          get: { responses: { '200': { description: 'OK' } } },
          post: { responses: { '201': { description: 'Created' } } },
        },
        '/posts': {
          get: { responses: { '200': { description: 'OK' } } },
        },
      },
    }

    const operations = getAllOperations(spec)

    expect(operations).toHaveLength(3)
    expect(operations.find((op) => op.path === '/users' && op.method === 'get')).toBeDefined()
    expect(operations.find((op) => op.path === '/users' && op.method === 'post')).toBeDefined()
    expect(operations.find((op) => op.path === '/posts' && op.method === 'get')).toBeDefined()
  })

  it('should return empty array for spec with no operations', () => {
    const spec: OpenAPISpec = {
      openapi: '3.0.0',
      info: { title: 'API', version: '1.0.0' },
      paths: {},
    }

    const operations = getAllOperations(spec)

    expect(operations).toEqual([])
  })

  it('should preserve operation details', () => {
    const spec: OpenAPISpec = {
      openapi: '3.0.0',
      info: { title: 'API', version: '1.0.0' },
      paths: {
        '/users/{id}': {
          get: {
            operationId: 'getUserById',
            summary: 'Get user by ID',
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { '200': { description: 'User found' } },
          },
        },
      },
    }

    const operations = getAllOperations(spec)

    expect(operations).toHaveLength(1)
    expect(operations[0].operation.operationId).toBe('getUserById')
    expect(operations[0].operation.summary).toBe('Get user by ID')
    expect(operations[0].operation.parameters).toHaveLength(1)
  })
})

describe('extractSchemas', () => {
  it('should extract all schemas from components', () => {
    const spec: OpenAPISpec = {
      openapi: '3.0.0',
      info: { title: 'API', version: '1.0.0' },
      paths: {},
      components: {
        schemas: {
          User: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
            },
          },
          Post: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              title: { type: 'string' },
            },
          },
        },
      },
    }

    const schemas = extractSchemas(spec)

    expect(Object.keys(schemas)).toHaveLength(2)
    expect(schemas.User).toBeDefined()
    expect(schemas.Post).toBeDefined()
    expect(schemas.User.type).toBe('object')
  })

  it('should return empty object when no components', () => {
    const spec: OpenAPISpec = {
      openapi: '3.0.0',
      info: { title: 'API', version: '1.0.0' },
      paths: {},
    }

    const schemas = extractSchemas(spec)

    expect(schemas).toEqual({})
  })

  it('should return empty object when components has no schemas', () => {
    const spec: OpenAPISpec = {
      openapi: '3.0.0',
      info: { title: 'API', version: '1.0.0' },
      paths: {},
      components: {
        responses: {
          NotFound: { description: 'Not found' },
        },
      },
    }

    const schemas = extractSchemas(spec)

    expect(schemas).toEqual({})
  })

  it('should preserve schema details', () => {
    const spec: OpenAPISpec = {
      openapi: '3.0.0',
      info: { title: 'API', version: '1.0.0' },
      paths: {},
      components: {
        schemas: {
          User: {
            type: 'object',
            required: ['id', 'email'],
            properties: {
              id: { type: 'integer', format: 'int64' },
              email: { type: 'string', format: 'email' },
              name: { type: 'string' },
            },
          },
        },
      },
    }

    const schemas = extractSchemas(spec)

    expect(schemas.User.required).toEqual(['id', 'email'])
    expect(schemas.User.properties?.id.format).toBe('int64')
    expect(schemas.User.properties?.email.format).toBe('email')
  })
})
