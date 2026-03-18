# CLAUDE.md

Read [AGENTS.md](AGENTS.md) for full project context, conventions, and patterns.

## Quick Reference

- **Lint/format**: `npx biome check .` (fix: `npx biome check --fix .`)
- **Run tests locally**: `make up && make install && make test`
- **Run tests in Docker**: `make up && make test-docker` (isolated `node_modules`, no platform conflicts)
- **Stop services**: `make down`

## Rules

- Always import `test` from `src/fixtures`, not from `@playwright/test`
- Always import env vars from `src/data.ts` (`vars`), never use `process.env` directly
- Use `buildId()` for entity names to avoid collisions
- Clean up all Kong entities created during tests (fixtures or `afterEach`)
- Use `page.getByTestId()` as the preferred selector strategy
- Page objects are factory functions, not classes — with explicit return types, locator types, and JSDoc on all methods
- Wrap logical phases in tests with `test.step()` for clear reporting
- Run `npx biome check .` before committing
