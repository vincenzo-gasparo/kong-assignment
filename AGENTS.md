# Agents Guide

Instructions for AI agents working on this codebase.

## Project Overview

Playwright E2E test suite for Kong Gateway Manager UI. Tests run against a local Kong Gateway instance via Docker Compose. There is no application code in this repo — only test infrastructure.

## Tech Stack

- **Test framework**: Playwright (`@playwright/test` 1.58.2)
- **Language**: TypeScript (Node 22, `noEmit` — no build step)
- **Linter/Formatter**: Biome 2.x (tabs, double quotes, 120 char line width, auto-organized imports via `organizeImports` assist)
- **Infrastructure**: Docker Compose (Postgres + Kong Gateway + Playwright container with `node_modules` isolated via named volume)
- **CI**: GitHub Actions (parallel lint + test jobs)

## Code Conventions

### Formatting

- Use tabs for indentation
- Use double quotes for strings
- Line width limit: 120 characters
- Imports are auto-organized by Biome (`organizeImports` assist rule) — no manual sorting needed
- Run `npx biome check .` before committing — CI enforces this via a dedicated lint job

### TypeScript

- Module system: CommonJS (`"type": "commonjs"` in package.json)
- No build step — TypeScript is run directly by Playwright
- Strict mode via `@tsconfig/node22`

### Test Patterns

- **Page Objects**: factory functions (not classes) in `src/pages/`, returning `{ page, locators, ...methods }`. Each factory has an explicit return type (e.g. `GatewayServiceFormPage`) along with a dedicated locators type. All public methods must have JSDoc comments and explicit `Promise<void>` return types.
- **Fixtures**: defined in `src/fixtures.ts` using `base.extend<{}>()`. Fixtures handle setup/teardown of test data (create before, delete after).
- **Test steps**: use `test.step("description", async () => { ... })` to group related actions within a test for clearer reporting and debugging.
- **Data cleanup**: tests must clean up resources they create. Use `afterEach` hooks or fixture teardown to delete services/routes via the Admin API.
- **Test IDs**: use `buildId()` from `src/utils.ts` to generate unique, timestamped names for entities (format: `test-yyyyMMddHHmmssSSS`).
- **API interactions**: use Playwright's `request` context (from fixtures) with helpers in `src/utils.ts`. All Admin API calls go through the centralized `vars.KONG` base URL.
- **Selectors**: prefer `data-testid` attributes via `page.getByTestId()`. Fall back to `page.getByRole()` or `page.locator()` when test IDs aren't available.

### Project Execution Order

Tests run in a strict sequence defined in `playwright.config.ts`:

1. `setup` — wipes existing data, verifies UI is accessible
2. `chromium` — main test suite (depends on setup)
3. `teardown` — removes all created entities

### Environment Configuration

All environment variables are centralized in `src/data.ts` and loaded via `dotenv`. Never use `process.env` directly in test files — import `vars` from `src/data.ts` instead.

| Variable | Default | Purpose |
|----------|---------|---------|
| `BASE_URL` | `http://localhost:8002` | Kong Manager UI |
| `KONG_ADMIN_URL` | `http://localhost:8001` | Kong Admin API |
| `CI` | `false` | Headless mode, forbids `.only` |

## Running Tests

```bash
# Start infrastructure
make up

# Local (requires npx playwright install)
make install
make test

# Docker (no local browser install needed, node_modules via named volume)
make test-docker

# Cleanup
make down
```

## File Structure

```
src/
├── data.ts          # env vars (single source of truth)
├── fixtures.ts      # Playwright fixtures with auto-cleanup
├── utils.ts         # Admin API helpers (CRUD, ID generation)
├── types.ts         # Kong entity types
└── pages/           # Page object factories
setup/               # Pre-suite cleanup + smoke test
tests/               # Main test specs
teardown/            # Post-suite cleanup
```

## Common Tasks

### Adding a new test

1. Create `tests/your-feature.spec.ts`
2. Import `test` from `../src/fixtures` (not from `@playwright/test`)
3. If you need a new page object, create a factory in `src/pages/` following the existing pattern
4. Add any new fixtures to `src/fixtures.ts`
5. If the test creates Kong entities, ensure cleanup via `afterEach` or fixture teardown
6. Add the test to a project in `playwright.config.ts` if it needs specific ordering

### Adding a new page object

1. Create `src/pages/kong-your-page.ts`
2. Export a `createYourPage(page: Page): YourPage` factory function with an explicit return type
3. Define a `YourPageLocators` type for locators and a `YourPage` type for the full return value
4. Define locators as an object, form-fill methods as async functions with JSDoc and explicit `Promise<void>` return types
5. Register as a fixture in `src/fixtures.ts`
