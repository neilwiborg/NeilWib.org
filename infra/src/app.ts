import { App } from "aws-cdk-lib";
import { BackendStack } from "./stacks/backend-stack.js";
import { WebsiteStack } from "./stacks/website-stack.js";

const app = new App();

const env = {
	account: process.env.CDK_DEFAULT_ACCOUNT,
	region: "us-west-2",
};

const backend = new BackendStack(app, "NeilWibOrgBackend", { env });

new WebsiteStack(app, "NeilWibOrgWebsite", {
	env,
	backendOrigin: backend.origin,
});
