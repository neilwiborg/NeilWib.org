// @ts-check

const API_PREFIX = "__API_PREFIX__";

/** @param {AWSCloudFrontFunction.Event} event */
// biome-ignore lint/correctness/noUnusedVariables: CloudFront invokes this global handler by name.
function handler(event) {
	var request = event.request;

	if (request.uri === API_PREFIX) {
		request.uri = "/";
	} else if (request.uri.startsWith(`${API_PREFIX}/`)) {
		request.uri = request.uri.slice(API_PREFIX.length);
	}

	return request;
}
