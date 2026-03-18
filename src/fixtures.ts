import { test as base } from "@playwright/test";
import { createGatewayServiceFormPage, type GatewayServiceFormPage } from "./pages/kong-gateway-service-form";
import { createWorkspacePage, type WorkspacePage } from "./pages/kong-workspaces.page";
import type { CreateServiceData } from "./types";
import { buildId, createService, deleteService } from "./utils";

type ServiceFixture = {
	id: string;
	name: string;
};

export const test = base.extend<{
	workspacePage: WorkspacePage;
	gatewayServiceFormPage: GatewayServiceFormPage;
	/** A pre-created Kong service, automatically cleaned up after the test. */
	service: ServiceFixture;
}>({
	workspacePage: async ({ page }, use) => {
		const workspacePage = createWorkspacePage(page);
		await use(workspacePage);
	},
	gatewayServiceFormPage: async ({ page }, use) => {
		const gatewayServiceFormPage = createGatewayServiceFormPage(page);
		await use(gatewayServiceFormPage);
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
});

export default test;
