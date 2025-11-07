import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { writeScenario, readScenario, listScenarios, deleteScenario, ensureScenarioDir } from './fs'
import { createScenario, createRecording, addRecordingToScenario } from '@mock-master/msw-adapter'
import type { RecordedRequest, RecordedResponse } from '@mock-master/msw-adapter'
import * as fs from 'fs-extra'
import * as path from 'path'

const TEST_DIR = path.join(__dirname, '../.test-scenarios')

describe('File System Operations', () => {
  beforeEach(async () => {
    // Clean up test directory before each test
    await fs.remove(TEST_DIR)
  })

  afterEach(async () => {
    // Clean up test directory after each test
    await fs.remove(TEST_DIR)
  })

  describe('ensureScenarioDir', () => {
    it('should create directory if it does not exist', async () => {
      await ensureScenarioDir(TEST_DIR)
      const exists = await fs.pathExists(TEST_DIR)
      expect(exists).toBe(true)
    })

    it('should not error if directory already exists', async () => {
      await ensureScenarioDir(TEST_DIR)
      await expect(ensureScenarioDir(TEST_DIR)).resolves.not.toThrow()
    })
  })

  describe('writeScenario', () => {
    it('should write a scenario to a file', async () => {
      const scenario = createScenario('test-scenario', 'Test description')

      await writeScenario(TEST_DIR, scenario)

      const filePath = path.join(TEST_DIR, 'test-scenario.json')
      const exists = await fs.pathExists(filePath)
      expect(exists).toBe(true)
    })

    it('should write scenario with recordings', async () => {
      let scenario = createScenario('user-api')

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

      scenario = addRecordingToScenario(scenario, createRecording(request, response))

      await writeScenario(TEST_DIR, scenario)

      const filePath = path.join(TEST_DIR, 'user-api.json')
      const content = await fs.readFile(filePath, 'utf-8')
      const parsed = JSON.parse(content)

      expect(parsed.name).toBe('user-api')
      expect(parsed.recordings).toHaveLength(1)
    })

    it('should create scenarios directory if it does not exist', async () => {
      const scenario = createScenario('test-scenario')

      await writeScenario(TEST_DIR, scenario)

      const exists = await fs.pathExists(TEST_DIR)
      expect(exists).toBe(true)
    })
  })

  describe('readScenario', () => {
    it('should read a scenario from a file', async () => {
      const original = createScenario('test-scenario', 'Test description')
      await writeScenario(TEST_DIR, original)

      const loaded = await readScenario(TEST_DIR, 'test-scenario')

      expect(loaded).toBeDefined()
      expect(loaded?.name).toBe('test-scenario')
      expect(loaded?.description).toBe('Test description')
    })

    it('should return undefined for non-existent scenario', async () => {
      const loaded = await readScenario(TEST_DIR, 'non-existent')

      expect(loaded).toBeUndefined()
    })

    it('should read scenario with recordings', async () => {
      let scenario = createScenario('user-api')

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

      scenario = addRecordingToScenario(scenario, createRecording(request, response))
      await writeScenario(TEST_DIR, scenario)

      const loaded = await readScenario(TEST_DIR, 'user-api')

      expect(loaded?.recordings).toHaveLength(1)
      expect(loaded?.recordings[0].request.method).toBe('GET')
    })
  })

  describe('listScenarios', () => {
    it('should return empty array when no scenarios exist', async () => {
      await ensureScenarioDir(TEST_DIR)

      const scenarios = await listScenarios(TEST_DIR)

      expect(scenarios).toEqual([])
    })

    it('should list all scenarios in directory', async () => {
      const scenario1 = createScenario('scenario-1')
      const scenario2 = createScenario('scenario-2')

      await writeScenario(TEST_DIR, scenario1)
      await writeScenario(TEST_DIR, scenario2)

      const scenarios = await listScenarios(TEST_DIR)

      expect(scenarios).toHaveLength(2)
      expect(scenarios.map((s) => s.name)).toContain('scenario-1')
      expect(scenarios.map((s) => s.name)).toContain('scenario-2')
    })

    it('should include metadata in scenario listing', async () => {
      let scenario = createScenario('test-scenario', 'Test description')

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

      scenario = addRecordingToScenario(scenario, createRecording(request, response))
      scenario = addRecordingToScenario(scenario, createRecording(request, response))

      await writeScenario(TEST_DIR, scenario)

      const scenarios = await listScenarios(TEST_DIR)

      expect(scenarios).toHaveLength(1)
      expect(scenarios[0].name).toBe('test-scenario')
      expect(scenarios[0].description).toBe('Test description')
      expect(scenarios[0].recordingsCount).toBe(2)
      expect(scenarios[0].createdAt).toBeGreaterThan(0)
      expect(scenarios[0].filePath).toBeTruthy()
    })
  })

  describe('deleteScenario', () => {
    it('should delete a scenario file', async () => {
      const scenario = createScenario('test-scenario')
      await writeScenario(TEST_DIR, scenario)

      await deleteScenario(TEST_DIR, 'test-scenario')

      const filePath = path.join(TEST_DIR, 'test-scenario.json')
      const exists = await fs.pathExists(filePath)
      expect(exists).toBe(false)
    })

    it('should not error when deleting non-existent scenario', async () => {
      await expect(deleteScenario(TEST_DIR, 'non-existent')).resolves.not.toThrow()
    })
  })
})
