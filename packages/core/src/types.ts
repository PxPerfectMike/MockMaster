// Core types for mock-master

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'

export interface MockRequest {
  method: HttpMethod
  path: string
  query?: Record<string, string>
  headers?: Record<string, string>
  body?: unknown
}

export interface MockResponse {
  status: number
  headers?: Record<string, string>
  body?: unknown
  delay?: number
}

export interface Mock {
  id: string
  pattern: string
  method: HttpMethod
  response: MockResponse | ((request: MockRequest) => MockResponse)
}
