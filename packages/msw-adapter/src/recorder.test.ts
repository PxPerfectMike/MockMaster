import { describe, it, expect, beforeEach } from 'vitest'
import { createRecording, createScenario, addRecordingToScenario, findMatchingRecording } from './recorder'
import type { RecordedRequest, RecordedResponse, Scenario } from './types'

describe('createRecording', () => {
  it('should create a recording with id, request, and response', () => {
    const request: RecordedRequest = {
      method: 'GET',
      url: 'https://api.example.com/users',
      path: '/users',
      timestamp: Date.now(),
    }

    const response: RecordedResponse = {
      status: 200,
      body: [{ id: 1, name: 'John' }],
      timestamp: Date.now(),
    }

    const recording = createRecording(request, response)

    expect(recording).toHaveProperty('id')
    expect(recording.id).toBeTruthy()
    expect(recording.request).toEqual(request)
    expect(recording.response).toEqual(response)
  })

  it('should generate unique ids for different recordings', () => {
    const request: RecordedRequest = {
      method: 'GET',
      url: 'https://api.example.com/users',
      path: '/users',
      timestamp: Date.now(),
    }

    const response: RecordedResponse = {
      status: 200,
      body: [],
      timestamp: Date.now(),
    }

    const recording1 = createRecording(request, response)
    const recording2 = createRecording(request, response)

    expect(recording1.id).not.toBe(recording2.id)
  })
})

describe('createScenario', () => {
  it('should create an empty scenario with name and timestamps', () => {
    const name = 'user-crud'
    const scenario = createScenario(name)

    expect(scenario.name).toBe(name)
    expect(scenario.recordings).toEqual([])
    expect(scenario.createdAt).toBeGreaterThan(0)
    expect(scenario.updatedAt).toBeGreaterThan(0)
  })

  it('should accept optional description', () => {
    const name = 'user-crud'
    const description = 'User CRUD operations'
    const scenario = createScenario(name, description)

    expect(scenario.description).toBe(description)
  })
})

describe('addRecordingToScenario', () => {
  let scenario: Scenario

  beforeEach(() => {
    scenario = createScenario('test-scenario')
  })

  it('should add a recording to a scenario', () => {
    const request: RecordedRequest = {
      method: 'GET',
      url: 'https://api.example.com/users',
      path: '/users',
      timestamp: Date.now(),
    }

    const response: RecordedResponse = {
      status: 200,
      body: [],
      timestamp: Date.now(),
    }

    const recording = createRecording(request, response)
    const updated = addRecordingToScenario(scenario, recording)

    expect(updated.recordings).toHaveLength(1)
    expect(updated.recordings[0]).toEqual(recording)
  })

  it('should update the updatedAt timestamp', () => {
    const originalUpdatedAt = scenario.updatedAt
    
    // Wait a tiny bit to ensure timestamp difference
    const request: RecordedRequest = {
      method: 'GET',
      url: 'https://api.example.com/users',
      path: '/users',
      timestamp: Date.now(),
    }

    const response: RecordedResponse = {
      status: 200,
      body: [],
      timestamp: Date.now(),
    }

    const recording = createRecording(request, response)
    const updated = addRecordingToScenario(scenario, recording)

    expect(updated.updatedAt).toBeGreaterThanOrEqual(originalUpdatedAt)
  })

  it('should not mutate the original scenario (immutable)', () => {
    const request: RecordedRequest = {
      method: 'GET',
      url: 'https://api.example.com/users',
      path: '/users',
      timestamp: Date.now(),
    }

    const response: RecordedResponse = {
      status: 200,
      body: [],
      timestamp: Date.now(),
    }

    const recording = createRecording(request, response)
    const updated = addRecordingToScenario(scenario, recording)

    expect(scenario.recordings).toHaveLength(0)
    expect(updated.recordings).toHaveLength(1)
    expect(updated).not.toBe(scenario)
  })
})

describe('findMatchingRecording', () => {
  let scenario: Scenario

  beforeEach(() => {
    scenario = createScenario('test-scenario')

    // Add some recordings
    const getUsersRequest: RecordedRequest = {
      method: 'GET',
      url: 'https://api.example.com/users',
      path: '/users',
      timestamp: Date.now(),
    }

    const getUsersResponse: RecordedResponse = {
      status: 200,
      body: [{ id: 1, name: 'John' }],
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
      timestamp: Date.now(),
    }

    const postUserRequest: RecordedRequest = {
      method: 'POST',
      url: 'https://api.example.com/users',
      path: '/users',
      body: { name: 'Jane' },
      timestamp: Date.now(),
    }

    const postUserResponse: RecordedResponse = {
      status: 201,
      body: { id: 2, name: 'Jane' },
      timestamp: Date.now(),
    }

    scenario = addRecordingToScenario(scenario, createRecording(getUsersRequest, getUsersResponse))
    scenario = addRecordingToScenario(scenario, createRecording(getUser1Request, getUser1Response))
    scenario = addRecordingToScenario(scenario, createRecording(postUserRequest, postUserResponse))
  })

  it('should find recording by exact method and path match', () => {
    const request: RecordedRequest = {
      method: 'GET',
      url: 'https://api.example.com/users',
      path: '/users',
      timestamp: Date.now(),
    }

    const recording = findMatchingRecording(scenario, request)

    expect(recording).toBeDefined()
    expect(recording?.request.method).toBe('GET')
    expect(recording?.request.path).toBe('/users')
  })

  it('should return undefined when no match found', () => {
    const request: RecordedRequest = {
      method: 'DELETE',
      url: 'https://api.example.com/users/99',
      path: '/users/99',
      timestamp: Date.now(),
    }

    const recording = findMatchingRecording(scenario, request)

    expect(recording).toBeUndefined()
  })

  it('should match by method and path regardless of query params', () => {
    const request: RecordedRequest = {
      method: 'GET',
      url: 'https://api.example.com/users?page=2',
      path: '/users',
      query: { page: '2' },
      timestamp: Date.now(),
    }

    const recording = findMatchingRecording(scenario, request)

    expect(recording).toBeDefined()
    expect(recording?.request.path).toBe('/users')
  })

  it('should return the first match when multiple recordings match', () => {
    const request: RecordedRequest = {
      method: 'GET',
      url: 'https://api.example.com/users',
      path: '/users',
      timestamp: Date.now(),
    }

    const recording = findMatchingRecording(scenario, request)

    expect(recording).toBeDefined()
    // Should be the first recording we added
    expect(recording?.response.body).toEqual([{ id: 1, name: 'John' }])
  })
})
