/** Kong service protocol values as returned by the Admin API (lowercase). */
export type APIServiceProtocol =
	| "grpc"
	| "grpcs"
	| "grpc,grpcs"
	| "http"
	| "https"
	| "http,https"
	| "tcp"
	| "tls"
	| "tls,udp"
	| "tcp,udp"
	| "tcp,tls"
	| "tcp,tls,udp"
	| "tls_passthrough"
	| "udp"
	| "ws"
	| "wss"
	| "ws,wss";

/** Protocol values as displayed in the Kong Manager UI (uppercase). */
export type ServiceProtocol = Uppercase<APIServiceProtocol>;

/** Kong route path handling version. */
export type PathHandling = "v0" | "v1";

/** Payload for creating a Kong service via the Admin API. */
export type CreateServiceData = {
	name: string;
	protocol: APIServiceProtocol;
	host: string;
	path: string;
	port: number;
};

/** Payload for creating a Kong route via the Admin API. */
export type CreateRouteData = {
	name: string;
	protocol: APIServiceProtocol;
	host: string;
	path: string;
	port: string;
};
