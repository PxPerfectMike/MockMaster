# @mockmaster/cli

## 1.0.1

### Patch Changes

- Add comprehensive README files to all packages for better npm discoverability
- Updated dependencies
  - @mockmaster/core@1.0.1
  - @mockmaster/openapi@1.0.1
  - @mockmaster/msw-adapter@1.0.1

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
  - @mockmaster/openapi@1.0.0
  - @mockmaster/msw-adapter@1.0.0
