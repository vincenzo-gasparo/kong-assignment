/**
 * Playwright configuration for Kong Manager E2E tests.
 *
 * Projects run in sequence: setup -> chromium (main tests) -> teardown.
 * Setup cleans existing data and verifies the UI is accessible.
 * Teardown removes all services and routes created during the run.
 *
 * Environment variables:
 *   BASE_URL  - Kong Manager UI URL (default: http://localhost:8002)
 *   CI        - Enables headless mode and forbids .only
 */
import { defineConfig, devices } from "@playwright/test";
import { vars } from "./src/data";

export default defineConfig({
	testDir: "./tests",
	fullyParallel: true,
	forbidOnly: !!vars.CI,
	retries: 0,
	workers: vars.CI ? 4 : 1,
	reporter: [["html", { open: "never" }], ["list"]],
	snapshotDir: "./snapshots",
	use: {
		headless: !!vars.CI,
		trace: "on", // Usually retain-on-failure, on for academic purposes
		screenshot: "only-on-failure",
		baseURL: vars.BASE_URL || "http://localhost:8002",
		permissions: ["clipboard-read", "clipboard-write"],
		...devices["Desktop Chrome"],
	},
	projects: [
		{
			name: "setup",
			testDir: "./setup",
			teardown: "teardown",
		},
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
			dependencies: ["setup"],
		},
		{
			name: "teardown",
			testDir: "./teardown",
		},
	],
});
