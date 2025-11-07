// OpenAPI types based on OpenAPI 3.0 specification

/**
 * OpenAPI 3.0 Document
 */
export interface OpenAPISpec {
  openapi: string
  info: Info
  paths: Paths
  components?: Components
  servers?: Server[]
}

/**
 * API Information
 */
export interface Info {
  title: string
  version: string
  description?: string
}

/**
 * Server configuration
 */
export interface Server {
  url: string
  description?: string
}

/**
 * Paths object - contains all API endpoints
 */
export type Paths = Record<string, PathItem>

/**
 * Path Item - represents a single API endpoint with multiple operations
 */
export interface PathItem {
  get?: Operation
  post?: Operation
  put?: Operation
  delete?: Operation
  patch?: Operation
  options?: Operation
  head?: Operation
  parameters?: Parameter[]
}

/**
 * Operation - describes a single API operation (e.g., GET /users)
 */
export interface Operation {
  operationId?: string
  summary?: string
  description?: string
  parameters?: Parameter[]
  requestBody?: RequestBody
  responses: Responses
  tags?: string[]
}

/**
 * Parameter definition
 */
export interface Parameter {
  name: string
  in: 'path' | 'query' | 'header' | 'cookie'
  required?: boolean
  schema?: Schema
  description?: string
}

/**
 * Request Body definition
 */
export interface RequestBody {
  required?: boolean
  content: Record<string, MediaType>
}

/**
 * Media Type definition
 */
export interface MediaType {
  schema?: Schema
  example?: unknown
  examples?: Record<string, Example>
}

/**
 * Example definition
 */
export interface Example {
  value: unknown
  summary?: string
  description?: string
}

/**
 * Responses object
 */
export type Responses = Record<string, Response>

/**
 * Response definition
 */
export interface Response {
  description: string
  content?: Record<string, MediaType>
  headers?: Record<string, Header>
}

/**
 * Header definition
 */
export interface Header {
  schema?: Schema
  description?: string
}

/**
 * Components object - reusable schemas, responses, parameters, etc.
 */
export interface Components {
  schemas?: Record<string, Schema>
  responses?: Record<string, Response>
  parameters?: Record<string, Parameter>
  requestBodies?: Record<string, RequestBody>
}

/**
 * JSON Schema definition
 */
export interface Schema {
  type?: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object'
  format?: string
  properties?: Record<string, Schema>
  items?: Schema
  required?: string[]
  enum?: unknown[]
  $ref?: string
  description?: string
  example?: unknown
  default?: unknown
  nullable?: boolean
  allOf?: Schema[]
  oneOf?: Schema[]
  anyOf?: Schema[]
}

/**
 * Parse result wrapper
 */
export interface ParseResult {
  spec: OpenAPISpec
  errors: string[]
}
