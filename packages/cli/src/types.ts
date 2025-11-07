// CLI types and configuration

/**
 * Mock Master configuration
 */
export interface MockMasterConfig {
  /**
   * Directory where scenarios are stored
   */
  scenariosDir: string

  /**
   * Default base URL for recording
   */
  baseUrl?: string

  /**
   * OpenAPI spec paths to generate from
   */
  specs?: string[]
}

/**
 * Options for generating mocks from OpenAPI spec
 */
export interface GenerateOptions {
  /**
   * Path to OpenAPI spec file
   */
  specPath: string

  /**
   * Output directory for generated mocks
   */
  outputDir: string

  /**
   * Scenario name
   */
  scenarioName: string
}

/**
 * Options for listing scenarios
 */
export interface ListOptions {
  /**
   * Scenarios directory
   */
  scenariosDir: string

  /**
   * Show detailed information
   */
  verbose?: boolean
}

/**
 * Scenario metadata for listing
 */
export interface ScenarioMetadata {
  name: string
  description?: string
  recordingsCount: number
  createdAt: number
  updatedAt: number
  filePath: string
}
