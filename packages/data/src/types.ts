// Types for factory system

/**
 * Factory definition - describes how to build an entity
 */
export interface Factory<T> {
  name: string
  definition: FactoryDefinition<T>
  sequences: Map<string, number>
}

/**
 * Factory definition can have static values or dynamic functions
 */
export type FactoryDefinition<T> = {
  [K in keyof T]: T[K] | ((context: FactoryContext) => T[K])
}

/**
 * Context passed to factory functions
 */
export interface FactoryContext {
  sequence: (name?: string) => number
}

/**
 * Options for building entities
 */
export interface BuildOptions<T> {
  overrides?: Partial<T>
  trait?: string
}

/**
 * Trait definition - named variations of a factory
 */
export interface Trait<T> {
  name: string
  overrides: Partial<FactoryDefinition<T>>
}
