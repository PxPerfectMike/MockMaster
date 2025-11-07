// Pure functions for recording and replaying HTTP requests/responses

import type { RecordedRequest, RecordedResponse, Recording, Scenario } from './types'

/**
 * Generates a unique ID for a recording
 * Uses timestamp + random string for uniqueness
 */
const generateId = (): string => {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 9)
  return `${timestamp}-${random}`
}

/**
 * Creates a recording from a request and response
 * @param request - The recorded request
 * @param response - The recorded response
 * @returns A new recording with a unique ID
 */
export const createRecording = (
  request: RecordedRequest,
  response: RecordedResponse
): Recording => {
  return {
    id: generateId(),
    request,
    response,
  }
}

/**
 * Creates a new scenario
 * @param name - The scenario name
 * @param description - Optional description
 * @returns A new scenario with empty recordings
 */
export const createScenario = (name: string, description?: string): Scenario => {
  const now = Date.now()
  const scenario: Scenario = {
    name,
    recordings: [],
    createdAt: now,
    updatedAt: now,
  }

  if (description !== undefined) {
    scenario.description = description
  }

  return scenario
}

/**
 * Adds a recording to a scenario (immutable)
 * @param scenario - The scenario to add to
 * @param recording - The recording to add
 * @returns A new scenario with the recording added
 */
export const addRecordingToScenario = (scenario: Scenario, recording: Recording): Scenario => {
  return {
    ...scenario,
    recordings: [...scenario.recordings, recording],
    updatedAt: Date.now(),
  }
}

/**
 * Finds a recording in a scenario that matches the given request
 * Matches by method and path (ignores query params for now)
 * @param scenario - The scenario to search
 * @param request - The request to match
 * @returns The first matching recording or undefined
 */
export const findMatchingRecording = (
  scenario: Scenario,
  request: RecordedRequest
): Recording | undefined => {
  return scenario.recordings.find((recording) => {
    const methodMatches = recording.request.method === request.method
    const pathMatches = recording.request.path === request.path
    return methodMatches && pathMatches
  })
}
