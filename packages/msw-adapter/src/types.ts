// MSW adapter types

/**
 * Represents a recorded HTTP request
 */
export interface RecordedRequest {
  method: string
  url: string
  path: string
  query?: Record<string, string>
  headers?: Record<string, string>
  body?: unknown
  timestamp: number
}

/**
 * Represents a recorded HTTP response
 */
export interface RecordedResponse {
  status: number
  statusText?: string
  headers?: Record<string, string>
  body?: unknown
  timestamp: number
}

/**
 * A recording pairs a request with its response
 */
export interface Recording {
  id: string
  request: RecordedRequest
  response: RecordedResponse
}

/**
 * A scenario is a collection of recordings
 */
export interface Scenario {
  name: string
  description?: string
  recordings: Recording[]
  createdAt: number
  updatedAt: number
}

/**
 * Configuration for the recorder
 */
export interface RecorderConfig {
  /**
   * Base URL to record from
   */
  baseUrl?: string

  /**
   * Whether to pass through unmatched requests to the real API
   */
  passthrough?: boolean

  /**
   * Custom request matcher
   */
  requestMatcher?: (request: RecordedRequest) => boolean
}

/**
 * Mode for the MSW adapter
 */
export type AdapterMode = 'record' | 'replay' | 'passthrough'

/**
 * Configuration for the MSW adapter
 */
export interface AdapterConfig {
  mode: AdapterMode
  scenario?: string
  baseUrl?: string

  /**
   * Function to persist recordings (e.g., to file system)
   */
  persistRecordings?: (scenario: Scenario) => Promise<void>

  /**
   * Function to load recordings (e.g., from file system)
   */
  loadRecordings?: (scenarioName: string) => Promise<Scenario | undefined>
}
