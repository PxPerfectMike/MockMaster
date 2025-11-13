# Contributing to MockMaster

Thanks for considering contributing to MockMaster! We appreciate contributions of all sizes - whether it's fixing a typo, adding tests, or building new features.

## Getting Started

**Prerequisites:** Node.js 18+ and pnpm 8+

```bash
# Clone and install
git clone https://github.com/your-username/mock-master
cd mock-master
pnpm install

# Run tests
pnpm test

# Build all packages
pnpm build
```

## Making Changes

1. **Fork and create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - The codebase uses TypeScript strict mode
   - We have good test coverage - please add tests for new features
   - Run `pnpm test` to make sure everything passes

3. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   git push origin feature/your-feature-name
   ```

4. **Open a pull request**
   - Describe what you changed and why
   - Link any related issues
   - All tests must pass before merging

## Code Patterns

The codebase uses functional patterns with immutable data structures. When in doubt, check existing code for examples - consistency is more important than any specific style.

We use:
- TypeScript strict mode (no `any` types)
- Vitest for testing
- Functional approach (pure functions, immutability)

Browse the existing code to get a feel for the patterns. If you're making significant contributions, the patterns will become clear quickly.

## Project Structure

This is a pnpm monorepo with packages in the `packages/` directory. Each package has its own `src/`, `tests/`, and `package.json`.

## Commit Convention

We use conventional commits:
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `test:` - Adding or updating tests
- `refactor:` - Code improvements without changing behavior

## Ideas for Contributions

Not sure where to start? Here are some areas that could use help:

- MSW browser/Node.js integration
- Interactive CLI commands
- Additional OpenAPI features (allOf, oneOf, anyOf)
- GraphQL support
- Middleware system
- More usage examples and documentation
- Performance optimizations

But don't let this list limit you - if you have ideas for improvements, we'd love to hear them!

## Questions or Issues?

- **Bug reports or feature requests:** Open an issue
- **Questions:** Start a discussion or open an issue
- **Security issues:** Please email the maintainers directly

## Code of Conduct

Be kind, be constructive, and help us build something great together. We welcome contributors of all experience levels.

---

Thanks for contributing to MockMaster! 🎭
