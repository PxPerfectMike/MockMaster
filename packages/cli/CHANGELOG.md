# @mockmaster/cli

## 1.0.6

### Patch Changes

- Handle 204 No Content and other responses without content schema. The OpenAPI scenario generator now creates mock recordings for DELETE operations that return 204 No Content, as well as other responses like 201 Created that don't include a response body. These recordings will have null body and empty headers, allowing proper mocking of these common REST API patterns.

## 1.0.5

### Patch Changes

- 🔥 CRITICAL FIX: Convert OpenAPI path parameters to Express/router format

  **The Problem:**
  OpenAPI specs use `{id}` format for path parameters (e.g., `/users/{id}`), but MockMaster's replay handler expects Express-style `:id` format (e.g., `/users/:id`). This caused OpenAPI-generated scenarios to fail replay with path parameters.

  **What Was Broken:**

  ```typescript
  // OpenAPI spec
  paths:
    /users/{id}:  // ← OpenAPI format
      get: ...

  // Generated scenario
  path: '/users/{id}'  // ← Kept OpenAPI format

  // Replay attempt
  handler({ path: '/users/123' })  // ❌ No match! {id} !== 123
  ```

  **The Fix:**
  Added `convertPathFormat()` function that converts OpenAPI `{parameter}` syntax to Express `:parameter` syntax during scenario generation.

  ```typescript
  // Now works!
  // OpenAPI spec → converts → Express format
  '/users/{id}' → '/users/:id'
  '/users/{userId}/posts/{postId}' → '/users/:userId/posts/:postId'
  ```

  **Impact:**
  - ✅ OpenAPI-generated scenarios now work with path parameters out-of-the-box
  - ✅ Fixes 2 remaining beta test workflow failures (REST CRUD, Error responses)
  - ✅ Added comprehensive test for path format conversion
  - ✅ URL field still preserves original OpenAPI format for reference

  **Beta Test Results:**
  This fix should bring MockMaster from **44/47 (93.6%)** to **46/47 (97.9%)** pass rate! 🎯

  **Technical Details:**
  - Uses regex replacement: `/\{([^}]+)\}/g` → `:$1`
  - Handles single and multiple parameters
  - Applied in `generateScenariosFromSpec()` before creating recordings
  - Original URL preserved for debugging/logging purposes

## 1.0.4

### Patch Changes

- Updated dependencies
  - @mockmaster/msw-adapter@1.0.4

## 1.0.3

### Patch Changes

- Updated dependencies
  - @mockmaster/core@1.0.3
  - @mockmaster/openapi@1.0.3
  - @mockmaster/msw-adapter@1.0.3

## 1.0.2

### Patch Changes

- Fix GitHub repository links in package READMEs (displayed on npm)
- Updated dependencies
  - @mockmaster/core@1.0.2
  - @mockmaster/openapi@1.0.2
  - @mockmaster/msw-adapter@1.0.2

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
