import { describe, it, expect } from 'vitest'
import { generateScenariosFromSpec } from './generate'
import type { OpenAPISpec } from '@mockmaster/openapi'

describe('generateScenariosFromSpec', () => {
  it('should generate scenarios from OpenAPI spec', () => {
    const spec: OpenAPISpec = {
      openapi: '3.0.0',
      info: { title: 'API', version: '1.0.0' },
      paths: {
        '/users': {
          get: {
            summary: 'Get all users',
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'integer' },
                          name: { type: 'string' },
                        },
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

    const scenarios = generateScenariosFromSpec(spec, 'api-spec')

    expect(scenarios).toHaveLength(1)
    expect(scenarios[0].name).toBe('api-spec')
    expect(scenarios[0].recordings).toHaveLength(1)
    expect(scenarios[0].recordings[0].request.method).toBe('GET')
    expect(scenarios[0].recordings[0].request.path).toBe('/users')
    expect(scenarios[0].recordings[0].response.status).toBe(200)
  })

  it('should handle multiple paths and methods', () => {
    const spec: OpenAPISpec = {
      openapi: '3.0.0',
      info: { title: 'API', version: '1.0.0' },
      paths: {
        '/users': {
          get: {
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: { type: 'object' },
                    },
                  },
                },
              },
            },
          },
          post: {
            responses: {
              '201': {
                description: 'Created',
                content: {
                  'application/json': {
                    schema: { type: 'object' },
                  },
                },
              },
            },
          },
        },
        '/posts': {
          get: {
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: { type: 'array' },
                  },
                },
              },
            },
          },
        },
      },
    }

    const scenarios = generateScenariosFromSpec(spec, 'multi-endpoint')

    expect(scenarios).toHaveLength(1)
    expect(scenarios[0].recordings).toHaveLength(3)

    const methods = scenarios[0].recordings.map((r) => r.request.method)
    expect(methods).toContain('GET')
    expect(methods).toContain('POST')

    const paths = scenarios[0].recordings.map((r) => r.request.path)
    expect(paths).toContain('/users')
    expect(paths).toContain('/posts')
  })

  it('should generate mock data from schema', () => {
    const spec: OpenAPISpec = {
      openapi: '3.0.0',
      info: { title: 'API', version: '1.0.0' },
      paths: {
        '/users': {
          get: {
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        id: { type: 'integer' },
                        name: { type: 'string' },
                        email: { type: 'string', format: 'email' },
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

    const scenarios = generateScenariosFromSpec(spec, 'user-api')

    expect(scenarios[0].recordings[0].response.body).toBeDefined()
    expect(typeof scenarios[0].recordings[0].response.body).toBe('object')

    const body = scenarios[0].recordings[0].response.body as Record<string, unknown>
    expect(body).toHaveProperty('id')
    expect(body).toHaveProperty('name')
    expect(body).toHaveProperty('email')
    expect(typeof body.id).toBe('number')
    expect(typeof body.name).toBe('string')
    expect(typeof body.email).toBe('string')
  })

  it('should use base URL if provided', () => {
    const spec: OpenAPISpec = {
      openapi: '3.0.0',
      info: { title: 'API', version: '1.0.0' },
      servers: [{ url: 'https://api.example.com' }],
      paths: {
        '/users': {
          get: {
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: { type: 'array' },
                  },
                },
              },
            },
          },
        },
      },
    }

    const scenarios = generateScenariosFromSpec(spec, 'api-spec')

    expect(scenarios[0].recordings[0].request.url).toBe('https://api.example.com/users')
  })

  it('should handle specs with no paths', () => {
    const spec: OpenAPISpec = {
      openapi: '3.0.0',
      info: { title: 'API', version: '1.0.0' },
      paths: {},
    }

    const scenarios = generateScenariosFromSpec(spec, 'empty-spec')

    expect(scenarios).toHaveLength(1)
    expect(scenarios[0].recordings).toHaveLength(0)
  })

  it('should add description from spec info', () => {
    const spec: OpenAPISpec = {
      openapi: '3.0.0',
      info: {
        title: 'User API',
        version: '1.0.0',
        description: 'API for managing users',
      },
      paths: {},
    }

    const scenarios = generateScenariosFromSpec(spec, 'user-api')

    expect(scenarios[0].description).toBe('Generated from User API (1.0.0): API for managing users')
  })

  it('should skip operations without responses', () => {
    const spec: OpenAPISpec = {
      openapi: '3.0.0',
      info: { title: 'API', version: '1.0.0' },
      paths: {
        '/users': {
          get: {
            summary: 'Get users',
            // No responses defined
          },
        },
      },
    }

    const scenarios = generateScenariosFromSpec(spec, 'api-spec')

    expect(scenarios).toHaveLength(1)
    expect(scenarios[0].recordings).toHaveLength(0)
  })

  it('should skip operations without successful responses', () => {
    const spec: OpenAPISpec = {
      openapi: '3.0.0',
      info: { title: 'API', version: '1.0.0' },
      paths: {
        '/users': {
          get: {
            responses: {
              '400': {
                description: 'Bad Request',
                content: {
                  'application/json': {
                    schema: { type: 'object' },
                  },
                },
              },
              '500': {
                description: 'Server Error',
                content: {
                  'application/json': {
                    schema: { type: 'object' },
                  },
                },
              },
            },
          },
        },
      },
    }

    const scenarios = generateScenariosFromSpec(spec, 'api-spec')

    expect(scenarios).toHaveLength(1)
    expect(scenarios[0].recordings).toHaveLength(0)
  })

  it('should handle operations without content or schema (create recordings with null body)', () => {
    const spec: OpenAPISpec = {
      openapi: '3.0.0',
      info: { title: 'API', version: '1.0.0' },
      paths: {
        '/users': {
          get: {
            responses: {
              '200': {
                description: 'Success',
                // No content defined
              },
            },
          },
          post: {
            responses: {
              '201': {
                description: 'Created',
                content: {
                  'application/json': {
                    // No schema defined
                  },
                },
              },
            },
          },
        },
      },
    }

    const scenarios = generateScenariosFromSpec(spec, 'api-spec')

    expect(scenarios).toHaveLength(1)
    expect(scenarios[0].recordings).toHaveLength(2)

    // Check both recordings have null body and empty headers
    scenarios[0].recordings.forEach((recording) => {
      expect(recording.response.body).toBeNull()
      expect(recording.response.headers).toEqual({})
    })
  })

  it('should convert OpenAPI path parameters from {id} to :id format', () => {
    const spec: OpenAPISpec = {
      openapi: '3.0.0',
      info: { title: 'API', version: '1.0.0' },
      paths: {
        '/users/{id}': {
          get: {
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        id: { type: 'integer' },
                        name: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        '/users/{userId}/posts/{postId}': {
          get: {
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: { type: 'object' },
                  },
                },
              },
            },
          },
        },
      },
    }

    const scenarios = generateScenariosFromSpec(spec, 'param-spec')

    expect(scenarios).toHaveLength(1)
    expect(scenarios[0].recordings).toHaveLength(2)

    // Check that OpenAPI {id} format is converted to Express :id format
    const paths = scenarios[0].recordings.map((r) => r.request.path)
    expect(paths).toContain('/users/:id')
    expect(paths).toContain('/users/:userId/posts/:postId')

    // Verify original URL keeps OpenAPI format
    expect(scenarios[0].recordings[0].request.url).toContain('/users/{id}')
  })

  it('should handle 204 No Content responses (e.g., DELETE operations)', () => {
    const spec: OpenAPISpec = {
      openapi: '3.0.0',
      info: { title: 'API', version: '1.0.0' },
      paths: {
        '/users/{id}': {
          delete: {
            responses: {
              '204': {
                description: 'No Content - User deleted successfully',
                // Note: 204 responses typically have no content section
              },
            },
          },
        },
        '/posts/{id}': {
          delete: {
            responses: {
              '204': {
                description: 'No Content',
              },
            },
          },
        },
      },
    }

    const scenarios = generateScenariosFromSpec(spec, 'delete-spec')

    expect(scenarios).toHaveLength(1)
    expect(scenarios[0].recordings).toHaveLength(2)

    // Check both DELETE operations were recorded
    const methods = scenarios[0].recordings.map((r) => r.request.method)
    expect(methods).toEqual(['DELETE', 'DELETE'])

    // Check paths were converted correctly
    const paths = scenarios[0].recordings.map((r) => r.request.path)
    expect(paths).toContain('/users/:id')
    expect(paths).toContain('/posts/:id')

    // Check 204 responses have null body and no Content-Type header
    scenarios[0].recordings.forEach((recording) => {
      expect(recording.response.status).toBe(204)
      expect(recording.response.body).toBeNull()
      expect(recording.response.headers).toEqual({})
    })
  })

  it('should handle responses without content schema', () => {
    const spec: OpenAPISpec = {
      openapi: '3.0.0',
      info: { title: 'API', version: '1.0.0' },
      paths: {
        '/users': {
          post: {
            responses: {
              '201': {
                description: 'Created',
                // 201 without content - just Location header
              },
            },
          },
        },
      },
    }

    const scenarios = generateScenariosFromSpec(spec, 'no-content-spec')

    expect(scenarios).toHaveLength(1)
    expect(scenarios[0].recordings).toHaveLength(1)
    expect(scenarios[0].recordings[0].response.status).toBe(201)
    expect(scenarios[0].recordings[0].response.body).toBeNull()
  })
})
