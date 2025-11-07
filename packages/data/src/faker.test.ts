import { describe, it, expect, beforeEach } from 'vitest'
import { fake, setSeed, resetSeed } from './faker'

describe('fake - basic data generation', () => {
  beforeEach(() => {
    resetSeed()
  })

  it('should generate realistic names', () => {
    const name1 = fake.name()
    const name2 = fake.name()

    expect(typeof name1).toBe('string')
    expect(name1.length).toBeGreaterThan(0)
    expect(typeof name2).toBe('string')
    expect(name1).not.toBe(name2) // Should be different (unless seed is set)
  })

  it('should generate realistic emails', () => {
    const email = fake.email()

    expect(typeof email).toBe('string')
    expect(email).toMatch(/^[\w.+-]+@[\w.-]+\.[a-z]{2,}$/i)
  })

  it('should generate first names', () => {
    const firstName = fake.firstName()

    expect(typeof firstName).toBe('string')
    expect(firstName.length).toBeGreaterThan(0)
  })

  it('should generate last names', () => {
    const lastName = fake.lastName()

    expect(typeof lastName).toBe('string')
    expect(lastName.length).toBeGreaterThan(0)
  })

  it('should generate UUIDs', () => {
    const uuid = fake.uuid()

    expect(typeof uuid).toBe('string')
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
  })

  it('should generate different UUIDs', () => {
    const uuid1 = fake.uuid()
    const uuid2 = fake.uuid()

    expect(uuid1).not.toBe(uuid2)
  })

  it('should generate numbers in range', () => {
    const num = fake.number({ min: 1, max: 10 })

    expect(num).toBeGreaterThanOrEqual(1)
    expect(num).toBeLessThanOrEqual(10)
  })

  it('should generate boolean values', () => {
    const bool = fake.boolean()

    expect(typeof bool).toBe('boolean')
  })
})

describe('fake - dates', () => {
  beforeEach(() => {
    resetSeed()
  })

  it('should generate past dates', () => {
    const date = fake.date.past()
    const now = new Date()

    expect(date).toBeInstanceOf(Date)
    expect(date.getTime()).toBeLessThan(now.getTime())
  })

  it('should generate future dates', () => {
    const date = fake.date.future()
    const now = new Date()

    expect(date).toBeInstanceOf(Date)
    expect(date.getTime()).toBeGreaterThan(now.getTime())
  })

  it('should generate dates between range', () => {
    const start = new Date('2020-01-01')
    const end = new Date('2020-12-31')
    const date = fake.date.between(start, end)

    expect(date).toBeInstanceOf(Date)
    expect(date.getTime()).toBeGreaterThanOrEqual(start.getTime())
    expect(date.getTime()).toBeLessThanOrEqual(end.getTime())
  })

  it('should generate recent dates', () => {
    const date = fake.date.recent()
    const now = new Date()
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)

    expect(date).toBeInstanceOf(Date)
    expect(date.getTime()).toBeGreaterThan(twoDaysAgo.getTime())
    expect(date.getTime()).toBeLessThanOrEqual(now.getTime())
  })
})

describe('fake - internet', () => {
  beforeEach(() => {
    resetSeed()
  })

  it('should generate URLs', () => {
    const url = fake.internet.url()

    expect(typeof url).toBe('string')
    expect(url).toMatch(/^https?:\/\/.+/)
  })

  it('should generate usernames', () => {
    const username = fake.internet.username()

    expect(typeof username).toBe('string')
    expect(username.length).toBeGreaterThan(0)
  })
})

describe('setSeed - reproducibility', () => {
  it('should generate same values with same seed', () => {
    setSeed(12345)
    const name1 = fake.name()
    const email1 = fake.email()

    setSeed(12345)
    const name2 = fake.name()
    const email2 = fake.email()

    expect(name1).toBe(name2)
    expect(email1).toBe(email2)
  })

  it('should generate different values with different seeds', () => {
    setSeed(12345)
    const name1 = fake.name()

    setSeed(54321)
    const name2 = fake.name()

    expect(name1).not.toBe(name2)
  })

  it('should generate deterministic sequences', () => {
    setSeed(99999)
    const values1 = [fake.name(), fake.email(), fake.uuid()]

    setSeed(99999)
    const values2 = [fake.name(), fake.email(), fake.uuid()]

    expect(values1).toEqual(values2)
  })
})

describe('resetSeed', () => {
  it('should reset to random generation', () => {
    setSeed(12345)
    const name1 = fake.name()

    resetSeed()
    setSeed(12345)
    const name2 = fake.name()

    // After reset and reseeding, should get same value again
    expect(name1).toBe(name2)
  })
})

describe('integration with factory', () => {
  beforeEach(() => {
    resetSeed()
  })

  it('should work with factory definitions', () => {
    // This test demonstrates how fake works with factories
    interface User {
      name: string
      email: string
      age: number
    }

    // Simulating factory usage
    const user: User = {
      name: fake.name(),
      email: fake.email(),
      age: fake.number({ min: 18, max: 80 }),
    }

    expect(user.name).toBeTruthy()
    expect(user.email).toMatch(/@/)
    expect(user.age).toBeGreaterThanOrEqual(18)
    expect(user.age).toBeLessThanOrEqual(80)
  })
})
