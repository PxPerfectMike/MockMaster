// Pure functions for extracting data from OpenAPI specs

import type { OpenAPISpec, Paths, PathItem, Operation, Schema } from './types'

/**
 * Extracted operation with metadata
 */
export interface ExtractedOperation {
  path: string
  method: string
  operation: Operation
}

/**
 * HTTP methods supported by OpenAPI
 */
const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'] as const

/**
 * Extracts all paths from an OpenAPI specification
 * @param spec - OpenAPI specification
 * @returns Paths object
 */
export const extractPaths = (spec: OpenAPISpec): Paths => {
  return spec.paths
}

/**
 * Extracts all operations from a single path item
 * @param path - The path string (e.g., '/users')
 * @param pathItem - The path item containing operations
 * @returns Array of extracted operations
 */
export const extractOperations = (path: string, pathItem: PathItem): ExtractedOperation[] => {
  const operations: ExtractedOperation[] = []

  for (const method of HTTP_METHODS) {
    const operation = pathItem[method]
    if (operation) {
      operations.push({
        path,
        method,
        operation,
      })
    }
  }

  return operations
}

/**
 * Extracts all operations from all paths in the spec
 * @param spec - OpenAPI specification
 * @returns Array of all extracted operations
 */
export const getAllOperations = (spec: OpenAPISpec): ExtractedOperation[] => {
  const paths = extractPaths(spec)
  const allOperations: ExtractedOperation[] = []

  for (const [path, pathItem] of Object.entries(paths)) {
    const operations = extractOperations(path, pathItem)
    allOperations.push(...operations)
  }

  return allOperations
}

/**
 * Extracts all schemas from the components section
 * @param spec - OpenAPI specification
 * @returns Record of schema name to schema definition
 */
export const extractSchemas = (spec: OpenAPISpec): Record<string, Schema> => {
  if (!spec.components) {
    return {}
  }

  if (!spec.components.schemas) {
    return {}
  }

  return spec.components.schemas
}
