import assert from "node:assert";
import { expect } from "@playwright/test";
import { test } from "../src/fixtures";

test("should verify web ui is running", async ({ workspacePage, page }) => {
	const response = await page.goto("/");
	assert(response !== null, "Response is null");
	expect(response.status()).toBe(200);
	await expect(workspacePage.locators.invalidLicenseNotification).toBeVisible();
});

test("should show add a gateway service button with no services", async ({
	workspacePage,
	gatewayServiceFormPage,
	page,
}) => {
	await workspacePage.page.goto("/");
	await workspacePage.locators.workspaceLinkDefault.click();
	await expect(workspacePage.locators.addGatewayServiceButton).toBeVisible();
	await workspacePage.locators.addGatewayServiceButton.click();
	await expect(gatewayServiceFormPage.locators.saveServiceButton).toBeDisabled();
	await expect(page).toHaveURL(/\/default\/services\/create\?cta=new-user$/);
});
