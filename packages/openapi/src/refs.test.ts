import { describe, it, expect } from 'vitest'
import { resolveRef, resolveAllRefs } from './refs'
import type { OpenAPISpec, Schema } from './types'

describe('resolveRef', () => {
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
            author: { $ref: '#/components/schemas/User' },
          },
        },
      },
    },
  }

  it('should resolve schema reference', () => {
    const ref = '#/components/schemas/User'
    const resolved = resolveRef(spec, ref)

    expect(resolved).toBeDefined()
    expect(resolved?.type).toBe('object')
    expect(resolved?.properties?.name).toBeDefined()
  })

  it('should return undefined for invalid reference', () => {
    const ref = '#/components/schemas/NonExistent'
    const resolved = resolveRef(spec, ref)

    expect(resolved).toBeUndefined()
  })

  it('should handle nested references', () => {
    const ref = '#/components/schemas/Post'
    const resolved = resolveRef(spec, ref)

    expect(resolved).toBeDefined()
    expect(resolved?.properties?.author).toBeDefined()
  })

  it('should return undefined for malformed references', () => {
    const ref = 'invalid-ref-format'
    const resolved = resolveRef(spec, ref)

    expect(resolved).toBeUndefined()
  })

  it('should handle references to different component types', () => {
    const specWithResponses: OpenAPISpec = {
      openapi: '3.0.0',
      info: { title: 'API', version: '1.0.0' },
      paths: {},
      components: {
        responses: {
          NotFound: {
            description: 'Resource not found',
          },
        },
      },
    }

    const ref = '#/components/responses/NotFound'
    const resolved = resolveRef(specWithResponses, ref)

    expect(resolved).toBeDefined()
    expect((resolved as { description: string }).description).toBe('Resource not found')
  })
})

describe('resolveAllRefs', () => {
  it('should resolve all $refs in a schema', () => {
    const spec: OpenAPISpec = {
      openapi: '3.0.0',
      info: { title: 'API', version: '1.0.0' },
      paths: {},
      components: {
        schemas: {
          Address: {
            type: 'object',
            properties: {
              street: { type: 'string' },
              city: { type: 'string' },
            },
          },
          User: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
              address: { $ref: '#/components/schemas/Address' },
            },
          },
        },
      },
    }

    const userSchema = spec.components?.schemas?.User
    const resolved = resolveAllRefs(spec, userSchema!)

    expect(resolved.properties?.address.$ref).toBeUndefined()
    expect(resolved.properties?.address.type).toBe('object')
    expect(resolved.properties?.address.properties?.street).toBeDefined()
  })

  it('should handle schemas without references', () => {
    const spec: OpenAPISpec = {
      openapi: '3.0.0',
      info: { title: 'API', version: '1.0.0' },
      paths: {},
    }

    const schema: Schema = {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        name: { type: 'string' },
      },
    }

    const resolved = resolveAllRefs(spec, schema)

    expect(resolved).toEqual(schema)
  })

  it('should handle nested references', () => {
    const spec: OpenAPISpec = {
      openapi: '3.0.0',
      info: { title: 'API', version: '1.0.0' },
      paths: {},
      components: {
        schemas: {
          Country: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              code: { type: 'string' },
            },
          },
          Address: {
            type: 'object',
            properties: {
              street: { type: 'string' },
              country: { $ref: '#/components/schemas/Country' },
            },
          },
          User: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              address: { $ref: '#/components/schemas/Address' },
            },
          },
        },
      },
    }

    const userSchema = spec.components?.schemas?.User
    const resolved = resolveAllRefs(spec, userSchema!)

    // Check that address was resolved
    expect(resolved.properties?.address.$ref).toBeUndefined()
    expect(resolved.properties?.address.type).toBe('object')

    // Check that nested country was also resolved
    expect(resolved.properties?.address.properties?.country.$ref).toBeUndefined()
    expect(resolved.properties?.address.properties?.country.type).toBe('object')
  })

  it('should handle array items with references', () => {
    const spec: OpenAPISpec = {
      openapi: '3.0.0',
      info: { title: 'API', version: '1.0.0' },
      paths: {},
      components: {
        schemas: {
          Tag: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
            },
          },
          Post: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              tags: {
                type: 'array',
                items: { $ref: '#/components/schemas/Tag' },
              },
            },
          },
        },
      },
    }

    const postSchema = spec.components?.schemas?.Post
    const resolved = resolveAllRefs(spec, postSchema!)

    expect(resolved.properties?.tags.items?.$ref).toBeUndefined()
    expect(resolved.properties?.tags.items?.type).toBe('object')
    expect(resolved.properties?.tags.items?.properties?.name).toBeDefined()
  })

  it('should prevent circular reference infinite loops', () => {
    const spec: OpenAPISpec = {
      openapi: '3.0.0',
      info: { title: 'API', version: '1.0.0' },
      paths: {},
      components: {
        schemas: {
          Node: {
            type: 'object',
            properties: {
              value: { type: 'string' },
              next: { $ref: '#/components/schemas/Node' },
            },
          },
        },
      },
    }

    const nodeSchema = spec.components?.schemas?.Node

    // Should not throw or hang - circular refs should be handled
    expect(() => resolveAllRefs(spec, nodeSchema!)).not.toThrow()
  })
})
