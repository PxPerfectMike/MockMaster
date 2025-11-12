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
 * Matches @faker-js/faker API structure for consistency
 */
export const fake = {
  /**
   * Person-related generation functions
   */
  person: {
    /**
     * Generates a full name
     */
    fullName: (): string => faker.person.fullName(),

    /**
     * Generates a first name
     */
    firstName: (): string => faker.person.firstName(),

    /**
     * Generates a last name
     */
    lastName: (): string => faker.person.lastName(),

    /**
     * Generates a job title
     */
    jobTitle: (): string => faker.person.jobTitle(),
  },

  /**
   * Internet-related generation functions
   */
  internet: {
    /**
     * Generates an email address
     */
    email: (): string => faker.internet.email(),

    /**
     * Generates a username
     */
    userName: (): string => faker.internet.userName(),

    /**
     * @deprecated Use userName instead (camelCase)
     */
    username: (): string => faker.internet.userName(),

    /**
     * Generates a URL
     */
    url: (): string => faker.internet.url(),

    /**
     * Generates an IPv4 address
     */
    ipv4: (): string => faker.internet.ipv4(),
  },

  /**
   * Number generation functions
   */
  number: {
    /**
     * Generates an integer within a range
     * @param options - Min and max values
     */
    int: (options?: { min?: number; max?: number }): number => {
      return faker.number.int({
        min: options?.min ?? 0,
        max: options?.max ?? 100,
      })
    },
  },

  /**
   * String generation functions
   */
  string: {
    /**
     * Generates a UUID
     */
    uuid: (): string => faker.string.uuid(),
  },

  /**
   * Helper functions
   */
  helpers: {
    /**
     * Picks a random element from an array
     */
    arrayElement: <T>(array: readonly T[]): T => faker.helpers.arrayElement(array),
  },

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

  // Backward compatibility: keep flat API for existing code
  /**
   * @deprecated Use fake.person.fullName() instead
   */
  name: (): string => faker.person.fullName(),

  /**
   * @deprecated Use fake.person.firstName() instead
   */
  firstName: (): string => faker.person.firstName(),

  /**
   * @deprecated Use fake.person.lastName() instead
   */
  lastName: (): string => faker.person.lastName(),

  /**
   * @deprecated Use fake.internet.email() instead
   */
  email: (): string => faker.internet.email(),

  /**
   * @deprecated Use fake.string.uuid() instead
   */
  uuid: (): string => faker.string.uuid(),

  /**
   * Generates a boolean value
   */
  boolean: (): boolean => faker.datatype.boolean(),
}
