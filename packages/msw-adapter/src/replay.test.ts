import { describe, it, expect, beforeEach } from 'vitest'
import { createReplayHandler, matchRequest } from './replay'
import { createScenario, createRecording, addRecordingToScenario } from './recorder'
import type { RecordedRequest, RecordedResponse, Scenario } from './types'

describe('matchRequest', () => {
  it('should match request by method and path', () => {
    const recorded: RecordedRequest = {
      method: 'GET',
      url: 'https://api.example.com/users',
      path: '/users',
      timestamp: Date.now(),
    }

    const incoming = {
      method: 'GET',
      path: '/users',
    }

    expect(matchRequest(recorded, incoming)).toBe(true)
  })

  it('should not match different methods', () => {
    const recorded: RecordedRequest = {
      method: 'GET',
      url: 'https://api.example.com/users',
      path: '/users',
      timestamp: Date.now(),
    }

    const incoming = {
      method: 'POST',
      path: '/users',
    }

    expect(matchRequest(recorded, incoming)).toBe(false)
  })

  it('should not match different paths', () => {
    const recorded: RecordedRequest = {
      method: 'GET',
      url: 'https://api.example.com/users',
      path: '/users',
      timestamp: Date.now(),
    }

    const incoming = {
      method: 'GET',
      path: '/posts',
    }

    expect(matchRequest(recorded, incoming)).toBe(false)
  })

  it('should match path with query params', () => {
    const recorded: RecordedRequest = {
      method: 'GET',
      url: 'https://api.example.com/users?page=1',
      path: '/users',
      query: { page: '1' },
      timestamp: Date.now(),
    }

    const incoming = {
      method: 'GET',
      path: '/users',
    }

    // Basic matching ignores query params
    expect(matchRequest(recorded, incoming)).toBe(true)
  })

  it('should match path with parameters (pattern matching)', () => {
    const recorded: RecordedRequest = {
      method: 'GET',
      url: 'https://api.example.com/users/123',
      path: '/users/:id',
      timestamp: Date.now(),
    }

    const incoming = {
      method: 'GET',
      path: '/users/123',
    }

    expect(matchRequest(recorded, incoming)).toBe(true)
  })

  it('should match different IDs with same parameter pattern', () => {
    const recorded: RecordedRequest = {
      method: 'GET',
      url: 'https://api.example.com/users/123',
      path: '/users/:id',
      timestamp: Date.now(),
    }

    const incoming = {
      method: 'GET',
      path: '/users/456',
    }

    expect(matchRequest(recorded, incoming)).toBe(true)
  })

  it('should match multiple path parameters', () => {
    const recorded: RecordedRequest = {
      method: 'GET',
      url: 'https://api.example.com/users/1/posts/5',
      path: '/users/:userId/posts/:postId',
      timestamp: Date.now(),
    }

    const incoming = {
      method: 'GET',
      path: '/users/99/posts/88',
    }

    expect(matchRequest(recorded, incoming)).toBe(true)
  })
})

describe('createReplayHandler', () => {
  let scenario: Scenario

  beforeEach(() => {
    scenario = createScenario('test-scenario')

    // Add test recordings
    const getUsersRequest: RecordedRequest = {
      method: 'GET',
      url: 'https://api.example.com/users',
      path: '/users',
      timestamp: Date.now(),
    }

    const getUsersResponse: RecordedResponse = {
      status: 200,
      body: [
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' },
      ],
      headers: { 'Content-Type': 'application/json' },
      timestamp: Date.now(),
    }

    const getUser1Request: RecordedRequest = {
      method: 'GET',
      url: 'https://api.example.com/users/1',
      path: '/users/1',
      timestamp: Date.now(),
    }

    const getUser1Response: RecordedResponse = {
      status: 200,
      body: { id: 1, name: 'John' },
      headers: { 'Content-Type': 'application/json' },
      timestamp: Date.now(),
    }

    const postUserRequest: RecordedRequest = {
      method: 'POST',
      url: 'https://api.example.com/users',
      path: '/users',
      body: { name: 'Bob' },
      timestamp: Date.now(),
    }

    const postUserResponse: RecordedResponse = {
      status: 201,
      body: { id: 3, name: 'Bob' },
      headers: { 'Content-Type': 'application/json' },
      timestamp: Date.now(),
    }

    scenario = addRecordingToScenario(scenario, createRecording(getUsersRequest, getUsersResponse))
    scenario = addRecordingToScenario(scenario, createRecording(getUser1Request, getUser1Response))
    scenario = addRecordingToScenario(scenario, createRecording(postUserRequest, postUserResponse))
  })

  it('should create a handler function', () => {
    const handler = createReplayHandler(scenario)

    expect(typeof handler).toBe('function')
  })

  it('should return matching response for GET request', () => {
    const handler = createReplayHandler(scenario)

    const request = {
      method: 'GET',
      path: '/users',
    }

    const response = handler(request)

    expect(response).toBeDefined()
    expect(response?.status).toBe(200)
    expect(response?.body).toEqual([
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' },
    ])
  })

  it('should return matching response for POST request', () => {
    const handler = createReplayHandler(scenario)

    const request = {
      method: 'POST',
      path: '/users',
    }

    const response = handler(request)

    expect(response).toBeDefined()
    expect(response?.status).toBe(201)
    expect(response?.body).toEqual({ id: 3, name: 'Bob' })
  })

  it('should return undefined for non-matching request', () => {
    const handler = createReplayHandler(scenario)

    const request = {
      method: 'DELETE',
      path: '/users/99',
    }

    const response = handler(request)

    expect(response).toBeUndefined()
  })

  it('should return first match when multiple recordings match', () => {
    const handler = createReplayHandler(scenario)

    const request = {
      method: 'GET',
      path: '/users',
    }

    const response = handler(request)

    // Should return the first matching recording
    expect(response?.body).toEqual([
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' },
    ])
  })

  it('should include headers in response', () => {
    const handler = createReplayHandler(scenario)

    const request = {
      method: 'GET',
      path: '/users',
    }

    const response = handler(request)

    expect(response?.headers).toEqual({ 'Content-Type': 'application/json' })
  })
})
