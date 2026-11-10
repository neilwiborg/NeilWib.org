# Website and backend infrastructure

The CDK app has two stacks in `us-west-2`, grouped by deployment responsibility:

- `NeilWibOrgBackend` (`BackendStack`) owns the Lambda Web Function, its HTTPS
  endpoint, versioned code bucket, execution role, and empty Unsplash secret.
- `NeilWibOrgWebsite` (`WebsiteStack`) owns the static site bucket, CloudFront
  distribution, and CloudFront rewrite functions. It uses the backend endpoint
  as its `/api` origin through a CDK cross-stack reference.

The website stack keeps its existing CloudFormation stack ID. The new backend
resources now belong to `NeilWibOrgBackend`; if the backend resources have
already been deployed in the website stack, review the CDK diff carefully
before deploying this move because CloudFormation normally treats resources
moved between stacks as removals and creations.

The CDK stack uses AWS Solutions Constructs' `CloudFrontToS3` pattern to create
a private S3 bucket and CloudFront distribution with Origin Access Control.
The CloudFront Function rewrites HTML GET requests for React Router paths to
`index.html`; static asset requests pass through unchanged.
The bucket is retained if the stack is removed.
The distribution uses CloudFront `PriceClass_100`, covering North America and
Europe; visitors elsewhere may see higher latency.

The site uses CloudFront's generated hostname and does not configure a custom
domain or Route 53. The same distribution serves the backend under `/api` and
forwards those requests to an AWS Lambda Web Function. A CloudFront Function
removes the `/api` prefix before forwarding, so the backend keeps its root
routes. Set `PUBLIC_API_PREFIX=/api` in the backend environment so generated
image URLs use the public path.

Changes to the infrastructure on `mainline` are deployed by GitHub Actions
after the CDK synth check passes. The workflow uses GitHub OIDC rather than
long-lived AWS keys. Configure the repository variable `AWS_ROLE_ARN` with an
IAM role trusted for this repository's `mainline` branch. Before its first run,
bootstrap the AWS account as described below. This workflow deploys the CDK
stacks only; frontend files and backend code revisions are deployed separately.

## Deploy the infrastructure

Configure AWS credentials, then bootstrap CDK in `us-west-2` once:

```bash
pnpm --filter infrastructure exec cdk bootstrap aws://ACCOUNT_ID/us-west-2
```

Review and deploy both stacks. CDK deploys the backend stack before the website
stack because the website imports the backend endpoint domain:

```bash
pnpm infra:diff
pnpm infra:deploy
```

`NeilWibOrgWebsite` outputs the site URL, distribution domain and ID, and site
bucket name. `NeilWibOrgBackend` outputs `BackendEndpointDomainName`,
`BackendCodeBucketName`, `BackendExecutionRoleArn`, `BackendFunctionName`, and
the Secrets Manager name and ARN for the Unsplash access key. CDK creates the
secret without an initial value; set its value manually in Secrets Manager
after deployment. CDK creates the Web Function and HTTPS endpoint, but does
not publish a code revision. The API endpoint will not serve the application
until its first revision is deployed.

The backend code bucket is versioned and retained so published revisions can
continue to use their deployment packages. The execution role has CloudWatch
Logs access, `Scan` and `PutItem` access to the existing
`mememaker-templates` DynamoDB table, and `GetSecretValue` access to the
Unsplash secret. The backend stack does not create the DynamoDB table. The
current backend still reads `UNSPLASH_ACCESS_KEY` from its environment; it does
not yet retrieve the secret. Wire runtime secret retrieval before relying on
this secret or remove the unused secret and grant.

CDK owns the backend function, endpoint identity, code bucket, and role. The
backend deployment process owns code revisions and production revision
routing. Keep revision weights out of the CDK endpoint definition while using
the manual CLI deployment steps below; if CDK later manages routing, move that
responsibility into CDK instead of having both update the endpoint.

### Planned domain, DNS, and certificates

The current site uses CloudFront's generated hostname. When adding
`neilwib.org` (or another custom domain):

- Keep the Route 53 hosted zone in a long-lived DNS stack if this app owns it;
  otherwise import the existing hosted zone. The CloudFront alias records can
  live with `WebsiteStack`, which owns the distribution they point to.
- Request a DNS-validated ACM certificate in `us-east-1` for CloudFront, then
  pass its ARN to `WebsiteStack`. A small `CertificateStack` in `us-east-1` is
  a clear place to own that certificate; it can create the ACM validation
  record in the hosted zone. Bootstrap `us-east-1` before deploying that stack.
  Passing its ARN directly across regions requires CDK cross-region references;
  alternatively, pass the ARN as deployment configuration.
- Use ACM DNS validation rather than adding a separate ACME/Let's Encrypt
  issuer. ACM can renew an in-use DNS-validated certificate automatically
  while its validation record remains in DNS. An externally issued ACME
  certificate would need a separate renewal and ACM import process.

With the current `/api` path routing, the website's CloudFront domain also
serves the backend, so no separate `api.neilwib.org` record is required. If the
backend later gets its own hostname or distribution, add that alias with the
stack that owns that public endpoint. CloudFront logging, a WAF, and alarms are
optional additions; add them to the stack responsible for the distribution or
service they monitor.

## Upload the frontend manually

Build the frontend, upload `frontend/dist` to the bucket from the stack output,
then invalidate CloudFront so it fetches the new entry point. The CDK stack
routes `/api`; set the frontend's `VITE_API_PREFIX` to match:

