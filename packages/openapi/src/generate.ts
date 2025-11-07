// Pure functions for generating mock data from OpenAPI schemas

import type { Schema } from './types'

/**
 * Simple fake data generators (minimal implementation)
 * In a real implementation, this would use @faker-js/faker from @mock-master/data
 */
const generators = {
  string: (): string => 'string-value',
  email: (): string => 'user@example.com',
  uuid: (): string => '123e4567-e89b-12d3-a456-426614174000',
  dateTime: (): string => new Date().toISOString(),
  uri: (): string => 'https://example.com',
  integer: (): number => Math.floor(Math.random() * 100),
  number: (): number => Math.random() * 100,
  boolean: (): boolean => Math.random() > 0.5,
}

/**
 * Generates mock data from an OpenAPI schema
 * @param schema - OpenAPI schema definition
 * @returns Generated mock data matching the schema
 */
export const generateFromSchema = (schema: Schema): unknown => {
  // Use example if provided
  if (schema.example !== undefined) {
    return schema.example
  }

  // Use default if provided
  if (schema.default !== undefined) {
    return schema.default
  }

  // Handle enum
  if (schema.enum && schema.enum.length > 0) {
    const randomIndex = Math.floor(Math.random() * schema.enum.length)
    return schema.enum[randomIndex]
  }

  // Handle nullable (randomly return null)
  if (schema.nullable && Math.random() > 0.8) {
    return null
  }

  // Handle based on type
  switch (schema.type) {
    case 'string':
      return generateString(schema)

    case 'integer':
      return generators.integer()

    case 'number':
      return generators.number()

    case 'boolean':
      return generators.boolean()

    case 'array':
      return generateArray(schema)

    case 'object':
      return generateObject(schema)

    default:
      // If no type specified, return a generic object
      if (schema.properties) {
        return generateObject(schema)
      }
      return {}
  }
}

/**
 * Generates a string value based on format
 */
const generateString = (schema: Schema): string => {
  switch (schema.format) {
    case 'email':
      return generators.email()

    case 'uuid':
      return generators.uuid()

    case 'date-time':
      return generators.dateTime()

    case 'uri':
    case 'url':
      return generators.uri()

    default:
      return generators.string()
  }
}

/**
 * Generates an array of items
 */
const generateArray = (schema: Schema): unknown[] => {
  if (!schema.items) {
    return []
  }

  // Generate 2-3 items by default
  const count = 2 + Math.floor(Math.random() * 2)
  const result: unknown[] = []

  for (let i = 0; i < count; i++) {
    result.push(generateFromSchema(schema.items))
  }

  return result
}

/**
 * Generates an object with properties
 */
const generateObject = (schema: Schema): Record<string, unknown> => {
  if (!schema.properties) {
    return {}
  }

  const result: Record<string, unknown> = {}

  // Generate all properties (deterministic for testing)
  // In the future, we could add an option to only generate required properties
  for (const [key, propSchema] of Object.entries(schema.properties)) {
    result[key] = generateFromSchema(propSchema)
  }

  return result
}
