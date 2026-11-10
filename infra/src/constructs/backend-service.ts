import { Duration, RemovalPolicy } from "aws-cdk-lib";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import type * as iam from "aws-cdk-lib/aws-iam";
import type * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import type * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";
import {
	createBackendExecutionRole,
	grantWebFunctionCodeRead,
} from "./backend-permissions.js";
import { BackendWebFunction } from "./backend-web-function.js";
import { UserManagedSecret } from "./user-managed-secret.js";

export class BackendService extends Construct {
	readonly origin: cloudfront.IOrigin;
	readonly endpoint: lambda.CfnWebFunctionEndpoint;
	readonly unsplashSecret: secretsmanager.ISecret;
	readonly codeBucket: s3.Bucket;
	readonly executionRole: iam.Role;
	readonly functionName = "neilwiborg-backend";

	constructor(scope: Construct, id: string) {
		super(scope, id);

		const tableName = "mememaker-templates";

		this.codeBucket = new s3.Bucket(this, "BackendCode", {
			blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
			encryption: s3.BucketEncryption.S3_MANAGED,
			enforceSSL: true,
			removalPolicy: RemovalPolicy.RETAIN,
			versioned: true,
		});

		this.unsplashSecret = new UserManagedSecret(this, "UnsplashAccessKey", {
			secretName: "neilwiborg/unsplash-access-key",
			description: "Unsplash access key.",
		}).secret;
		this.executionRole = createBackendExecutionRole(
			this,
			"BackendExecutionRole",
			{ tableName, secret: this.unsplashSecret },
		);
		grantWebFunctionCodeRead(this.codeBucket, this.functionName);

		const webFunction = new BackendWebFunction(this, "BackendWebFunction", {
			functionName: this.functionName,
		});
		this.endpoint = webFunction.endpoint;

		this.origin = new origins.HttpOrigin(this.endpoint.attrDomainName, {
			protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
			readTimeout: Duration.seconds(60),
		});
	}
}
