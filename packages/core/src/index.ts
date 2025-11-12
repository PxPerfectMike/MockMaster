// Core mocking engine
// This will be the main entry point for the core package

// Type definitions
export * from './types'

// Path matching utilities
export { matchPath, parsePathParams, createMatcher } from './match'

// Export aliases for backward compatibility with documentation
export { parsePathParams as extractParams } from './match'

// Mock management utilities
export { matchMethod, findMatchingMock } from './mock'
