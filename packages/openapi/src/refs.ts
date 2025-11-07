// Pure functions for resolving $ref in OpenAPI specs

import type { OpenAPISpec, Schema } from './types'

/**
 * Resolves a $ref string to its target in the spec
 * Supports JSON Pointer format: #/components/schemas/User
 * @param spec - OpenAPI specification
 * @param ref - Reference string (e.g., '#/components/schemas/User')
 * @returns Resolved object or undefined if not found
 */
export const resolveRef = (spec: OpenAPISpec, ref: string): unknown | undefined => {
  // Must start with #/ for internal references
  if (!ref.startsWith('#/')) {
    return undefined
  }

  // Remove the #/ prefix and split by /
  const path = ref.slice(2).split('/')

  // Navigate through the spec object
  let current: unknown = spec
  for (const segment of path) {
    if (current === null || typeof current !== 'object') {
      return undefined
    }
    current = (current as Record<string, unknown>)[segment]
    if (current === undefined) {
      return undefined
    }
  }

  return current
}

/**
 * Recursively resolves all $refs in a schema
 * @param spec - OpenAPI specification
 * @param schema - Schema to resolve
 * @param visited - Set of visited refs to prevent circular loops
 * @returns Schema with all refs resolved
 */
export const resolveAllRefs = (
  spec: OpenAPISpec,
  schema: Schema,
  visited: Set<string> = new Set()
): Schema => {
  // If schema has a $ref, resolve it
  if (schema.$ref) {
    // Check for circular reference
    if (visited.has(schema.$ref)) {
      // Return a marker for circular reference instead of infinite loop
      return { type: 'object', description: '[Circular Reference]' }
    }

    // Add to visited set
    const newVisited = new Set(visited)
    newVisited.add(schema.$ref)

    // Resolve the reference
    const resolved = resolveRef(spec, schema.$ref)
    if (resolved && typeof resolved === 'object') {
      // Recursively resolve the resolved schema
      return resolveAllRefs(spec, resolved as Schema, newVisited)
    }

    // If resolution failed, return original schema
    return schema
  }

  // Create a new schema object (immutable approach)
  const result: Schema = { ...schema }

  // Resolve refs in properties
  if (schema.properties) {
    result.properties = {}
    for (const [key, propSchema] of Object.entries(schema.properties)) {
      result.properties[key] = resolveAllRefs(spec, propSchema, visited)
    }
  }

  // Resolve refs in array items
  if (schema.items) {
    result.items = resolveAllRefs(spec, schema.items, visited)
  }

  // Resolve refs in allOf, oneOf, anyOf
  if (schema.allOf) {
    result.allOf = schema.allOf.map((s) => resolveAllRefs(spec, s, visited))
  }
  if (schema.oneOf) {
    result.oneOf = schema.oneOf.map((s) => resolveAllRefs(spec, s, visited))
  }
  if (schema.anyOf) {
    result.anyOf = schema.anyOf.map((s) => resolveAllRefs(spec, s, visited))
  }

  return result
}
