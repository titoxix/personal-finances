# Personal Finances

Mobile-first PWA for personal finance tracking.

## Stack

- **Framework:** Next.js 16 (App Router)
- **ORM:** Prisma 7
- **Validation:** Zod 4
- **UI:** shadcn/ui (Radix, Nova preset) + Tailwind CSS 4
- **Testing:** Vitest + React Testing Library
- **Linting/Formatting:** Biome 2
- **Language:** TypeScript
- **Node:** 24.17.0

## Requirements

- Node 24.17.0 (use `nvm use`)
- pnpm
- Docker

## Development

```bash
pnpm install       # install dependencies
pnpm db:up         # start PostgreSQL with Docker
pnpm dev           # start development server
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database

Two PostgreSQL instances via Docker Compose:

| Instance | Port | Database | Purpose |
|---|---|---|---|
| `db` | `5432` | `personal_finances` | Development |
| `db_test` | `5433` | `personal_finances_test` | Tests |

Default credentials (see `.env.example`): user `postgres`, password `postgres`.

```bash
pnpm db:up         # start containers
pnpm db:down       # stop containers
pnpm db:reset      # delete volumes and restart clean
```

Migrations:

```bash
pnpm prisma migrate dev   # apply migrations in dev
pnpm prisma generate      # regenerate Prisma client
```

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Development server |
| `pnpm build` | Production build |
| `pnpm test` | Tests in watch mode |
| `pnpm test:run` | Tests in CI mode |
| `pnpm test:coverage` | Tests with coverage report |
| `pnpm check` | Lint + format (read-only) |
| `pnpm check:fix` | Lint + format with auto-fix |
| `pnpm db:up` | Start databases |
| `pnpm db:down` | Stop databases |
| `pnpm db:reset` | Reset databases |

## Architecture

See [AGENTS.md](./AGENTS.md) for the full architecture and conventions documentation.
