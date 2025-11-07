import { describe, it, expect } from 'vitest'
import {
  serializeScenario,
  deserializeScenario,
  serializeRecording,
  deserializeRecording,
} from './persist'
import { createScenario, createRecording, addRecordingToScenario } from './recorder'
import type { RecordedRequest, RecordedResponse } from './types'

describe('serializeRecording', () => {
  it('should serialize a recording to JSON string', () => {
    const request: RecordedRequest = {
      method: 'GET',
      url: 'https://api.example.com/users',
      path: '/users',
      timestamp: 1234567890,
    }

    const response: RecordedResponse = {
      status: 200,
      body: [{ id: 1, name: 'John' }],
      timestamp: 1234567891,
    }

    const recording = createRecording(request, response)
    const serialized = serializeRecording(recording)

    expect(typeof serialized).toBe('string')
    expect(JSON.parse(serialized)).toHaveProperty('id')
    expect(JSON.parse(serialized)).toHaveProperty('request')
    expect(JSON.parse(serialized)).toHaveProperty('response')
  })

  it('should produce valid JSON', () => {
    const request: RecordedRequest = {
      method: 'POST',
      url: 'https://api.example.com/users',
      path: '/users',
      body: { name: 'Jane' },
      timestamp: 1234567890,
    }

    const response: RecordedResponse = {
      status: 201,
      body: { id: 2, name: 'Jane' },
      timestamp: 1234567891,
    }

    const recording = createRecording(request, response)
    const serialized = serializeRecording(recording)

    expect(() => JSON.parse(serialized)).not.toThrow()
  })
})

describe('deserializeRecording', () => {
  it('should deserialize a JSON string to a recording', () => {
    const request: RecordedRequest = {
      method: 'GET',
      url: 'https://api.example.com/users',
      path: '/users',
      timestamp: 1234567890,
    }

    const response: RecordedResponse = {
      status: 200,
      body: [{ id: 1, name: 'John' }],
      timestamp: 1234567891,
    }

    const original = createRecording(request, response)
    const serialized = serializeRecording(original)
    const deserialized = deserializeRecording(serialized)

    expect(deserialized).toEqual(original)
  })

  it('should handle recordings with complex bodies', () => {
    const request: RecordedRequest = {
      method: 'POST',
      url: 'https://api.example.com/users',
      path: '/users',
      body: {
        name: 'Jane',
        address: {
          street: '123 Main St',
          city: 'New York',
        },
        tags: ['admin', 'developer'],
      },
      timestamp: 1234567890,
    }

    const response: RecordedResponse = {
      status: 201,
      body: {
        id: 2,
        name: 'Jane',
        address: {
          street: '123 Main St',
          city: 'New York',
        },
        tags: ['admin', 'developer'],
      },
      timestamp: 1234567891,
    }

    const original = createRecording(request, response)
    const serialized = serializeRecording(original)
    const deserialized = deserializeRecording(serialized)

    expect(deserialized).toEqual(original)
    expect(deserialized.request.body).toEqual(original.request.body)
    expect(deserialized.response.body).toEqual(original.response.body)
  })
})

describe('serializeScenario', () => {
  it('should serialize an empty scenario', () => {
    const scenario = createScenario('test-scenario', 'Test description')
    const serialized = serializeScenario(scenario)

    expect(typeof serialized).toBe('string')
    const parsed = JSON.parse(serialized)
    expect(parsed.name).toBe('test-scenario')
    expect(parsed.description).toBe('Test description')
    expect(parsed.recordings).toEqual([])
  })

  it('should serialize a scenario with recordings', () => {
    let scenario = createScenario('user-crud')

    const request: RecordedRequest = {
      method: 'GET',
      url: 'https://api.example.com/users',
      path: '/users',
      timestamp: 1234567890,
    }

    const response: RecordedResponse = {
      status: 200,
      body: [{ id: 1, name: 'John' }],
      timestamp: 1234567891,
    }

    const recording = createRecording(request, response)
    scenario = addRecordingToScenario(scenario, recording)

    const serialized = serializeScenario(scenario)
    const parsed = JSON.parse(serialized)

    expect(parsed.recordings).toHaveLength(1)
    expect(parsed.recordings[0].request.method).toBe('GET')
  })
})

describe('deserializeScenario', () => {
  it('should deserialize an empty scenario', () => {
    const original = createScenario('test-scenario', 'Test description')
    const serialized = serializeScenario(original)
    const deserialized = deserializeScenario(serialized)

    expect(deserialized).toEqual(original)
  })

  it('should deserialize a scenario with recordings', () => {
    let scenario = createScenario('user-crud')

    const request: RecordedRequest = {
      method: 'GET',
      url: 'https://api.example.com/users',
      path: '/users',
      timestamp: 1234567890,
    }

    const response: RecordedResponse = {
      status: 200,
      body: [{ id: 1, name: 'John' }],
      timestamp: 1234567891,
    }

    const recording = createRecording(request, response)
    scenario = addRecordingToScenario(scenario, recording)

    const serialized = serializeScenario(scenario)
    const deserialized = deserializeScenario(serialized)

    expect(deserialized).toEqual(scenario)
    expect(deserialized.recordings).toHaveLength(1)
    expect(deserialized.recordings[0].request.method).toBe('GET')
  })

  it('should roundtrip correctly (serialize -> deserialize -> serialize)', () => {
    let scenario = createScenario('roundtrip-test')

    const request: RecordedRequest = {
      method: 'POST',
      url: 'https://api.example.com/users',
      path: '/users',
      body: { name: 'Test User' },
      headers: { 'Content-Type': 'application/json' },
      timestamp: 1234567890,
    }

    const response: RecordedResponse = {
      status: 201,
      body: { id: 1, name: 'Test User' },
      headers: { 'Content-Type': 'application/json' },
      timestamp: 1234567891,
    }

    const recording = createRecording(request, response)
    scenario = addRecordingToScenario(scenario, recording)

    const serialized1 = serializeScenario(scenario)
    const deserialized = deserializeScenario(serialized1)
    const serialized2 = serializeScenario(deserialized)

    expect(serialized1).toBe(serialized2)
  })
})
