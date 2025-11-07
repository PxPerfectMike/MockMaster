// Pure functions for mock management
import { matchPath } from './match'
import type { Mock, MockRequest, HttpMethod } from './types'

/**
 * Matches an HTTP method (case-insensitive)
 * @param expected - The expected HTTP method
 * @param actual - The actual HTTP method from the request
 * @returns true if methods match
 */
export const matchMethod = (expected: HttpMethod, actual: HttpMethod): boolean => {
  return expected.toUpperCase() === actual.toUpperCase()
}

/**
 * Finds the first mock that matches the given request
 * @param mocks - Array of mocks to search through
 * @param request - The request to match against
 * @returns The first matching mock, or undefined if none match
 */
export const findMatchingMock = (mocks: Mock[], request: MockRequest): Mock | undefined => {
  return mocks.find((mock) => {
    // Check if method matches
    const methodMatches = matchMethod(mock.method, request.method)
    if (!methodMatches) {
      return false
    }

    // Check if path matches
    const pathMatches = matchPath(mock.pattern, request.path)
    return pathMatches
  })
}
