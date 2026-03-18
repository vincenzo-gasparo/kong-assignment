.PHONY: up down install test test-docker logs clean check check-fix help

## Start Kong Gateway and Postgres in the background, wait until healthy
up:
	docker compose up -d --wait

## Stop all services and remove volumes
down:
	docker compose down -v

## Install Node.js dependencies
install:
	npm install

## Run Playwright tests locally (requires `make up` and `make install` first)
test:
	npx playwright test

## Run Playwright tests inside Docker (requires `make up` first)
test-docker:
	docker compose run --rm playwright sh -c "npm ci && npx playwright test"

## Show service logs (follow mode)
logs:
	docker compose logs -f

## Remove test artifacts
clean:
	rm -rf playwright-report/ test-results/

## Run Biome linter and formatter checks
check:
	npx biome check .

## Run Biome linter and formatter with auto-fix
check-fix:
	npx biome check --fix .

## Show available commands
help:
	@echo "Usage: make <target>"
	@echo ""
	@grep -E '^## ' $(MAKEFILE_LIST) | sed 's/^## //' | paste - - | awk -F'\t' '{printf "  %-20s %s\n", $$2, $$1}'
