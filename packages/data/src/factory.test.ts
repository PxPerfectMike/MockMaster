import { describe, it, expect, beforeEach } from 'vitest'
import { defineFactory, build, buildList, resetSequences } from './factory'

describe('defineFactory', () => {
  it('should define a factory with static values', () => {
    interface User {
      name: string
      email: string
      age: number
    }

    const userFactory = defineFactory<User>('user', {
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
    })

    expect(userFactory.name).toBe('user')
    expect(userFactory.definition).toEqual({
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
    })
  })

  it('should define a factory with dynamic functions', () => {
    interface User {
      id: number
      name: string
    }

    const userFactory = defineFactory<User>('user', {
      id: (ctx) => ctx.sequence(),
      name: () => 'Dynamic Name',
    })

    expect(userFactory.name).toBe('user')
    expect(typeof userFactory.definition.id).toBe('function')
    expect(typeof userFactory.definition.name).toBe('function')
  })

  it('should initialize sequences map', () => {
    interface User {
      name: string
    }

    const userFactory = defineFactory<User>('user', {
      name: 'John',
    })

    expect(userFactory.sequences).toBeInstanceOf(Map)
    expect(userFactory.sequences.size).toBe(0)
  })
})

describe('build', () => {
  interface User {
    id: number
    name: string
    email: string
    age: number
  }

  let userFactory: ReturnType<typeof defineFactory<User>>

  beforeEach(() => {
    resetSequences()
    userFactory = defineFactory<User>('user', {
      id: (ctx) => ctx.sequence(),
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
    })
  })

  it('should build entity with static values', () => {
    const user = build(userFactory)

    expect(user).toEqual({
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
    })
  })

  it('should build entity with incremented sequence', () => {
    const user1 = build(userFactory)
    const user2 = build(userFactory)
    const user3 = build(userFactory)

    expect(user1.id).toBe(1)
    expect(user2.id).toBe(2)
    expect(user3.id).toBe(3)
  })

  it('should accept overrides', () => {
    const user = build(userFactory, {
      overrides: {
        name: 'Jane Doe',
        age: 25,
      },
    })

    expect(user).toEqual({
      id: 1,
      name: 'Jane Doe',
      email: 'john@example.com',
      age: 25,
    })
  })

  it('should call dynamic functions', () => {
    const factory = defineFactory<User>('user', {
      id: (ctx) => ctx.sequence(),
      name: () => 'Dynamic',
      email: () => 'dynamic@example.com',
      age: () => Math.floor(Math.random() * 50) + 20,
    })

    const user = build(factory)

    expect(user.id).toBe(1)
    expect(user.name).toBe('Dynamic')
    expect(user.email).toBe('dynamic@example.com')
    expect(user.age).toBeGreaterThanOrEqual(20)
    expect(user.age).toBeLessThanOrEqual(70)
  })

  it('should not mutate original factory', () => {
    const user1 = build(userFactory)
    const user2 = build(userFactory)

    // Building shouldn't affect the factory definition
    expect(typeof userFactory.definition.id).toBe('function')
  })
})

describe('buildList', () => {
  interface User {
    id: number
    name: string
  }

  let userFactory: ReturnType<typeof defineFactory<User>>

  beforeEach(() => {
    resetSequences()
    userFactory = defineFactory<User>('user', {
      id: (ctx) => ctx.sequence(),
      name: 'John Doe',
    })
  })

  it('should build multiple entities', () => {
    const users = buildList(userFactory, 3)

    expect(users).toHaveLength(3)
    expect(users[0].id).toBe(1)
    expect(users[1].id).toBe(2)
    expect(users[2].id).toBe(3)
  })

  it('should build empty array when count is 0', () => {
    const users = buildList(userFactory, 0)

    expect(users).toEqual([])
  })

  it('should accept overrides for all entities', () => {
    const users = buildList(userFactory, 2, {
      overrides: {
        name: 'Jane Doe',
      },
    })

    expect(users).toHaveLength(2)
    expect(users[0].name).toBe('Jane Doe')
    expect(users[1].name).toBe('Jane Doe')
    expect(users[0].id).toBe(1)
    expect(users[1].id).toBe(2)
  })

  it('should increment sequences across all built entities', () => {
    const users = buildList(userFactory, 5)

    expect(users.map((u) => u.id)).toEqual([1, 2, 3, 4, 5])
  })
})

describe('sequences', () => {
  interface User {
    id: number
    postId: number
    name: string
  }

  beforeEach(() => {
    resetSequences()
  })

  it('should support named sequences', () => {
    const userFactory = defineFactory<User>('user', {
      id: (ctx) => ctx.sequence('userId'),
      postId: (ctx) => ctx.sequence('postId'),
      name: 'John',
    })

    const user1 = build(userFactory)
    const user2 = build(userFactory)

    expect(user1.id).toBe(1)
    expect(user1.postId).toBe(1)
    expect(user2.id).toBe(2)
    expect(user2.postId).toBe(2)
  })

  it('should maintain separate counters for named sequences', () => {
    const userFactory = defineFactory<User>('user', {
      id: (ctx) => ctx.sequence('userId'),
      postId: (ctx) => ctx.sequence('postId'),
      name: 'John',
    })

    // Build some users
    build(userFactory)
    build(userFactory)

    // Create another factory using same named sequences
    const postFactory = defineFactory<{ id: number; title: string }>('post', {
      id: (ctx) => ctx.sequence('postId'),
      title: 'Post',
    })

    const post = build(postFactory)

    // Should continue from where userFactory left off for postId
    expect(post.id).toBe(3)
  })

  it('should use default sequence when no name provided', () => {
    const factory = defineFactory<{ id: number; code: number }>('item', {
      id: (ctx) => ctx.sequence(),
      code: (ctx) => ctx.sequence(),
    })

    const item1 = build(factory)
    const item2 = build(factory)

    // Both should use same default sequence
    expect(item1.id).toBe(1)
    expect(item1.code).toBe(2)
    expect(item2.id).toBe(3)
    expect(item2.code).toBe(4)
  })
})
