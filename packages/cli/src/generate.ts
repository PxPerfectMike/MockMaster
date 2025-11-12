// Pure functions for generating scenarios from OpenAPI specs

import type { OpenAPISpec } from '@mockmaster/openapi'
import { getAllOperations, generateFromSchema, resolveAllRefs } from '@mockmaster/openapi'
import { createScenario, createRecording, addRecordingToScenario } from '@mockmaster/msw-adapter'
import type { Scenario, RecordedRequest, RecordedResponse } from '@mockmaster/msw-adapter'

/**
 * Converts OpenAPI path parameters from {id} format to :id format
 * @param openapiPath - Path in OpenAPI format (e.g., '/users/{id}')
 * @returns Path in Express/router format (e.g., '/users/:id')
 */
const convertPathFormat = (openapiPath: string): string => {
  return openapiPath.replace(/\{([^}]+)\}/g, ':$1')
}

/**
 * Generates scenarios from an OpenAPI specification
 * @param spec - The OpenAPI specification
 * @param scenarioName - Name for the generated scenario
 * @returns Array of generated scenarios (currently returns one scenario with all operations)
 */
export const generateScenariosFromSpec = (spec: OpenAPISpec, scenarioName: string): Scenario[] => {
  // Extract all operations from the spec
  const operations = getAllOperations(spec)

  // Get base URL from servers
  const baseUrl =
    spec.servers && spec.servers.length > 0 && spec.servers[0]
      ? spec.servers[0].url
      : 'https://api.example.com'

  // Create description from spec info
  let description = `Generated from ${spec.info.title} (${spec.info.version})`
  if (spec.info.description) {
    description += `: ${spec.info.description}`
  }

  // Create scenario
  let scenario = createScenario(scenarioName, description)

  // Generate recordings for each operation
  for (const op of operations) {
    // Check if operation has responses
    if (!op.operation.responses) {
      continue
    }

    // Get the first successful response (200-299)
    const successResponse = Object.entries(op.operation.responses).find(
      ([status]) => parseInt(status) >= 200 && parseInt(status) < 300
    )

    if (!successResponse) {
      continue
    }

    const [statusCode, responseObj] = successResponse
    const status = parseInt(statusCode)

    // Get the response schema
    const content = responseObj.content?.['application/json']

    // Determine if this response has content
    let mockData: unknown = null
    let headers: Record<string, string> = {}

    if (content && content.schema) {
      // Response has content - generate mock data
      const resolvedSchema = resolveAllRefs(spec, content.schema)
      mockData = generateFromSchema(resolvedSchema)
      headers = { 'Content-Type': 'application/json' }
    } else if (status === 204) {
      // 204 No Content - explicitly set null body and no Content-Type header
      mockData = null
      headers = {}
    } else {
      // Other responses without content (e.g., 201 Created with Location header)
      // Still create a recording but with empty body
      mockData = null
      headers = {}
    }

    // Create recorded request
    // Convert OpenAPI path format {id} to Express format :id
    const routerPath = convertPathFormat(op.path)

    const request: RecordedRequest = {
      method: op.method.toUpperCase(),
      url: `${baseUrl}${op.path}`,
      path: routerPath,
      timestamp: Date.now(),
    }

    // Create recorded response
    const response: RecordedResponse = {
      status,
      body: mockData,
      headers,
      timestamp: Date.now(),
    }

    // Create recording and add to scenario
    const recording = createRecording(request, response)
    scenario = addRecordingToScenario(scenario, recording)
  }

  return [scenario]
}
