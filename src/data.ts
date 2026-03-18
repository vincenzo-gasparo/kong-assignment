import "dotenv/config";

/** Environment-driven configuration for external service URLs. */
export const vars = {
	/** Kong Admin API base URL, used for all API requests (CRUD operations, cleanup). */
	KONG: process.env.KONG_ADMIN_URL ?? "http://localhost:8001",
	/** Kong Manager UI base URL, used for all page navigation. */
	BASE_URL: process.env.BASE_URL ?? "http://localhost:8002",
	/** CI environment variable, used to determine if the tests are running in CI. */
	CI: process.env.CI ?? false,
};
