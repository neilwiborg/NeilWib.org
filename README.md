# NeilWib.org Monorepo

TypeScript monorepo with:

- `frontend` (React + Vite)
- `backend` (Node + TypeScript)

## New Machine Setup

1. Install and use the Node version pinned by this repo:

   ```bash
   nvm install
   nvm use
   ```
2. Install/enable Corepack and set up the pinned pnpm version:

   ```bash
   npm run setup:pnpm
   ```
3. Install dependencies:

   ```bash
   pnpm install
   ```

## Environment Variables (Testing)

The repo includes a committed root `.env.development` with non-secret settings
shared by the frontend and backend. Backend development sets
`NODE_ENV=development`, and dotenv-flow uses it to load the root
`.env.development` and optional, gitignored `.env.development.local` overrides.
Both apps read env files from the monorepo root; don't create app-level `.env`
files. Put local secrets such as the Unsplash access key in the root
`.env.development.local`. Production deployments should set `NODE_ENV` in the
runtime environment; for Lambda, set it in the function's environment
variables. The backend TypeScript build does not set it.

Before running local testing/smoke checks, create the root file:

`.env.development.local`

```bash
UNSPLASH_ACCESS_KEY=your_unsplash_access_key
```

The infrastructure routes `/api` through CloudFront. The frontend reads its
prefix from `VITE_API_PREFIX`, and the backend reads `PUBLIC_API_PREFIX` at
startup to build URLs it returns to clients. If you change the prefix, update
the infrastructure constant and both app environment values together.

During development, Vite listens on `FRONTEND_PORT` and proxies `/api` requests
to the backend using `API_PORT`; both values are in the root
`.env.development`. `FRONTEND_PORT` is read only by Vite's config and is not
exposed to browser code.

The backend also has a Lambda Web Function entry point. Configure Web Function
deployments to use `build/lambda.js` as the Node.js entry point. Lambda supplies
`AWS_LAMBDA_HTTP_ENDPOINT` at runtime, and the entry point listens on that
address.

## Common Commands

Run frontend + backend together:

```bash
pnpm run dev
```

Build the backend Lambda Web Function package:

```bash
pnpm run backend:package:lambda
```

This builds the backend and writes the deployable package to
`backend/lambda-package`. Configure the Web Function entry point as
`build/lambda.js`.

Workspace-wide checks:

```bash
pnpm run build
pnpm run lint
pnpm run format
```
