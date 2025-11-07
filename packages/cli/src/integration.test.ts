import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { generateScenariosFromSpec } from './generate'
import { writeScenario, readScenario, listScenarios } from './fs'
import { createReplayHandler } from '@mockmaster/msw-adapter'
import { parseYaml } from '@mockmaster/openapi'
import type { OpenAPISpec } from '@mockmaster/openapi'
import * as fs from 'fs-extra'
import * as path from 'path'

const TEST_DIR = path.join(__dirname, '../.test-integration')

describe('End-to-End Integration Tests', () => {
  beforeEach(async () => {
    await fs.remove(TEST_DIR)
  })

  afterEach(async () => {
    await fs.remove(TEST_DIR)
  })

  describe('OpenAPI to Replay Workflow', () => {
    it('should generate scenarios from OpenAPI spec and replay requests', async () => {
      // Step 1: Create an OpenAPI spec
      const spec: OpenAPISpec = {
        openapi: '3.0.0',
        info: {
          title: 'User API',
          version: '1.0.0',
          description: 'API for managing users',
        },
        servers: [{ url: 'https://api.example.com' }],
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
                            email: { type: 'string', format: 'email' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            post: {
              summary: 'Create a user',
              responses: {
                '201': {
                  description: 'Created',
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
          '/users/{id}': {
            get: {
              summary: 'Get user by ID',
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

      // Step 2: Generate scenarios from spec
      const scenarios = generateScenariosFromSpec(spec, 'user-api')
      expect(scenarios).toHaveLength(1)

      const scenario = scenarios[0]
      expect(scenario.name).toBe('user-api')
      expect(scenario.recordings).toHaveLength(3)

      // Step 3: Save scenario to disk
      await writeScenario(TEST_DIR, scenario)

      // Step 4: Load scenario from disk
      const loaded = await readScenario(TEST_DIR, 'user-api')
      expect(loaded).toBeDefined()
      expect(loaded?.name).toBe('user-api')
      expect(loaded?.recordings).toHaveLength(3)

      // Step 5: Create replay handler
      const handler = createReplayHandler(loaded!)

      // Step 6: Replay requests
      const getUsersResponse = handler({ method: 'GET', path: '/users' })
      expect(getUsersResponse).toBeDefined()
      expect(getUsersResponse?.status).toBe(200)
      expect(Array.isArray(getUsersResponse?.body)).toBe(true)

      const createUserResponse = handler({ method: 'POST', path: '/users' })
      expect(createUserResponse).toBeDefined()
      expect(createUserResponse?.status).toBe(201)
      expect(typeof createUserResponse?.body).toBe('object')

      const getUserResponse = handler({ method: 'GET', path: '/users/{id}' })
      expect(getUserResponse).toBeDefined()
      expect(getUserResponse?.status).toBe(200)
    })

    it('should handle complex nested schemas', async () => {
      const spec: OpenAPISpec = {
        openapi: '3.0.0',
        info: { title: 'Blog API', version: '1.0.0' },
        paths: {
          '/posts': {
            get: {
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
                            title: { type: 'string' },
                            content: { type: 'string' },
                            author: {
                              type: 'object',
                              properties: {
                                id: { type: 'integer' },
                                name: { type: 'string' },
                                email: { type: 'string', format: 'email' },
                              },
                            },
                            tags: {
                              type: 'array',
                              items: { type: 'string' },
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
        },
      }

      const scenarios = generateScenariosFromSpec(spec, 'blog-api')
      const scenario = scenarios[0]

      await writeScenario(TEST_DIR, scenario)
      const loaded = await readScenario(TEST_DIR, 'blog-api')

      const handler = createReplayHandler(loaded!)
      const response = handler({ method: 'GET', path: '/posts' })

      expect(response?.status).toBe(200)
      expect(Array.isArray(response?.body)).toBe(true)

      const posts = response?.body as Array<{
        id: number
        title: string
        author: { id: number; name: string; email: string }
        tags: string[]
      }>

      expect(posts[0]).toHaveProperty('id')
      expect(posts[0]).toHaveProperty('title')
      expect(posts[0]).toHaveProperty('author')
      expect(posts[0].author).toHaveProperty('name')
      expect(posts[0].author).toHaveProperty('email')
      expect(Array.isArray(posts[0].tags)).toBe(true)
    })
  })

  describe('YAML OpenAPI Spec Integration', () => {
    it('should parse YAML spec and generate scenarios', () => {
      const yamlContent = [
        'openapi: 3.0.0',
        'info:',
        '  title: Product API',
        '  version: 1.0.0',
        'paths:',
        '  /products:',
        '    get:',
        '      responses:',
        '        "200":',
        '          description: Success',
        '          content:',
        '            application/json:',
        '              schema:',
        '                type: array',
        '                items:',
        '                  type: object',
        '                  properties:',
        '                    id:',
        '                      type: integer',
        '                    name:',
        '                      type: string',
        '                    price:',
        '                      type: number',
      ].join('\n')

      const spec = parseYaml(yamlContent)
      const scenarios = generateScenariosFromSpec(spec, 'product-api')

      expect(scenarios).toHaveLength(1)
      expect(scenarios[0].recordings).toHaveLength(1)
      expect(scenarios[0].recordings[0].request.path).toBe('/products')
    })
  })

  describe('Multiple Scenarios Management', () => {
    it('should manage multiple scenarios', async () => {
      const userSpec: OpenAPISpec = {
        openapi: '3.0.0',
        info: { title: 'User API', version: '1.0.0' },
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

      const productSpec: OpenAPISpec = {
        openapi: '3.0.0',
        info: { title: 'Product API', version: '1.0.0' },
        paths: {
          '/products': {
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

      // Generate and save multiple scenarios
      const userScenarios = generateScenariosFromSpec(userSpec, 'user-api')
      const productScenarios = generateScenariosFromSpec(productSpec, 'product-api')

      await writeScenario(TEST_DIR, userScenarios[0])
      await writeScenario(TEST_DIR, productScenarios[0])

      // List all scenarios
      const allScenarios = await listScenarios(TEST_DIR)

      expect(allScenarios).toHaveLength(2)
      expect(allScenarios.map((s) => s.name)).toContain('user-api')
      expect(allScenarios.map((s) => s.name)).toContain('product-api')

      // Load individual scenarios
      const userLoaded = await readScenario(TEST_DIR, 'user-api')
      const productLoaded = await readScenario(TEST_DIR, 'product-api')

      expect(userLoaded?.name).toBe('user-api')
      expect(productLoaded?.name).toBe('product-api')

      // Create separate handlers for each
      const userHandler = createReplayHandler(userLoaded!)
      const productHandler = createReplayHandler(productLoaded!)

      const userResponse = userHandler({ method: 'GET', path: '/users' })
      const productResponse = productHandler({ method: 'GET', path: '/products' })

      expect(userResponse?.status).toBe(200)
      expect(productResponse?.status).toBe(200)
    })
  })

  describe('Real-World API Scenarios', () => {
    it('should handle a GitHub-like API spec', async () => {
      const githubLikeSpec: OpenAPISpec = {
        openapi: '3.0.0',
        info: {
          title: 'GitHub-like API',
          version: '1.0.0',
          description: 'Repository management API',
        },
        servers: [{ url: 'https://api.github.example' }],
        paths: {
          '/repos': {
            get: {
              responses: {
                '200': {
                  description: 'List repositories',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'integer' },
                            name: { type: 'string' },
                            description: { type: 'string' },
                            stars: { type: 'integer' },
                            language: { type: 'string' },
                            private: { type: 'boolean' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '/repos/{owner}/{repo}/issues': {
            get: {
              responses: {
                '200': {
                  description: 'List issues',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'integer' },
                            title: { type: 'string' },
                            body: { type: 'string' },
                            state: {
                              type: 'string',
                              enum: ['open', 'closed'],
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
        },
      }

      const scenarios = generateScenariosFromSpec(githubLikeSpec, 'github-api')
      await writeScenario(TEST_DIR, scenarios[0])

      const loaded = await readScenario(TEST_DIR, 'github-api')
      const handler = createReplayHandler(loaded!)

      const reposResponse = handler({ method: 'GET', path: '/repos' })
      expect(reposResponse?.status).toBe(200)

      const repos = reposResponse?.body as Array<{
        id: number
        name: string
        stars: number
        private: boolean
      }>

      expect(repos[0]).toHaveProperty('id')
      expect(repos[0]).toHaveProperty('name')
      expect(repos[0]).toHaveProperty('stars')
      expect(typeof repos[0].private).toBe('boolean')

      const issuesResponse = handler({ method: 'GET', path: '/repos/{owner}/{repo}/issues' })
      expect(issuesResponse?.status).toBe(200)

      const issues = issuesResponse?.body as Array<{
        state: 'open' | 'closed'
      }>

      expect(['open', 'closed']).toContain(issues[0].state)
    })
  })
})
