import { describe, it, expect } from 'vitest'
import { matchMethod, findMatchingMock } from './mock'
import type { Mock, MockRequest, HttpMethod } from './types'

describe('matchMethod', () => {
  it('should match exact HTTP method', () => {
    expect(matchMethod('GET', 'GET')).toBe(true)
    expect(matchMethod('POST', 'POST')).toBe(true)
  })

  it('should be case-insensitive', () => {
    expect(matchMethod('GET', 'get' as HttpMethod)).toBe(true)
    expect(matchMethod('POST', 'post' as HttpMethod)).toBe(true)
  })

  it('should not match different methods', () => {
    expect(matchMethod('GET', 'POST')).toBe(false)
    expect(matchMethod('POST', 'DELETE')).toBe(false)
  })
})

describe('findMatchingMock', () => {
  const mockGET: Mock = {
    id: '1',
    pattern: '/users',
    method: 'GET',
    response: { status: 200, body: { users: [] } },
  }

  const mockPOST: Mock = {
    id: '2',
    pattern: '/users',
    method: 'POST',
    response: { status: 201, body: { id: 1 } },
  }

  const mockWithParams: Mock = {
    id: '3',
    pattern: '/users/:id',
    method: 'GET',
    response: { status: 200, body: { id: 123 } },
  }

  const mockWithWildcard: Mock = {
    id: '4',
    pattern: '/api/*',
    method: 'GET',
    response: { status: 200, body: {} },
  }

  const mocks: Mock[] = [mockGET, mockPOST, mockWithParams, mockWithWildcard]

  it('should find mock by exact path and method', () => {
    const request: MockRequest = {
      method: 'GET',
      path: '/users',
    }
    const result = findMatchingMock(mocks, request)
    expect(result).toEqual(mockGET)
  })

  it('should find mock by method when multiple paths match', () => {
    const request: MockRequest = {
      method: 'POST',
      path: '/users',
    }
    const result = findMatchingMock(mocks, request)
    expect(result).toEqual(mockPOST)
  })

  it('should find mock with path parameters', () => {
    const request: MockRequest = {
      method: 'GET',
      path: '/users/456',
    }
    const result = findMatchingMock(mocks, request)
    expect(result).toEqual(mockWithParams)
  })

  it('should find mock with wildcard', () => {
    const request: MockRequest = {
      method: 'GET',
      path: '/api/v1/users',
    }
    const result = findMatchingMock(mocks, request)
    expect(result).toEqual(mockWithWildcard)
  })

  it('should return undefined when no mock matches', () => {
    const request: MockRequest = {
      method: 'DELETE',
      path: '/posts',
    }
    const result = findMatchingMock(mocks, request)
    expect(result).toBeUndefined()
  })

  it('should return first matching mock when multiple match', () => {
    const request: MockRequest = {
      method: 'GET',
      path: '/api/users',
    }
    // Both mockWithWildcard and potentially others could match
    // Should return the first one that matches
    const result = findMatchingMock(mocks, request)
    expect(result).toEqual(mockWithWildcard)
  })

  it('should handle empty mocks array', () => {
    const request: MockRequest = {
      method: 'GET',
      path: '/users',
    }
    const result = findMatchingMock([], request)
    expect(result).toBeUndefined()
  })
})
