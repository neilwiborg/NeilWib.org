import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

export interface BackendWebFunctionProps {
	functionName: string;
}

export class BackendWebFunction extends Construct {
	readonly endpoint: lambda.CfnWebFunctionEndpoint;

	constructor(scope: Construct, id: string, props: BackendWebFunctionProps) {
		super(scope, id);

		// TODO: Replace these L1s with the CDK L2 after it is released:
		// https://github.com/aws/aws-cdk/pull/39210
		const webFunction = new lambda.CfnWebFunction(this, "Function", {
			functionName: props.functionName,
		});

		// Code revisions are published by the backend deployment workflow.
		this.endpoint = new lambda.CfnWebFunctionEndpoint(this, "Endpoint", {
			functionName: webFunction.functionName,
			endpointName: "production",
			endpointType: "HomeRegion",
			authType: "ApplicationManaged",
		});
	}
}
