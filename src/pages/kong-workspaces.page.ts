import type { Page } from "@playwright/test";

/** Page object for the Kong Manager workspace landing page (service listing, navigation). */
export const createWorkspacePage = (page: Page) => {
	const locators = {
		workspaceLinkDefault: page.getByTestId("workspace-link-default"),
		invalidLicenseNotification: page.getByText("No valid Kong Enterprise"),
		addGatewayServiceButton: page.getByTestId("action-button").filter({ hasText: "Add a Gateway Service" }),
		newRouteButton: page.getByTestId("empty-state-action"),
		rowActionsDropdownTriggerButton: page.getByTestId("row-actions-dropdown-trigger"),
		actionEntityDeleteButton: page.getByTestId("action-entity-delete"),
		confirmationTextSpan: page.locator(".confirmation-text"),
		confirmationInput: page.getByTestId("confirmation-input"),
		modalActionButton: page.getByTestId("modal-action-button"),
	};

	return {
		page,
		locators,
	};
};

export type WorkspacePage = ReturnType<typeof createWorkspacePage>;
