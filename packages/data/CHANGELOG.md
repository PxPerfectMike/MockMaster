# @mockmaster/data

## 1.0.5

### Patch Changes

- Updated dependencies
  - @mockmaster/core@1.0.4

## 1.0.4

### Patch Changes

- Fix path parameter matching in replay handler and improve test documentation

  **@mockmaster/msw-adapter:**
  - 🔥 **CRITICAL FIX:** Path parameter replay now works correctly
    - Previously: Recording with pattern `/users/:id` would NOT match incoming request `/users/123`
    - Now: Uses `matchPath()` from `@mockmaster/core` for proper pattern matching
    - Example: A recording with path `/users/:id` will now correctly match `/users/123`, `/users/456`, etc.
    - This fixes OpenAPI-generated scenarios that use path parameters like `/products/{id}`
    - Added 3 new tests for path parameter matching scenarios
  - This fix resolves 3 beta test failures:
    1. Path parameter replay test
    2. REST CRUD workflow test
    3. Error responses workflow test

  **@mockmaster/data:**
  - 📖 **Documentation improvement:** Clarified sequence reset behavior
    - Sequences are global and persist across tests by design
    - Users should call `resetSequences()` in test setup (e.g., `beforeEach` hook) for test isolation
    - Example:

      ```typescript
      import { resetSequences } from '@mockmaster/data'

      beforeEach(() => {
        resetSequences()
      })
      ```

    - This is already demonstrated in the internal test suite

  **Impact:**
  - Fixes 3 failing beta tests (from 43/47 to 46/47)
  - Path parameter replay now works as documented
  - OpenAPI-generated scenarios now work out-of-the-box

## 1.0.3

### Patch Changes

- Fix multiple issues discovered in beta testing

  **@mockmaster/core:**
  - Added `extractParams` export alias for `parsePathParams` (matches documentation)
  - Implemented missing `createMatcher` function to create reusable path matchers
    - Takes an array of path patterns and returns a function that tests if a path matches any pattern
    - Example: `const matcher = createMatcher(['/users/:id', '/posts/:id']); matcher('/users/123') // true`

  **@mockmaster/data:**
  - Restructured `fake` API to match @faker-js/faker's nested structure
    - Added `fake.person.fullName()`, `fake.person.firstName()`, `fake.person.lastName()`, `fake.person.jobTitle()`
    - Added `fake.internet.email()`, `fake.internet.userName()`, `fake.internet.url()`, `fake.internet.ipv4()`
    - Added `fake.number.int({ min, max })`
    - Added `fake.string.uuid()`
    - Added `fake.helpers.arrayElement(array)`
    - Kept flat API (`fake.name()`, `fake.email()`, etc.) as deprecated for backward compatibility

  **@mockmaster/openapi:**
  - Added support for `format: 'date'` in schema generation (returns YYYY-MM-DD format)
  - Made `parseSpec` accept both string (YAML/JSON) and JavaScript object inputs for better developer experience

- Updated dependencies
  - @mockmaster/core@1.0.3

## 1.0.2

### Patch Changes

- Fix GitHub repository links in package READMEs (displayed on npm)
- Updated dependencies
  - @mockmaster/core@1.0.2

## 1.0.1

### Patch Changes

- Add comprehensive README files to all packages for better npm discoverability
- Updated dependencies
  - @mockmaster/core@1.0.1

## 1.0.0

### Major Changes

- # Initial Release v1.0.0

  **mock-master** - Next-generation API mocking built with TypeScript, TDD, and functional programming

  ## Features
  - **Record & Replay** - Capture real API responses and replay them deterministically
  - **OpenAPI First** - Generate scenarios from OpenAPI 3.0 specs (JSON & YAML)
  - **Type Safe** - Built with strict TypeScript, zero escape hatches
  - **Framework Agnostic** - Works with Vitest, Jest, Playwright, any framework
  - **Functional** - Pure functions, immutable data, composable APIs
  - **Factory System** - Generate realistic test data with Faker.js
  - **Scenario Management** - Version control your mock scenarios as JSON

  ## Packages
  - `@mockmaster/core` - Path matching & HTTP routing (32 tests)
  - `@mockmaster/data` - Factories & Faker integration (34 tests)
  - `@mockmaster/openapi` - OpenAPI parsing & generation (55 tests)
  - `@mockmaster/msw-adapter` - Record & replay (30 tests)
  - `@mockmaster/cli` - File system & integration (27 tests)

  **Total: 178 tests passing with 90%+ coverage**

  Built with Test-Driven Development, functional programming, and care.

### Patch Changes

- Updated dependencies
  - @mockmaster/core@1.0.0