```bash
VITE_API_PREFIX=/api pnpm --filter frontend build
aws s3 sync frontend/dist "s3://BUCKET_NAME" --delete
aws cloudfront create-invalidation --distribution-id DISTRIBUTION_ID --paths '/*'
```

For a different prefix, update the `API_PREFIX` constant in the CDK construct
and set the frontend's `VITE_API_PREFIX` to the same slash-prefixed path without
a trailing slash. Set the GitHub Actions repository variable
`API_PREFIX` to match; CI passes it to the frontend build as
`VITE_API_PREFIX`, and the build fails if it is not configured.

## Upload the backend manually

These steps create a new immutable Lambda Web Function revision from the
packaged backend and route all production traffic to it. Configure AWS CLI
credentials for the account and `us-west-2` region first. The identity needs
permission to upload to the backend code bucket, create revisions, pass the
execution role, and update the endpoint.

Read the resource names from the deployed stack outputs:

```bash
REGION=us-west-2
BACKEND_STACK_NAME=NeilWibOrgBackend
CODE_BUCKET=$(aws cloudformation describe-stacks \
  --stack-name "$BACKEND_STACK_NAME" \
  --region "$REGION" \
  --query "Stacks[0].Outputs[?OutputKey=='BackendCodeBucketName'].OutputValue | [0]" \
  --output text)
FUNCTION_NAME=$(aws cloudformation describe-stacks \
  --stack-name "$BACKEND_STACK_NAME" \
  --region "$REGION" \
  --query "Stacks[0].Outputs[?OutputKey=='BackendFunctionName'].OutputValue | [0]" \
  --output text)
EXECUTION_ROLE_ARN=$(aws cloudformation describe-stacks \
  --stack-name "$BACKEND_STACK_NAME" \
  --region "$REGION" \
  --query "Stacks[0].Outputs[?OutputKey=='BackendExecutionRoleArn'].OutputValue | [0]" \
  --output text)
```

Build and zip the deployable package. The archive must contain `build/` at its
root so the configured `build/lambda.js` entry point resolves correctly. Upload
it under a unique key; the bucket is versioned and revisions are pinned to the
uploaded object version.

```bash
pnpm backend:package:lambda
(cd backend/lambda-package && zip -qr ../backend.zip .)
OBJECT_KEY="backend/$(git rev-parse --short HEAD)-$(date -u +%Y%m%dT%H%M%SZ).zip"
aws s3 cp backend/backend.zip "s3://$CODE_BUCKET/$OBJECT_KEY" --region "$REGION"
OBJECT_VERSION=$(aws s3api head-object \
  --bucket "$CODE_BUCKET" \
  --key "$OBJECT_KEY" \
  --region "$REGION" \
  --query VersionId \
  --output text)
```

Create a revision using the role and runtime settings. `PUBLIC_API_PREFIX` must
match the CloudFront API prefix. Lambda Web Function revisions use Node.js
24.x; set `AWS_LAMBDA_NODEJS_ENTRYPOINT` because the app entry point is
`build/lambda.js`.

```bash
REVISION_ID=$(aws lambda-web create-web-function-revision \
  --function-name "$FUNCTION_NAME" \
  --build-config "{\"codeConfig\":{\"s3Object\":{\"bucket\":\"$CODE_BUCKET\",\"key\":\"$OBJECT_KEY\",\"versionId\":\"$OBJECT_VERSION\"}},\"runtimeConfig\":{\"runtime\":\"nodejs24.x\"}}" \
  --service-config "{\"executionRoleArn\":\"$EXECUTION_ROLE_ARN\",\"environmentVariables\":{\"PUBLIC_API_PREFIX\":\"/api\",\"NODE_ENV\":\"production\",\"AWS_LAMBDA_NODEJS_ENTRYPOINT\":\"build/lambda.js\"}}" \
  --region "$REGION" \
  --query revisionId \
  --output text)
aws lambda-web wait web-function-revision-active \
  --function-name "$FUNCTION_NAME" \
  --revision-id "$REVISION_ID" \
  --region "$REGION"
```

Route the `production` endpoint to the new revision and wait for the endpoint
update to finish:

```bash
aws lambda-web update-web-function-endpoint \
  --function-name "$FUNCTION_NAME" \
  --endpoint-name production \
  --auto-deployment-mode Disabled \
  --revision-weights "[{\"revisionId\":\"$REVISION_ID\",\"weight\":100}]" \
  --region "$REGION"
aws lambda-web wait web-function-endpoint-updated \
  --function-name "$FUNCTION_NAME" \
  --endpoint-name production \
  --region "$REGION"
```

The current backend still reads `UNSPLASH_ACCESS_KEY` from its environment; it
does not yet retrieve the value from the Secrets Manager secret created by the
stack. The commands above do not inject that secret, so Unsplash-backed
functionality will not authenticate until runtime secret retrieval is wired
into the backend. Do not put the key in this README or commit it in deployment
configuration.

See AWS's guides for [deploying Web Function code from S3](https://docs.aws.amazon.com/lambda/latest/dg/web-functions-code-s3.html), [creating revisions](https://docs.aws.amazon.com/lambda/latest/dg/web-functions-revisions.html), and [routing traffic to revisions](https://docs.aws.amazon.com/lambda/latest/dg/web-functions-deployment.html).

The construct's logging and security-header defaults are disabled here: logging
would add S3 buckets, and its default content security policy is too restrictive
for this existing site. Add a site-specific security headers policy if needed.
