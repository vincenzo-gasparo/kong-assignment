import { expect } from "@playwright/test";
import { test } from "../src/fixtures";
import { buildId, deleteService } from "../src/utils";

let createdServiceIds: string[] = [];

test.afterEach(async ({ request }) => {
	for (const id of createdServiceIds) {
		await deleteService(request, id);
	}
	createdServiceIds = [];
});

for (const data of [
	{ testname: "fullUrl", fullUrl: "https://www.example.com" },
	{ testname: "splitted url parts", name: buildId(), protocol: "http", host: "www.example.com", path: "/", port: "80" },
]) {
	test(`should create a new service with ${data.testname}`, async ({ gatewayServiceFormPage, page }) => {
		await test.step("navigate to service creation page", async () => {
			await page.goto("/default/services/create");
		});

		await test.step("fill in the service form and verify save button is enabled", async () => {
			await gatewayServiceFormPage.fillGatewayServiceForm(data);
			await expect(gatewayServiceFormPage.locators.saveServiceButton).toBeEnabled();
		});

		await test.step("submit the form and verify the service is created", async () => {
			const promiseResponse = page.waitForResponse(
				(res) => res.url().includes("/default/services") && res.request().method() === "POST",
			);
			await gatewayServiceFormPage.locators.saveServiceButton.click();
			const response = await promiseResponse;
			expect(response.status()).toBe(201);
			const service = await response.json();
			createdServiceIds.push(service.id);
		});

		await test.step("verify redirect to service detail page", async () => {
			await expect(page).toHaveURL(/\/default\/services\/.*/);
		});
	});
}
