import type { Page } from "@playwright/test";

/**
 * Page object for the Kong Gateway Service creation form.
 *
 * Supports two creation modes:
 * - **Full URL**: a single upstream URL (e.g. "https://www.example.com")
 * - **Split parts**: individual protocol, host, path, and port fields
 */
export const createGatewayServiceFormPage = (page: Page) => {
	const locators = {
		gatewayServiceUrlRadio: page.getByTestId("gateway-service-url-radio"),
		gatewayServiceProtocolRadio: page.getByTestId("gateway-service-protocol-radio"),
		serviceFullUrlInput: page.getByTestId("gateway-service-url-input"),
		serviceProtocolSelect: page.getByTestId("gateway-service-protocol-select"),
		serviceHostInput: page.getByTestId("gateway-service-host-input"),
		servicePathInput: page.getByTestId("gateway-service-path-input"),
		servicePortInput: page.getByTestId("gateway-service-port-input"),
		serviceNameInput: page.getByTestId("gateway-service-name-input"),
		saveServiceButton: page.getByTestId("service-create-form-submit"),
	};

	/** Opens the protocol dropdown and selects the given protocol option. */
	const selectProtocol = async (protocol: string): Promise<void> => {
		await locators.serviceProtocolSelect.click();
		await page.getByRole("button", { name: protocol, exact: true }).click();
	};

	/**
	 * Fills the gateway service creation form.
	 *
	 * When `opts` contains `fullUrl`, selects the URL radio and fills the URL input.
	 * Otherwise selects the protocol/host/path radio and fills individual fields.
	 */
	const fillGatewayServiceForm = async (
		opts:
			| { fullUrl: string; name?: string }
			| {
					protocol?: string;
					host: string;
					path: string;
					port?: string;
					name?: string;
			  },
	): Promise<void> => {
		if ("fullUrl" in opts) {
			await locators.gatewayServiceUrlRadio.check();
			await locators.serviceFullUrlInput.fill(opts.fullUrl);
		} else {
			await locators.gatewayServiceProtocolRadio.check();
			opts.protocol && (await selectProtocol(opts.protocol));
			await locators.serviceHostInput.fill(opts.host);
			await locators.servicePathInput.fill(opts.path);
			opts.port && (await locators.servicePortInput.fill(opts.port));
		}
		opts.name && (await locators.serviceNameInput.fill(opts.name));
	};

	return {
		page,
		locators,
		selectProtocol,
		fillGatewayServiceForm,
	};
};

export type GatewayServiceFormPage = ReturnType<typeof createGatewayServiceFormPage>;
