/**
 * Shared utility functions for Kong Admin API operations and test helpers.
 *
 * All API functions interact with Kong's Admin API to manage services and routes
 * programmatically (creating fixtures, cleaning up after tests, etc.).
 */
import type { APIRequestContext, Locator } from "@playwright/test";
import { format } from "date-fns";
import { vars } from "./data";
import type { CreateRouteData, CreateServiceData } from "./types";

/** Generates a unique, timestamped identifier for test entities (e.g. "test-20260319123045123"). */
export const buildId = (prefix: string = "test"): string => {
	const timestamp = format(new Date(), "yyyyMMddHHmmssSSS");
	return `${prefix}-${timestamp}`;
};

/** Deletes all entities of a given type (services or routes) via the Kong Admin API. Used in setup/teardown. */
export const deleteAll = async (request: APIRequestContext, entity: "services" | "routes") => {
	const res = await request.get(`${vars.KONG}/${entity}`);
	if (!res.ok()) return;
	const { data } = await res.json();
	for (const item of data) {
		await request.delete(`${vars.KONG}/${entity}/${item.id}`);
	}
};

/** Deletes a single service by ID. */
export const deleteService = async (request: APIRequestContext, id: string) => {
	await request.delete(`${vars.KONG}/services/${id}`);
};

/** Deletes a single route by ID. */
export const deleteRoute = async (request: APIRequestContext, id: string) => {
	await request.delete(`${vars.KONG}/routes/${id}`);
};

/** Creates a new Kong service via the Admin API and returns the parsed response. */
export const createService = async (request: APIRequestContext, data: CreateServiceData) => {
	const response = await request.post(`${vars.KONG}/services`, { data });
	return response.json();
};

/** Creates a new Kong route via the Admin API and returns the parsed response. */
export const createRoute = async (request: APIRequestContext, data: CreateRouteData) => {
	const response = await request.post(`${vars.KONG}/routes`, { data });
	return response.json();
};

/** Sets a checkbox locator to the desired checked/unchecked state. */
export const setCheckbox = (locator: Locator, checked: boolean) => (checked ? locator.check() : locator.uncheck());
