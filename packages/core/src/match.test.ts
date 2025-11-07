import { describe, it, expect } from 'vitest'
import { matchPath, parsePathParams } from './match'

describe('matchPath - Exact Path Matching', () => {
  it('should match exact paths', () => {
    expect(matchPath('/users', '/users')).toBe(true)
  })

  it('should not match different paths', () => {
    expect(matchPath('/users', '/posts')).toBe(false)
  })

  it('should match root path', () => {
    expect(matchPath('/', '/')).toBe(true)
  })

  it('should match nested paths', () => {
    expect(matchPath('/api/users/list', '/api/users/list')).toBe(true)
  })

  it('should be case-sensitive', () => {
    expect(matchPath('/Users', '/users')).toBe(false)
  })

  it('should not match if trailing slash differs', () => {
    expect(matchPath('/users/', '/users')).toBe(false)
    expect(matchPath('/users', '/users/')).toBe(false)
  })
})

describe('matchPath - Path Parameter Matching', () => {
  it('should match path with single parameter', () => {
    expect(matchPath('/users/:id', '/users/123')).toBe(true)
  })

  it('should match path with multiple parameters', () => {
    expect(matchPath('/users/:userId/posts/:postId', '/users/123/posts/456')).toBe(true)
  })

  it('should not match if structure differs', () => {
    expect(matchPath('/users/:id', '/posts/123')).toBe(false)
  })

  it('should not match if parameter position differs', () => {
    expect(matchPath('/users/:id/posts', '/users')).toBe(false)
  })

  it('should match parameter with any value', () => {
    expect(matchPath('/users/:id', '/users/abc-def')).toBe(true)
    expect(matchPath('/users/:id', '/users/123-456-789')).toBe(true)
  })
})

describe('parsePathParams', () => {
  it('should extract single path parameter', () => {
    const params = parsePathParams('/users/:id', '/users/123')
    expect(params).toEqual({ id: '123' })
  })

  it('should extract multiple path parameters', () => {
    const params = parsePathParams('/users/:userId/posts/:postId', '/users/123/posts/456')
    expect(params).toEqual({ userId: '123', postId: '456' })
  })

  it('should return empty object for exact match without parameters', () => {
    const params = parsePathParams('/users', '/users')
    expect(params).toEqual({})
  })

  it('should extract parameters with special characters', () => {
    const params = parsePathParams('/users/:id', '/users/abc-def-123')
    expect(params).toEqual({ id: 'abc-def-123' })
  })

  it('should handle nested parameters', () => {
    const params = parsePathParams('/api/:version/users/:id', '/api/v1/users/123')
    expect(params).toEqual({ version: 'v1', id: '123' })
  })
})

describe('matchPath - Wildcard Matching', () => {
  it('should match wildcard at end of path', () => {
    expect(matchPath('/api/*', '/api/users')).toBe(true)
    expect(matchPath('/api/*', '/api/users/123')).toBe(true)
  })

  it('should match single-level wildcard', () => {
    expect(matchPath('/api/*/users', '/api/v1/users')).toBe(true)
    expect(matchPath('/api/*/users', '/api/v2/users')).toBe(true)
  })

  it('should not match wildcard beyond its scope', () => {
    expect(matchPath('/api/*', '/other/users')).toBe(false)
  })

  it('should match root wildcard', () => {
    expect(matchPath('/*', '/users')).toBe(true)
    expect(matchPath('/*', '/posts')).toBe(true)
  })

  it('should match multiple wildcards', () => {
    expect(matchPath('/*/users/*', '/api/users/123')).toBe(true)
    expect(matchPath('/*/users/*', '/v1/users/456')).toBe(true)
  })

  it('should differentiate between wildcard and exact match', () => {
    expect(matchPath('/api/users', '/api/users/123')).toBe(false)
    expect(matchPath('/api/users/*', '/api/users/123')).toBe(true)
  })
})
