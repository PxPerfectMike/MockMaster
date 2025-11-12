// Pure functions for replaying recorded requests/responses

import { matchPath } from '@mockmaster/core'
import type { RecordedRequest, Scenario } from './types'

/**
 * Simple request type for matching (subset of RecordedRequest)
 */
export interface IncomingRequest {
  method: string
  path: string
}

/**
 * Simple response type for replay
 */
export interface ReplayResponse {
  status: number
  statusText?: string
  headers?: Record<string, string>
  body?: unknown
}

/**
 * Matches an incoming request against a recorded request
 * Uses pattern matching for paths (e.g., /users/:id matches /users/123)
 * @param recorded - The recorded request
 * @param incoming - The incoming request to match
 * @returns True if the requests match
 */
export const matchRequest = (recorded: RecordedRequest, incoming: IncomingRequest): boolean => {
  const methodMatches = recorded.method === incoming.method
  const pathMatches = matchPath(recorded.path, incoming.path)
  return methodMatches && pathMatches
}

/**
 * Creates a replay handler that matches requests against a scenario
 * @param scenario - The scenario containing recordings
 * @returns A function that takes a request and returns a matching response
 */
export const createReplayHandler = (
  scenario: Scenario
): ((request: IncomingRequest) => ReplayResponse | undefined) => {
  return (request: IncomingRequest): ReplayResponse | undefined => {
    // Find a matching recording
    const recording = scenario.recordings.find((rec) => matchRequest(rec.request, request))

    if (!recording) {
      return undefined
    }

    // Convert RecordedResponse to ReplayResponse
    const response: ReplayResponse = {
      status: recording.response.status,
      body: recording.response.body,
    }

    if (recording.response.statusText !== undefined) {
      response.statusText = recording.response.statusText
    }

    if (recording.response.headers !== undefined) {
      response.headers = recording.response.headers
    }

    return response
  }
}
