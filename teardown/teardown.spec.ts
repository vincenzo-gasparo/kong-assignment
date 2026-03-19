import { test as teardown } from "../src/fixtures";
import { deleteAll } from "../src/utils";

// Not strictly necessary, but it's a good idea to clean up whole test execution
teardown("cleanup kong routes and services", async ({ request }) => {
	await deleteAll(request, "routes");
	await deleteAll(request, "services");
});
