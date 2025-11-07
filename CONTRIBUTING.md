# Contributing to mock-master

Thank you for your interest in contributing to mock-master! This project is built with Test-Driven Development, functional programming, and a commitment to code quality.

## 🎯 Development Philosophy

### 1. Test-Driven Development (TDD)

**We write tests FIRST**, always following the RED → GREEN → REFACTOR cycle:

1. **RED** - Write a failing test
2. **GREEN** - Write minimal code to pass the test
3. **REFACTOR** - Improve code quality while keeping tests green
4. **REPEAT** - For every single feature

**Example:**
```typescript
// 1. RED - Write failing test
describe('matchPath', () => {
  it('should match exact paths', () => {
    expect(matchPath('/users', '/users')).toBe(true)
  })
})

// 2. GREEN - Implement minimal solution
export const matchPath = (pattern: string, path: string): boolean => {
  return pattern === path
}

// 3. REFACTOR - Improve if needed (already clean!)
```

### 2. Functional Programming

We embrace functional programming principles:

- **Pure Functions** - No side effects, predictable behavior
- **Immutability** - Never mutate data, use spread operators
- **Composition** - Small functions that compose together
- **No Classes** - Use functions and plain objects

**✅ Good:**
```typescript
export const addRecordingToScenario = (
  scenario: Scenario,
  recording: Recording
): Scenario => {
  return {
    ...scenario,
    recordings: [...scenario.recordings, recording],
    updatedAt: Date.now(),
  }
}
```

**❌ Bad:**
```typescript
export class Scenario {
  addRecording(recording: Recording) {
    this.recordings.push(recording) // Mutation!
    this.updatedAt = Date.now()
  }
}
```

### 3. Type Safety

- **Strict TypeScript** with no escape hatches
- **No `any` types** - use `unknown` if truly needed
- **Explicit return types** on exported functions
- **exactOptionalPropertyTypes** - handle optional properties carefully

**✅ Good:**
```typescript
export const createScenario = (name: string, description?: string): Scenario => {
  const scenario: Scenario = {
    name,
    recordings: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  
  if (description !== undefined) {
    scenario.description = description
  }
  
  return scenario
}
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ 
- **pnpm** 8+ (we use pnpm workspaces)

### Setup

```bash
# Clone the repository
git clone https://github.com/your-username/mock-master
cd mock-master

# Install dependencies
pnpm install

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Check coverage
pnpm test:coverage

# Build all packages
pnpm build

# Type check
pnpm typecheck

# Lint
pnpm lint
```

## 📝 Making Changes

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 2. Write Tests First

Before writing any implementation code, write tests:

```typescript
// packages/your-package/src/your-feature.test.ts
import { describe, it, expect } from 'vitest'
import { yourFeature } from './your-feature'

describe('yourFeature', () => {
  it('should do something useful', () => {
    const result = yourFeature('input')
    expect(result).toBe('expected output')
  })
})
```

### 3. Run Tests (Watch Them Fail)

```bash
cd packages/your-package
pnpm test:watch
```

You should see RED (failing tests).

### 4. Implement the Feature

Write minimal code to make tests pass:

```typescript
// packages/your-package/src/your-feature.ts
export const yourFeature = (input: string): string => {
  return 'expected output'
}
```

### 5. See Tests Pass (GREEN)

Your tests should now pass!

### 6. Refactor

Improve code quality while keeping tests green:

- Extract common logic
- Improve naming
- Simplify complex expressions
- Add comments if needed

### 7. Run Full Test Suite

```bash
# From root directory
pnpm test
```

All 175+ tests should pass!

## 🎨 Code Style

### Naming Conventions

- **Functions**: `camelCase` with verb prefix (`createScenario`, `matchPath`)
- **Types**: `PascalCase` (`Scenario`, `Recording`)
- **Constants**: `UPPER_SNAKE_CASE` for true constants
- **Files**: `kebab-case.ts` for implementation, `kebab-case.test.ts` for tests

### Function Structure

```typescript
/**
 * Clear JSDoc comment explaining what the function does
 * @param param1 - Description of parameter
 * @param param2 - Description of parameter
 * @returns Description of return value
 */
export const functionName = (
  param1: Type1,
  param2: Type2
): ReturnType => {
  // Implementation
  return result
}
```

### File Organization

```typescript
// 1. Imports
import type { ExternalType } from './types'
import { externalFunction } from './utils'

// 2. Type definitions (if local to this file)
interface LocalType {
  field: string
}

// 3. Helper functions (not exported)
const helperFunction = (): void => {
  // ...
}

// 4. Exported functions
export const mainFunction = (): void => {
  // ...
}
```

## 🧪 Testing Guidelines

### Test Structure

```typescript
describe('Feature Name', () => {
  // Setup if needed
  beforeEach(() => {
    // Reset state
  })

  describe('specific behavior', () => {
    it('should do X when Y happens', () => {
      // Arrange
      const input = createInput()
      
      // Act
      const result = functionUnderTest(input)
      
      // Assert
      expect(result).toEqual(expectedOutput)
    })
  })
})
```

### What to Test

- **Happy path** - Normal, expected usage
- **Edge cases** - Empty arrays, nullish values, boundaries
- **Error cases** - Invalid input, missing data
- **Integration** - Features working together

### Test Coverage

We aim for:
- **>90% line coverage**
- **>80% branch coverage**
- **100% coverage** on core logic

## 📦 Package Structure

Each package follows this structure:

```
packages/your-package/
├── src/
│   ├── index.ts          # Public API exports
│   ├── types.ts          # Type definitions
│   ├── feature.ts        # Implementation
│   ├── feature.test.ts   # Tests
│   └── ...
├── package.json          # Package configuration
├── tsconfig.json         # TypeScript config
├── vitest.config.ts      # Test configuration
└── README.md             # Package documentation
```

## 🔄 Pull Request Process

1. **Create PR** with clear title and description
2. **Link related issue** if applicable
3. **Ensure all tests pass** - PR checks will verify
4. **Update documentation** if needed
5. **Wait for review** - maintainers will review
6. **Address feedback** - make requested changes
7. **Merge!** - Squash and merge when approved

### PR Title Format

- `feat: add X feature`
- `fix: resolve Y bug`
- `docs: update Z documentation`
- `refactor: improve A code`
- `test: add tests for B`

## 🎯 Areas for Contribution

### High Priority

- [ ] MSW browser/Node.js integration
- [ ] Interactive CLI commands
- [ ] Additional OpenAPI features (allOf, oneOf, anyOf)
- [ ] Performance optimizations

### Medium Priority

- [ ] GraphQL support
- [ ] Middleware system
- [ ] Plugin architecture
- [ ] Response variation strategies

### Documentation

- [ ] More usage examples
- [ ] Video tutorials
- [ ] Blog posts
- [ ] Migration guides

## ❓ Questions?

- Open an issue for bugs or feature requests
- Start a discussion for questions
- Check existing issues and PRs first

## 📜 Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Celebrate contributions of all sizes

## 🙏 Thank You!

Every contribution makes mock-master better. Whether it's code, documentation, bug reports, or ideas - thank you for being part of this project!

---

**Built with Test-Driven Development and care** ❤️
