// Pure functional OpenAPI parser

import YAML from 'yaml'
import type { OpenAPISpec } from './types'

/**
 * Parses a YAML string into an OpenAPI specification
 * @param yaml - YAML string representation of OpenAPI spec
 * @returns Parsed OpenAPI specification
 * @throws Error if YAML is invalid
 */
export const parseYaml = (yaml: string): OpenAPISpec => {
  try {
    const parsed: unknown = YAML.parse(yaml)
    return parsed as OpenAPISpec
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to parse YAML: ${error.message}`)
    }
    throw new Error('Failed to parse YAML: Unknown error')
  }
}

/**
 * Parses a JSON string into an OpenAPI specification
 * @param json - JSON string representation of OpenAPI spec
 * @returns Parsed OpenAPI specification
 * @throws Error if JSON is invalid
 */
export const parseJson = (json: string): OpenAPISpec => {
  try {
    const parsed: unknown = JSON.parse(json)
    return parsed as OpenAPISpec
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to parse JSON: ${error.message}`)
    }
    throw new Error('Failed to parse JSON: Unknown error')
  }
}

/**
 * Detects format and parses OpenAPI specification
 * Automatically detects YAML, JSON string, or JavaScript object
 * @param content - String content (YAML or JSON) or JavaScript object
 * @returns Parsed OpenAPI specification
 */
export const parseSpec = (content: string | unknown): OpenAPISpec => {
  // If already an object, return it as-is
  if (typeof content === 'object' && content !== null) {
    return content as OpenAPISpec
  }

  // If not a string at this point, something is wrong
  if (typeof content !== 'string') {
    throw new Error('parseSpec expects a string (YAML/JSON) or an object')
  }

  // Trim whitespace
  const trimmed = content.trim()

  // Try to detect format by first character
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    // Looks like JSON
    return parseJson(content)
  }

  // Default to YAML
  return parseYaml(content)
}
