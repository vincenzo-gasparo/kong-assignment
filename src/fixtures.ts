/**
 * Custom Playwright fixtures for Kong Manager E2E tests.
 *
 * Provides page objects (workspacePage, gatewayServiceFormPage, routeFormPage)
 * and data fixtures (service, createdRouteIds) with automatic lifecycle management.
 * The `service` fixture creates a Kong service before the test and deletes it after.
 * The `createdRouteIds` fixture collects route IDs during a test and deletes them on teardown.
 */
import { test as base } from "@playwright/test";
import { createGatewayServiceFormPage, type GatewayServiceFormPage } from "./pages/kong-gateway-service-form";
import { createRouteFormPage, type RouteFormPage } from "./pages/kong-route-form";
import { createWorkspacePage, type WorkspacePage } from "./pages/kong-workspaces.page";
import type { CreateServiceData } from "./types";
import { buildId, createService, deleteRoute, deleteService } from "./utils";

type ServiceFixture = {
	id: string;
	name: string;
};

export const test = base.extend<{
	workspacePage: WorkspacePage;
	gatewayServiceFormPage: GatewayServiceFormPage;
	routeFormPage: RouteFormPage;
	/** A pre-created Kong service, automatically cleaned up after the test. */
	service: ServiceFixture;
	/** Collect route IDs here during a test; they will be deleted automatically on teardown. */
	createdRouteIds: string[];
}>({
	workspacePage: async ({ page }, use) => {
		const workspacePage = createWorkspacePage(page);
		await use(workspacePage);
	},
	gatewayServiceFormPage: async ({ page }, use) => {
		const gatewayServiceFormPage = createGatewayServiceFormPage(page);
		await use(gatewayServiceFormPage);
	},
	routeFormPage: async ({ page }, use) => {
		const routeFormPage = createRouteFormPage(page);
		await use(routeFormPage);
	},
	service: async ({ request }, use) => {
		const serviceData: CreateServiceData = {
			host: "www.example.com",
			name: buildId(),
			path: "/",
			port: 443,
			protocol: "https",
		};
		const service = await createService(request, serviceData);
		await use(service);
		await deleteService(request, service.id);
	},
	createdRouteIds: async ({ request }, use) => {
		const ids: string[] = [];
		await use(ids);
		for (const id of ids) {
			await deleteRoute(request, id);
		}
	},
});

export default test;
