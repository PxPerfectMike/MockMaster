// Pure functions for file system operations with scenarios

import * as fs from 'fs-extra'
import * as path from 'path'
import type { Scenario } from '@mock-master/msw-adapter'
import { serializeScenario, deserializeScenario } from '@mock-master/msw-adapter'
import type { ScenarioMetadata } from './types'

/**
 * Ensures the scenarios directory exists
 * @param scenariosDir - Path to scenarios directory
 */
export const ensureScenarioDir = async (scenariosDir: string): Promise<void> => {
  await fs.ensureDir(scenariosDir)
}

/**
 * Gets the file path for a scenario
 * @param scenariosDir - Path to scenarios directory
 * @param scenarioName - Name of the scenario
 * @returns Full path to scenario file
 */
const getScenarioPath = (scenariosDir: string, scenarioName: string): string => {
  return path.join(scenariosDir, `${scenarioName}.json`)
}

/**
 * Writes a scenario to the file system
 * @param scenariosDir - Path to scenarios directory
 * @param scenario - Scenario to write
 */
export const writeScenario = async (scenariosDir: string, scenario: Scenario): Promise<void> => {
  await ensureScenarioDir(scenariosDir)
  const filePath = getScenarioPath(scenariosDir, scenario.name)
  const serialized = serializeScenario(scenario)
  await fs.writeFile(filePath, serialized, 'utf-8')
}

/**
 * Reads a scenario from the file system
 * @param scenariosDir - Path to scenarios directory
 * @param scenarioName - Name of the scenario to read
 * @returns The scenario or undefined if not found
 */
export const readScenario = async (
  scenariosDir: string,
  scenarioName: string
): Promise<Scenario | undefined> => {
  const filePath = getScenarioPath(scenariosDir, scenarioName)

  const exists = await fs.pathExists(filePath)
  if (!exists) {
    return undefined
  }

  const content = await fs.readFile(filePath, 'utf-8')
  return deserializeScenario(content)
}

/**
 * Lists all scenarios in the scenarios directory
 * @param scenariosDir - Path to scenarios directory
 * @returns Array of scenario metadata
 */
export const listScenarios = async (scenariosDir: string): Promise<ScenarioMetadata[]> => {
  const exists = await fs.pathExists(scenariosDir)
  if (!exists) {
    return []
  }

  const files = await fs.readdir(scenariosDir)
  const jsonFiles = files.filter((file) => file.endsWith('.json'))

  const metadata: ScenarioMetadata[] = []

  for (const file of jsonFiles) {
    const filePath = path.join(scenariosDir, file)
    const content = await fs.readFile(filePath, 'utf-8')
    const scenario = deserializeScenario(content)

    const meta: ScenarioMetadata = {
      name: scenario.name,
      recordingsCount: scenario.recordings.length,
      createdAt: scenario.createdAt,
      updatedAt: scenario.updatedAt,
      filePath,
    }

    if (scenario.description !== undefined) {
      meta.description = scenario.description
    }

    metadata.push(meta)
  }

  return metadata
}

/**
 * Deletes a scenario from the file system
 * @param scenariosDir - Path to scenarios directory
 * @param scenarioName - Name of the scenario to delete
 */
export const deleteScenario = async (scenariosDir: string, scenarioName: string): Promise<void> => {
  const filePath = getScenarioPath(scenariosDir, scenarioName)
  await fs.remove(filePath)
}
