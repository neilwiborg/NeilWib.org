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
2. Enable Corepack and activate the pinned pnpm version:
   ```bash
   ./scripts/setup-corepack.sh
   ```
3. Install dependencies:
   ```bash
   pnpm install
   ```

## Environment Variables (Testing)

Before running local testing/smoke checks, create these files:

1. `backend/.env`
2. `frontend/.env`

Use the following variables:

`backend/.env`

```bash
# Optional: backend port (default is 3000 if omitted)
PORT=3000

UNSPLASH_ACCESS_KEY=your_unsplash_access_key
```

`frontend/.env`

```bash
# Backend base URL used by frontend fetch calls
VITE_BACKEND_HOSTNAME=http://localhost:3000
```

## Common Commands

Run frontend + backend together:

```bash
pnpm run dev
```

Run only one app:

```bash
pnpm run dev:frontend
pnpm run dev:backend
```

Workspace-wide checks:

```bash
pnpm run build
pnpm run lint
pnpm run format
```
