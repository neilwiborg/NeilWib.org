import { CfnOutput, Stack, type StackProps } from "aws-cdk-lib";
import type { Construct } from "constructs";
import { StaticWebsite } from "../constructs/static-website.js";

export class WebsiteStack extends Stack {
	constructor(scope: Construct, id: string, props: StackProps) {
		super(scope, id, props);

		const website = new StaticWebsite(this, "Website");

		new CfnOutput(this, "SiteUrl", {
			value: `https://${website.distribution.distributionDomainName}`,
		});
		new CfnOutput(this, "DistributionDomainName", {
			value: website.distribution.distributionDomainName,
		});
		new CfnOutput(this, "DistributionId", {
			value: website.distribution.distributionId,
		});
		new CfnOutput(this, "SiteBucketName", {
			value: website.bucket.bucketName,
		});
	}
}
