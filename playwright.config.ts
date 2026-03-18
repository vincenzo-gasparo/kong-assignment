import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./tests",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: 0,
	workers: process.env.CI ? 4 : 1,
	reporter: [["html", { open: "never" }], ["list"]],
	use: {
		headless: !!process.env.CI,
		trace: "retain-on-failure",
		screenshot: "only-on-failure",
		baseURL: process.env.BASE_URL || "http://localhost:8002",
		...devices["Desktop Chrome"],
	},
	projects: [
		{
			name: "setup",
			testDir: "./setup",
		},
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
			dependencies: ["setup"],
		},
	],
});
