// @ts-check

/** @param {AWSCloudFrontFunction.Event} event */
// biome-ignore lint/correctness/noUnusedVariables: CloudFront invokes this global handler by name.
function handler(event) {
	var request = event.request;
	var acceptHeader = request.headers.accept;

	if (
		request.method === "GET" &&
		request.uri !== "/" &&
		acceptHeader &&
		acceptHeader.value.indexOf("text/html") !== -1
	) {
		request.uri = "/index.html";
	}

	return request;
}
