import { expect } from "@playwright/test";
import { test } from "../src/fixtures";
import type { PathHandling, ServiceProtocol } from "../src/types";
import { buildId } from "../src/utils";

for (const data of [
	{
		testname: "basic",
		data: {
			name: buildId(),
			tags: ["tag1", "tag2", "tag3"],
			path: "/",
			methods: ["GET", "POST"],
			host: "www.example.com",
		},
	},
	{
		testname: "advanced",
		data: {
			name: buildId(),
			tags: ["tag1", "tag2", "tag3"],
			protocols: "HTTPS" as ServiceProtocol,
			paths: ["/"],
			methods: ["GET", "POST"],
			hosts: ["www.example.com"],
			headers: [
				["X-Custom-Header", "value1"],
				["X-Custom-Header2", "value2"],
			] as [string, string][],
			snis: ["api"],
			pathHandling: "v0" as PathHandling,
			redirectStatus: 301,
			regexPriority: 0,
			preserveHost: true,
			requestBuffering: false,
			responseBuffering: false,
		},
	},
]) {
	test(`should create a new route with ${data.testname} configuration`, async ({
		page,
		routeFormPage,
		service,
		createdRouteIds,
	}) => {
		await test.step("navigate to service detail page", async () => {
			await page.goto(`/default/services/${service.id}`);
			await expect(page.locator("h3", { hasText: service.name })).toBeVisible();
		});

		await test.step("open route creation form", async () => {
			await routeFormPage.locators.addRouteButton.click();
		});

		await test.step("fill in the route form", async () => {
			await routeFormPage.fillRouteForm(data.data);
		});

		await test.step("submit the form and verify the route is created", async () => {
			const promiseResponse = page.waitForResponse(
				(res) => res.url().includes(`/default/services/${service.id}/routes`) && res.request().method() === "POST",
			);
			await routeFormPage.locators.formSubmitButton.click();
			const response = await promiseResponse;
			expect(response.status()).toBe(201);
			const route = await response.json();
			createdRouteIds.push(route.id);
		});

		await test.step("verify redirect and route visibility", async () => {
			await expect(page).toHaveURL(new RegExp(`/default/services/${service.id}/routes`));
			await expect(page.locator(`[data-testid="${data.data.name}"]`)).toBeVisible();
		});
	});
}
