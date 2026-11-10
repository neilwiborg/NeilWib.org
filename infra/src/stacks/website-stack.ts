import { CfnOutput, Stack, type StackProps } from "aws-cdk-lib";
import type { IOrigin } from "aws-cdk-lib/aws-cloudfront";
import type { Construct } from "constructs";
import { StaticWebsite } from "../constructs/static-website.js";

interface WebsiteStackProps extends StackProps {
	backendOrigin: IOrigin;
}

export class WebsiteStack extends Stack {
	constructor(scope: Construct, id: string, props: WebsiteStackProps) {
		super(scope, id, props);

		const website = new StaticWebsite(this, "Website", props.backendOrigin);

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
