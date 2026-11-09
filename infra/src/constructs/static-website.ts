import { fileURLToPath } from "node:url";
import { CloudFrontToS3 } from "@aws-solutions-constructs/aws-cloudfront-s3";
import { Duration, RemovalPolicy } from "aws-cdk-lib";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

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

export class StaticWebsite extends Construct {
	readonly distribution: cloudfront.Distribution;
	readonly bucket: s3.IBucket;

	constructor(scope: Construct, id: string) {
		super(scope, id);

		const spaRewrite = createSpaRewriteFunction(this);
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
			},
		});

		this.distribution = site.cloudFrontWebDistribution;
		this.bucket = site.s3BucketInterface;
	}
}
