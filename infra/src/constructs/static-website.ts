import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { CloudFrontToS3 } from "@aws-solutions-constructs/aws-cloudfront-s3";
import { Duration, RemovalPolicy } from "aws-cdk-lib";
import type { IOrigin } from "aws-cdk-lib/aws-cloudfront";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

const API_PREFIX = "/api";

function createSpaRewriteFunction(scope: Construct): cloudfront.Function {
	return new cloudfront.Function(scope, "SpaRouteRewrite", {
		code: cloudfront.FunctionCode.fromFile({
			filePath: fileURLToPath(
				new URL("../cloudfront/spa-rewrite.js", import.meta.url),
			),
		}),
		runtime: cloudfront.FunctionRuntime.JS_2_0,
	});
}

function createApiPrefixRewriteFunction(scope: Construct): cloudfront.Function {
	const functionCode = readFileSync(
		fileURLToPath(
			new URL("../cloudfront/api-prefix-rewrite.js", import.meta.url),
		),
		"utf-8",
	).replace('"__API_PREFIX__"', JSON.stringify(API_PREFIX));

	return new cloudfront.Function(scope, "ApiPrefixRewrite", {
		code: cloudfront.FunctionCode.fromInline(functionCode),
		runtime: cloudfront.FunctionRuntime.JS_2_0,
	});
}

function createApiBehavior(
	apiPrefixRewrite: cloudfront.Function,
	backendOrigin: IOrigin,
) {
	return {
		origin: backendOrigin,
		allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
		cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
		originRequestPolicy:
			cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
		viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
		functionAssociations: [
			{
				function: apiPrefixRewrite,
				eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
			},
		],
	};
}

export class StaticWebsite extends Construct {
	readonly distribution: cloudfront.Distribution;
	readonly bucket: s3.IBucket;

	constructor(scope: Construct, id: string, backendOrigin: IOrigin) {
		super(scope, id);

		const spaRewrite = createSpaRewriteFunction(this);
		const apiPrefixRewrite = createApiPrefixRewriteFunction(this);
		const site = new CloudFrontToS3(this, "Frontend", {
			// Avoid extra log buckets and the construct's restrictive default CSP.
			logS3AccessLogs: false,
			insertHttpSecurityHeaders: false,
			bucketProps: {
				blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
				encryption: s3.BucketEncryption.S3_MANAGED,
				removalPolicy: RemovalPolicy.RETAIN,
				versioned: false,
			},
			cloudFrontDistributionProps: {
				enableLogging: false,
				defaultRootObject: "index.html",
				priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
				defaultBehavior: {
					viewerProtocolPolicy:
						cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
					cachePolicy: new cloudfront.CachePolicy(this, "SiteCachePolicy", {
						minTtl: Duration.seconds(0),
						defaultTtl: Duration.minutes(5),
						maxTtl: Duration.days(365),
					}),
					functionAssociations: [
						{
							function: spaRewrite,
							eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
						},
					],
				},
				additionalBehaviors: {
					[API_PREFIX]: createApiBehavior(apiPrefixRewrite, backendOrigin),
					[`${API_PREFIX}/*`]: createApiBehavior(
						apiPrefixRewrite,
						backendOrigin,
					),
				},
			},
		});

		this.distribution = site.cloudFrontWebDistribution;
		this.bucket = site.s3BucketInterface;
	}
}
