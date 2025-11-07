// Pure functions for generating scenarios from OpenAPI specs

import type { OpenAPISpec } from '@mock-master/openapi'
import { getAllOperations, generateFromSchema, resolveAllRefs } from '@mock-master/openapi'
import { createScenario, createRecording, addRecordingToScenario } from '@mock-master/msw-adapter'
import type { Scenario, RecordedRequest, RecordedResponse } from '@mock-master/msw-adapter'

/**
 * Generates scenarios from an OpenAPI specification
 * @param spec - The OpenAPI specification
 * @param scenarioName - Name for the generated scenario
 * @returns Array of generated scenarios (currently returns one scenario with all operations)
 */
export const generateScenariosFromSpec = (
  spec: OpenAPISpec,
  scenarioName: string
): Scenario[] => {
  // Extract all operations from the spec
  const operations = getAllOperations(spec)

  // Get base URL from servers
  const baseUrl = spec.servers && spec.servers.length > 0 && spec.servers[0]
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
    if (!content || !content.schema) {
      continue
    }

    // Resolve any $refs in the schema
    const resolvedSchema = resolveAllRefs(spec, content.schema)

    // Generate mock data from the schema
    const mockData = generateFromSchema(resolvedSchema)

    // Create recorded request
    const request: RecordedRequest = {
      method: op.method.toUpperCase(),
      url: `${baseUrl}${op.path}`,
      path: op.path,
      timestamp: Date.now(),
    }

    // Create recorded response
    const response: RecordedResponse = {
      status,
      body: mockData,
      headers: {
        'Content-Type': 'application/json',
      },
      timestamp: Date.now(),
    }

    // Create recording and add to scenario
    const recording = createRecording(request, response)
    scenario = addRecordingToScenario(scenario, recording)
  }

  return [scenario]
}
