// Pure functional factory system for generating test data

import type { Factory, FactoryDefinition, FactoryContext, BuildOptions } from './types'

// Global sequence store (functional approach with closure)
const globalSequences = new Map<string, number>()

/**
 * Gets the next value for a sequence
 * @param name - Optional sequence name (default uses 'default')
 * @returns The next sequence value
 */
const getNextSequence = (name: string = 'default'): number => {
  const current = globalSequences.get(name) ?? 0
  const next = current + 1
  globalSequences.set(name, next)
  return next
}

/**
 * Creates a factory context for building entities
 * @returns Factory context with sequence function
 */
const createContext = (): FactoryContext => ({
  sequence: (name?: string) => getNextSequence(name),
})

/**
 * Defines a factory for creating entities
 * @param name - Factory name
 * @param definition - Factory definition with static values or functions
 * @returns Factory instance
 */
export const defineFactory = <T>(name: string, definition: FactoryDefinition<T>): Factory<T> => {
  return {
    name,
    definition,
    sequences: new Map<string, number>(),
  }
}

/**
 * Builds a single entity from a factory
 * @param factory - The factory to build from
 * @param options - Build options (overrides, traits)
 * @returns Built entity
 */
export const build = <T>(factory: Factory<T>, options?: BuildOptions<T>): T => {
  const context = createContext()
  const result = {} as T

  // Process each key in the definition
  for (const key in factory.definition) {
    const value = factory.definition[key]

    // If it's a function, call it with context
    if (typeof value === 'function') {
      result[key] = (value as (ctx: FactoryContext) => T[typeof key])(context)
    } else {
      // Otherwise use the static value
      result[key] = value as T[typeof key]
    }
  }

  // Apply overrides if provided
  if (options?.overrides) {
    return { ...result, ...options.overrides }
  }

  return result
}

/**
 * Builds multiple entities from a factory
 * @param factory - The factory to build from
 * @param count - Number of entities to build
 * @param options - Build options (overrides, traits)
 * @returns Array of built entities
 */
export const buildList = <T>(
  factory: Factory<T>,
  count: number,
  options?: BuildOptions<T>
): T[] => {
  return Array.from({ length: count }, () => build(factory, options))
}

/**
 * Resets all sequence counters (useful for testing)
 */
export const resetSequences = (): void => {
  globalSequences.clear()
}
