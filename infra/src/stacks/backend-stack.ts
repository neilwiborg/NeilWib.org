import { CfnOutput, Stack, type StackProps } from "aws-cdk-lib";
import type { IOrigin } from "aws-cdk-lib/aws-cloudfront";
import type { Construct } from "constructs";
import { BackendService } from "../constructs/backend-service.js";

export class BackendStack extends Stack {
	readonly origin: IOrigin;

	constructor(scope: Construct, id: string, props: StackProps) {
		super(scope, id, props);

		const backend = new BackendService(this, "Backend");
		this.origin = backend.origin;

		new CfnOutput(this, "BackendEndpointDomainName", {
			value: backend.endpoint.attrDomainName,
		});
		new CfnOutput(this, "BackendCodeBucketName", {
			value: backend.codeBucket.bucketName,
		});
		new CfnOutput(this, "BackendExecutionRoleArn", {
			value: backend.executionRole.roleArn,
		});
		new CfnOutput(this, "BackendFunctionName", {
			value: backend.functionName,
		});
		new CfnOutput(this, "UnsplashAccessKeySecretArn", {
			value: backend.unsplashSecret.secretArn,
		});
		new CfnOutput(this, "UnsplashAccessKeySecretName", {
			value: backend.unsplashSecret.secretName,
		});
	}
}
