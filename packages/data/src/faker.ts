// Functional wrapper around Faker.js for generating realistic test data

import { faker } from '@faker-js/faker'

/**
 * Sets a seed for reproducible fake data generation
 * @param seed - Numeric seed value
 */
export const setSeed = (seed: number): void => {
  faker.seed(seed)
}

/**
 * Resets the seed to random generation
 */
export const resetSeed = (): void => {
  faker.seed()
}

/**
 * Functional API for generating fake data
 */
export const fake = {
  /**
   * Generates a full name
   */
  name: (): string => faker.person.fullName(),

  /**
   * Generates a first name
   */
  firstName: (): string => faker.person.firstName(),

  /**
   * Generates a last name
   */
  lastName: (): string => faker.person.lastName(),

  /**
   * Generates an email address
   */
  email: (): string => faker.internet.email(),

  /**
   * Generates a UUID
   */
  uuid: (): string => faker.string.uuid(),

  /**
   * Generates a number within a range
   * @param options - Min and max values
   */
  number: (options?: { min?: number; max?: number }): number => {
    return faker.number.int({
      min: options?.min ?? 0,
      max: options?.max ?? 100,
    })
  },

  /**
   * Generates a boolean value
   */
  boolean: (): boolean => faker.datatype.boolean(),

  /**
   * Date generation functions
   */
  date: {
    /**
     * Generates a past date
     */
    past: (): Date => faker.date.past(),

    /**
     * Generates a future date
     */
    future: (): Date => faker.date.future(),

    /**
     * Generates a date between two dates
     */
    between: (start: Date, end: Date): Date => faker.date.between({ from: start, to: end }),

    /**
     * Generates a recent date (within last few days)
     */
    recent: (): Date => faker.date.recent(),
  },

  /**
   * Internet-related generation functions
   */
  internet: {
    /**
     * Generates a URL
     */
    url: (): string => faker.internet.url(),

    /**
     * Generates a username
     */
    username: (): string => faker.internet.userName(),
  },
}
