import assert from "node:assert";
import { test, expect } from "@playwright/test";
import { deleteAll } from "../src/utils";

test.beforeAll(async ({ request }) => {
	await deleteAll(request, "routes");
	await deleteAll(request, "services");
});

test("should verify web ui is running", async ({ page }) => {
	const response = await page.goto("/");
	assert(response !== null, "Response is null");
	expect(response.status()).toBe(200);
	await expect(page.getByText("No valid Kong Enterprise")).toBeVisible();
});
