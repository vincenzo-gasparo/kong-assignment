import { test as teardown } from "../src/fixtures";
import { deleteAll } from "../src/utils";

teardown("cleanup kong routes and services", async ({ request }) => {
	await deleteAll(request, "routes");
	await deleteAll(request, "services");
});
