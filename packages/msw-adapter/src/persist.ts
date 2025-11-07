// Pure functions for persisting and loading scenarios

import type { Recording, Scenario } from './types'

/**
 * Serializes a recording to a JSON string
 * @param recording - The recording to serialize
 * @returns JSON string representation
 */
export const serializeRecording = (recording: Recording): string => {
  return JSON.stringify(recording, null, 2)
}

/**
 * Deserializes a recording from a JSON string
 * @param json - The JSON string to deserialize
 * @returns The deserialized recording
 */
export const deserializeRecording = (json: string): Recording => {
  return JSON.parse(json) as Recording
}

/**
 * Serializes a scenario to a JSON string
 * @param scenario - The scenario to serialize
 * @returns JSON string representation
 */
export const serializeScenario = (scenario: Scenario): string => {
  return JSON.stringify(scenario, null, 2)
}

/**
 * Deserializes a scenario from a JSON string
 * @param json - The JSON string to deserialize
 * @returns The deserialized scenario
 */
export const deserializeScenario = (json: string): Scenario => {
  return JSON.parse(json) as Scenario
}
