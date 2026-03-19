# Kong Gateway Manager - E2E Tests

End-to-end test suite for [Kong Gateway Manager](https://docs.konghq.com/gateway/latest/kong-manager/) using [Playwright](https://playwright.dev/).

Tests run against a local Kong Gateway instance managed via Docker Compose, exercising the Manager UI to verify service and route CRUD operations.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- [Node.js](https://nodejs.org/) (LTS recommended) — only needed for local development

## Quick Start

```bash
# Start Kong Gateway
make up

# Install dependencies and run tests locally
make install
make test

# Or run tests entirely in Docker (no local Node.js needed)
make test-docker

# Stop everything
make down
```

## Architecture

```
docker-compose.yml
├── kong-ee-database   Postgres database for Kong
├── kong-cp            Kong Gateway (Admin API :8001, Manager UI :8002, Proxy :8000)
└── playwright         Playwright test runner (test profile, host network, named volume for node_modules)
```

### Services

| Service | Port | Description |
|---------|------|-------------|
| Kong Admin API | `8001` | REST API for managing Kong configuration |
| Kong Manager UI | `8002` | Web UI under test |
| Kong Proxy | `8000` | Gateway proxy endpoint |
| Postgres | `5432` | Kong's backing database |

## Project Structure

```
├── src/
│   ├── fixtures.ts          # Playwright fixtures (page objects, service/route lifecycle)
│   ├── utils.ts             # API helpers (CRUD operations, ID generation)
│   ├── types.ts             # TypeScript types for Kong entities
│   ├── data.ts              # Centralized environment configuration (dotenv)
│   └── pages/
│       ├── kong-workspaces.ts             # Workspace page object (locators + types)
│       ├── kong-gateway-service-form.ts  # Service form page object (fill, select protocol)
│       └── kong-route-form.ts            # Route form page object (basic & advanced config)
├── setup/
│   └── setup.spec.ts        # Pre-suite: cleans existing data, verifies UI is running
├── tests/
│   ├── services.spec.ts                  # Service creation tests (full URL & split parts)
│   └── routes.spec.ts                    # Route creation tests (basic & advanced config)
├── teardown/
│   └── teardown.spec.ts     # Post-suite: removes all created routes and services
├── docker-compose.yml        # Kong + Postgres + Playwright services
├── playwright.config.ts      # Playwright configuration and project ordering
└── .github/workflows/
    └── playwright-docker.yml # CI workflow
```

## Test Execution Order

Playwright projects run in a defined sequence:

1. **setup** — Deletes pre-existing routes/services and verifies the Kong Manager UI is accessible
2. **chromium** — Runs all tests in `tests/` (depends on setup)
3. **teardown** — Cleans up all routes and services created during the run

## Environment Variables

All environment variables are centralized in [`src/data.ts`](src/data.ts) and loaded via [dotenv](https://github.com/motdotla/dotenv), so you can use a `.env` file at the project root for local overrides.

| Variable | Default | Description |
|----------|---------|-------------|
| `BASE_URL` | `http://localhost:8002` | Kong Manager UI URL |
| `KONG_ADMIN_URL` | `http://localhost:8001` | Kong Admin API URL |
| `CI` | `false` | Set to `true` in CI; enables headless mode, disables `test.only` |

## Make Targets

| Target | Description |
|--------|-------------|
| `make up` | Start Kong and Postgres, wait until healthy |
| `make down` | Stop all services and remove volumes |
| `make install` | Install Node.js dependencies (`npm install`) |
| `make test` | Run Playwright tests locally |
| `make test-docker` | Install deps and run tests inside Docker (isolated `node_modules`) |
| `make logs` | Follow service logs |
| `make clean` | Remove `playwright-report/` and `test-results/` |
| `make check` | Run Biome linter/formatter checks |
| `make check-fix` | Run Biome with auto-fix |

## CI

The GitHub Actions workflow ([playwright-docker.yml](.github/workflows/playwright-docker.yml)) runs on push/PR to `main` and on manual dispatch. It runs two jobs in parallel:

**Lint** — Runs Biome lint and format checks using the official `biomejs/setup-biome` action (no `npm install` needed).

**Test**:
1. Starts Kong via Docker Compose (waits for healthcheck)
2. Installs npm dependencies inside the Playwright container (isolated `node_modules` via named volume to avoid platform binary conflicts and persist across steps)
3. Runs tests using the pre-built Playwright Docker image (no browser install step)
4. Uploads HTML report as artifact (retained 30 days)

## Conventions

- **Page objects** are factory functions with explicit return types, dedicated locator types, and JSDoc on all methods
- **Tests** use `test.step()` to group logical phases (navigate, fill form, submit, verify) for clear reporting
- **Imports** are auto-organized by Biome (`organizeImports` assist rule)
- See [AGENTS.md](AGENTS.md) for full coding conventions
