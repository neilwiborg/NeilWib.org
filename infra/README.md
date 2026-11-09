# Frontend hosting infrastructure

The CDK stack uses AWS Solutions Constructs' `CloudFrontToS3` pattern to create
a private S3 bucket and CloudFront distribution with Origin Access Control.
The CloudFront Function rewrites HTML GET requests for React Router paths to
`index.html`; static asset requests pass through unchanged.
The bucket is retained if the stack is removed.
The distribution uses CloudFront `PriceClass_100`, covering North America and
Europe; visitors elsewhere may see higher latency.

This first version uses CloudFront's generated hostname. It does not configure a
custom domain or Route 53. CloudFront forwards `/api` requests to the existing
`api.neilwib.org` backend and strips the `/api` prefix before forwarding. Set
`PUBLIC_API_PREFIX=/api` in the backend environment so generated image URLs use
the public path.

Changes to the infrastructure on `mainline` are deployed by GitHub Actions
after the CDK synth check passes. The workflow uses GitHub OIDC rather than
long-lived AWS keys. Configure the repository variable `AWS_ROLE_ARN` with an
IAM role trusted for this repository's `mainline` branch. Before its first run,
bootstrap the AWS account as described below. This workflow deploys the CDK
stack only; frontend files are still uploaded manually.

## Deploy the infrastructure

Configure AWS credentials, then bootstrap CDK in `us-west-2` once:

```bash
pnpm --filter infrastructure exec cdk bootstrap aws://ACCOUNT_ID/us-west-2
```

Review and deploy the stack:

```bash
pnpm infra:diff
pnpm infra:deploy
```

The stack outputs `SiteUrl`, `DistributionDomainName`, `DistributionId`, and
`SiteBucketName`.

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

The construct's logging and security-header defaults are disabled here: logging
would add S3 buckets, and its default content security policy is too restrictive
for this existing site. Add a site-specific security headers policy if needed.

When adding `neilwib.org` later, CloudFront requires an ACM certificate from
`us-east-1`; the S3 bucket and stack remain in `us-west-2`.
