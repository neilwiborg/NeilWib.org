import { App } from "aws-cdk-lib";
import { WebsiteStack } from "./stacks/website-stack.js";

const app = new App();

new WebsiteStack(app, "NeilWibOrgWebsite", {
	// CloudFront requires ACM certificates for custom domains to be in us-east-1.
	env: {
		account: process.env.CDK_DEFAULT_ACCOUNT,
		region: "us-west-2",
	},
});
