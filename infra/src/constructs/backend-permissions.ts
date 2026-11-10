import { ArnFormat, Stack } from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import type * as s3 from "aws-cdk-lib/aws-s3";
import type * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import {
	AwsManagedPolicy,
	AwsServicePrincipal,
	Statement,
} from "cdk-iam-floyd";
import type { Construct } from "constructs";

interface BackendExecutionRoleProps {
	tableName: string;
	secret: secretsmanager.ISecret;
}

export function createBackendExecutionRole(
	scope: Construct,
	id: string,
	props: BackendExecutionRoleProps,
): iam.Role {
	const role = new iam.Role(scope, id, {
		assumedBy: new iam.ServicePrincipal(AwsServicePrincipal.LAMBDA),
	});
	role.addManagedPolicy(new AwsManagedPolicy().AWSLambdaBasicExecutionRole());

	const stack = Stack.of(scope);
	role.addToPolicy(
		new Statement.Dynamodb()
			.toPutItem()
			.toScan()
			.in(stack.account, stack.region, stack.partition)
			.onTable(props.tableName),
	);
	props.secret.grantRead(role);

	return role;
}

export function grantWebFunctionCodeRead(
	codeBucket: s3.Bucket,
	functionName: string,
): void {
	const stack = Stack.of(codeBucket);
	codeBucket.addToResourcePolicy(
		new Statement.S3()
			.forService(AwsServicePrincipal.LAMBDA)
			.toGetObject()
			.toGetObjectVersion()
			.onObject(codeBucket.bucketName, "*")
			.if(
				"aws:SourceArn",
				stack.formatArn({
					service: "lambda",
					resource: "web-function",
					resourceName: `${functionName}/revision/*`,
					arnFormat: ArnFormat.SLASH_RESOURCE_NAME,
				}),
				"ArnLike",
			),
	);
}
