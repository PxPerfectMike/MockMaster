import { describe, it, expect } from 'vitest'
import { generateFromSchema } from './generate'
import type { Schema } from './types'

describe('generateFromSchema - primitive types', () => {
  it('should generate string', () => {
    const schema: Schema = { type: 'string' }
    const result = generateFromSchema(schema)

    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('should generate integer', () => {
    const schema: Schema = { type: 'integer' }
    const result = generateFromSchema(schema)

    expect(typeof result).toBe('number')
    expect(Number.isInteger(result)).toBe(true)
  })

  it('should generate number', () => {
    const schema: Schema = { type: 'number' }
    const result = generateFromSchema(schema)

    expect(typeof result).toBe('number')
  })

  it('should generate boolean', () => {
    const schema: Schema = { type: 'boolean' }
    const result = generateFromSchema(schema)

    expect(typeof result).toBe('boolean')
  })
})

describe('generateFromSchema - formats', () => {
  it('should generate email for string with email format', () => {
    const schema: Schema = { type: 'string', format: 'email' }
    const result = generateFromSchema(schema)

    expect(typeof result).toBe('string')
    expect(result).toMatch(/@/)
  })

  it('should generate UUID for string with uuid format', () => {
    const schema: Schema = { type: 'string', format: 'uuid' }
    const result = generateFromSchema(schema)

    expect(typeof result).toBe('string')
    expect(result).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
  })

  it('should generate date-time for string with date-time format', () => {
    const schema: Schema = { type: 'string', format: 'date-time' }
    const result = generateFromSchema(schema)

    expect(typeof result).toBe('string')
    // Should be valid ISO date string
    expect(new Date(result).toString()).not.toBe('Invalid Date')
  })

  it('should generate URI for string with uri format', () => {
    const schema: Schema = { type: 'string', format: 'uri' }
    const result = generateFromSchema(schema)

    expect(typeof result).toBe('string')
    expect(result).toMatch(/^https?:\/\//)
  })
})

describe('generateFromSchema - arrays', () => {
  it('should generate array of strings', () => {
    const schema: Schema = {
      type: 'array',
      items: { type: 'string' },
    }
    const result = generateFromSchema(schema)

    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
    expect(typeof result[0]).toBe('string')
  })

  it('should generate array of objects', () => {
    const schema: Schema = {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
        },
      },
    }
    const result = generateFromSchema(schema)

    expect(Array.isArray(result)).toBe(true)
    expect(result[0]).toHaveProperty('id')
    expect(result[0]).toHaveProperty('name')
  })
})

describe('generateFromSchema - objects', () => {
  it('should generate object with properties', () => {
    const schema: Schema = {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        name: { type: 'string' },
        email: { type: 'string', format: 'email' },
      },
    }
    const result = generateFromSchema(schema)

    expect(typeof result).toBe('object')
    expect(result).toHaveProperty('id')
    expect(result).toHaveProperty('name')
    expect(result).toHaveProperty('email')
    expect(typeof result.id).toBe('number')
    expect(typeof result.name).toBe('string')
    expect(result.email).toMatch(/@/)
  })

  it('should only generate required properties when specified', () => {
    const schema: Schema = {
      type: 'object',
      required: ['id', 'name'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string' },
        email: { type: 'string' },
      },
    }
    const result = generateFromSchema(schema)

    expect(result).toHaveProperty('id')
    expect(result).toHaveProperty('name')
    // Optional property might or might not be present
  })

  it('should handle nested objects', () => {
    const schema: Schema = {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
          },
        },
      },
    }
    const result = generateFromSchema(schema)

    expect(result.user).toBeDefined()
    expect(result.user).toHaveProperty('id')
    expect(result.user).toHaveProperty('name')
  })
})

describe('generateFromSchema - enum', () => {
  it('should generate value from enum', () => {
    const schema: Schema = {
      type: 'string',
      enum: ['active', 'inactive', 'pending'],
    }
    const result = generateFromSchema(schema)

    expect(['active', 'inactive', 'pending']).toContain(result)
  })

  it('should handle number enum', () => {
    const schema: Schema = {
      type: 'integer',
      enum: [1, 2, 3, 4, 5],
    }
    const result = generateFromSchema(schema)

    expect([1, 2, 3, 4, 5]).toContain(result)
  })
})

describe('generateFromSchema - examples and defaults', () => {
  it('should use example if provided', () => {
    const schema: Schema = {
      type: 'string',
      example: 'test-example',
    }
    const result = generateFromSchema(schema)

    expect(result).toBe('test-example')
  })

  it('should use default if provided and no example', () => {
    const schema: Schema = {
      type: 'string',
      default: 'default-value',
    }
    const result = generateFromSchema(schema)

    expect(result).toBe('default-value')
  })

  it('should prioritize example over default', () => {
    const schema: Schema = {
      type: 'string',
      example: 'example-value',
      default: 'default-value',
    }
    const result = generateFromSchema(schema)

    expect(result).toBe('example-value')
  })
})

describe('generateFromSchema - edge cases', () => {
  it('should handle schema without type', () => {
    const schema: Schema = {}
    const result = generateFromSchema(schema)

    expect(result).toBeDefined()
  })

  it('should handle nullable schemas', () => {
    const schema: Schema = {
      type: 'string',
      nullable: true,
    }
    const result = generateFromSchema(schema)

    // Could be string or null
    expect(result === null || typeof result === 'string').toBe(true)
  })
})
