import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";

export interface UserManagedSecretProps {
	secretName: string;
	description?: string;
}

/** Creates an empty Secrets Manager secret whose value is set outside CDK. */
export class UserManagedSecret extends Construct {
	readonly secret: secretsmanager.ISecret;

	constructor(scope: Construct, id: string, props: UserManagedSecretProps) {
		super(scope, id);

		// The Secret L2 generates a value when none is supplied; omitting both
		// value properties on the L1 creates an empty secret for manual setup.
		const secret = new secretsmanager.CfnSecret(this, "Resource", {
			name: props.secretName,
			description: props.description,
		});

		this.secret = secretsmanager.Secret.fromSecretCompleteArn(
			this,
			"Reference",
			secret.ref,
		);
	}
}
