import type { Page } from "@playwright/test";
import type { PathHandling, ServiceProtocol } from "../types";
import { setCheckbox } from "../utils";

/**
 * Page object for the Kong Route creation form.
 *
 * Supports two configuration modes:
 * - **Basic**: name, tags, single path, methods, single host
 * - **Advanced**: protocol selection, multiple paths/hosts/headers/SNIs,
 *   path handling version, redirect status, regex priority, and buffering toggles
 */
export const createRouteFormPage = (page: Page) => {
	const locators = {
		routeNameInput: page.getByTestId("route-form-name"),
		tagsInput: page.getByTestId("route-form-tags"),
		configBasicRadio: page.getByTestId("route-form-config-type-basic"),
		configAdvancedRadio: page.getByTestId("route-form-config-type-advanced"),
		addRouteButton: page.getByRole("button", { name: "Add a Route" }),
		pathsInput: page.locator('[data-testid^="route-form-paths-input-"]'),
		methodsInput: page.getByTestId("route-form-methods"),
		methodsOption: (method: string) => page.getByTestId(`multiselect-item-${method}`),
		hostsInput: page.locator('[data-testid^="route-form-hosts-input-"]'),
		protocolsInput: page.getByTestId("route-form-protocols"),
		addPathsButton: page.getByTestId("add-paths"),
		addHostsButton: page.getByTestId("add-hosts"),
		addSnisButton: page.getByTestId("add-snis"),
		addHeadersButton: page.getByTestId("add-headers"),
		headersInputName: page.locator('[data-testid^="route-form-headers-name-input-"]'),
		headersInputValue: page.locator('[data-testid^="route-form-headers-values-input-"]'),
		pathHandlingInput: page.getByTestId("route-form-path-handling"),
		httpRedirectStatusCodeInput: page.getByTestId("route-form-http-redirect-status-code"),
		regexPriorityInput: page.getByTestId("route-form-regex-priority"),
		preserveHostCheckbox: page.getByTestId("route-form-preserve-host"),
		requestBufferingCheckbox: page.getByTestId("route-form-request-buffering"),
		responseBufferingCheckbox: page.getByTestId("route-form-response-buffering"),
		snisInput: page.locator('[data-testid^="route-form-snis-input-"]'),
		formSubmitButton: page.getByTestId("route-create-form-submit"),
		viewConfigurationButton: page.getByTestId("route-create-form-view-configuration"),
		copyButtonJsonCodeBlock: page.getByTestId("code-block-copy-button-json-codeblock"),
	};

	/** Fills multiple path inputs, adding new input rows as needed. */
	const fillPaths = async (paths: string[]): Promise<void> => {
		for (const [index, value] of paths.entries()) {
			await locators.pathsInput.nth(index).fill(value);
			if (index < paths.length - 1) {
				await locators.addPathsButton.click();
			}
		}
	};

	/** Fills multiple host inputs, adding new input rows as needed. */
	const fillHosts = async (hosts: string[]): Promise<void> => {
		for (const [index, value] of hosts.entries()) {
			await locators.hostsInput.nth(index).fill(value);
			if (index < hosts.length - 1) {
				await locators.addHostsButton.click();
			}
		}
	};

	/** Fills multiple header name/value pairs, adding new input rows as needed. */
	const fillHeaders = async (headers: [string, string][]): Promise<void> => {
		for (const [index, [name, value]] of Array.from(headers).entries()) {
			await locators.headersInputName.nth(index).fill(name);
			await locators.headersInputValue.nth(index).fill(value);
			if (index < headers.length - 1) {
				await locators.addHeadersButton.click();
			}
		}
	};

	/** Fills multiple SNI inputs, adding new input rows as needed. */
	const fillSnis = async (snis: string[]): Promise<void> => {
		for (const [index, value] of snis.entries()) {
			await locators.snisInput.nth(index).fill(value);
			if (index < snis.length - 1) {
				await locators.addSnisButton.click();
			}
		}
	};

	/** Opens the protocol dropdown and selects the given protocol option. */
	const selectProtocol = async (protocol: ServiceProtocol): Promise<void> => {
		await locators.protocolsInput.click();
		await page.getByRole("button", { name: protocol, exact: true }).click();
	};

	/** Opens the path handling dropdown and selects the given version. */
	const selectPathHandling = async (pathHandling: PathHandling): Promise<void> => {
		await locators.pathHandlingInput.click();
		await page.getByRole("button", { name: pathHandling, exact: true }).click();
	};

	/** Opens the methods multiselect and clicks each specified method option. */
	const fillMethods = async (methods: string[]): Promise<void> => {
		await locators.methodsInput.click();
		for (const method of methods) {
			await locators.methodsOption(method).click();
		}
		await page.press("body", "Escape");
	};

	/**
	 * Fills the route creation form.
	 *
	 * When `opts` contains `protocols`, switches to advanced mode and fills all
	 * advanced fields. Otherwise uses basic mode with single path/host inputs.
	 */
	const fillRouteForm = async (
		opts:
			| {
					name: string;
					tags: string[];
					path: string;
					methods: string[];
					host: string;
			  }
			| {
					name: string;
					tags: string[];
					protocols: ServiceProtocol;
					paths: string[];
					methods: string[];
					hosts: string[];
					headers: [string, string][];
					snis: string[];
					pathHandling: PathHandling;
					redirectStatus: number;
					regexPriority: number;
					preserveHost: boolean;
					requestBuffering: boolean;
					responseBuffering: boolean;
			  },
	): Promise<void> => {
		await locators.routeNameInput.fill(opts.name);
		await locators.tagsInput.fill(opts.tags.join(", "));

		if ("protocols" in opts) {
			await locators.configAdvancedRadio.check();
			await selectProtocol(opts.protocols);
			await fillPaths(opts.paths);
			await fillMethods(opts.methods);
			await fillHosts(opts.hosts);
			await fillHeaders(opts.headers);
			await fillSnis(opts.snis);
			await selectPathHandling(opts.pathHandling);
			await locators.httpRedirectStatusCodeInput.fill(opts.redirectStatus.toString());
			await locators.regexPriorityInput.fill(opts.regexPriority.toString());
			await setCheckbox(locators.preserveHostCheckbox, opts.preserveHost);
			await setCheckbox(locators.requestBufferingCheckbox, opts.requestBuffering);
			await setCheckbox(locators.responseBufferingCheckbox, opts.responseBuffering);
		} else {
			await locators.configBasicRadio.check();
			await locators.pathsInput.fill(opts.path);
			await fillMethods(opts.methods);
			await locators.hostsInput.fill(opts.host);
		}
	};

	return {
		page,
		locators,
		fillPaths,
		fillHosts,
		fillHeaders,
		fillSnis,
		selectProtocol,
		fillMethods,
		fillRouteForm,
		selectPathHandling,
	};
};

export type RouteFormPage = ReturnType<typeof createRouteFormPage>;
