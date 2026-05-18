<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Architecture

Personal finance PWA (mobile-first). Backend and frontend live in the same Next.js project.

## Layer structure

```
src/
├── domain/
│   ├── entities/        # Pure TypeScript types and classes — no framework deps
│   └── repositories/    # Interfaces only: ITransactionRepository, etc.
│
├── repositories/
│   └── prisma/          # Prisma implementations of domain interfaces
│
├── services/            # Business logic — depends on repository interfaces, not implementations
│
└── app/
    └── api/             # Next.js route handlers — HTTP layer only, calls services
```

**Data flow:** `API Route → Service → IRepository (interface) → PrismaRepository → DB`

## Rules

- `domain/` has zero dependencies on frameworks, Prisma, or Next.js.
- **Functional style only — no classes.** Use factory functions everywhere: `createPrismaXxxRepository(prisma)` for repositories, `createXxxService(repo)` for services. Never use `class` or `new`.
- **Dependency injection via parameters.** Services receive their repository as a function parameter typed as the interface (`ICategoryRepository`), not the concrete implementation. This decouples the service from Prisma and makes it trivially testable by passing a mock object with `vi.fn()` methods.
- **Closure over dependencies.** The object returned by a factory function closes over the injected parameter — all returned methods share access to `repo` or `prisma` without needing `this`. This is the functional equivalent of a `private readonly` field in a class.
- Route handlers only handle HTTP: parse input, call service, return response. No business logic here.
- No DTOs or mappers unless domain and DB models diverge significantly.
- No use case layer — services cover orchestration at this scale.

## How to add a new feature

1. Add or update the entity type in `domain/entities/`.
2. Add the method signature to the interface in `domain/repositories/`.
3. Implement the method in `repositories/prisma/Prisma<Entity>Repository.ts`.
4. Add or update the service method in `services/<Entity>Service.ts`.
5. Add or update the route handler in `app/api/<resource>/route.ts`.
6. Write tests at each layer (see Testing section).

## Testing

Tests are co-located with the file they test (`Foo.ts` → `Foo.test.ts`).

| Layer | Type | What to mock |
|---|---|---|
| `domain/` + `services/` | Unit (Vitest) | Repository interface (vi.fn()) |
| `repositories/` | Integration (Vitest) | Nothing — uses a real test DB |
| `app/api/` | Integration (Vitest) | Optional |

This project uses **TDD**: write the test first, then the implementation.

## Validation

Zod is used for schema validation at two boundaries:

1. **API request bodies** — validate input in route handlers before passing to services
2. **API responses** — parse and validate the shape of data returned to the client

Schemas live in `domain/entities/` alongside the entity they describe.

```ts
// domain/entities/transaction.ts
export const TransactionSchema = z.object({ ... })
export type Transaction = z.infer<typeof TransactionSchema>
```

Never use Zod inside services or repositories — validation belongs at the HTTP boundary only.

## Database

Two PostgreSQL instances via Docker Compose:

| Instance | Port | Database | Purpose |
|---|---|---|---|
| `db` | `5432` | `personal_finances` | Development |
| `db_test` | `5433` | `personal_finances_test` | Integration tests |

- Schema is defined in `prisma/schema.prisma`
- Client is generated to `src/generated/prisma` (gitignored — run `pnpm prisma generate` after clone)
- Migrations live in `prisma/migrations/` and are committed to the repo
- Never edit `src/generated/prisma` manually

After cloning, run:
```bash
pnpm db:up
pnpm prisma migrate dev
pnpm prisma generate
```

## Tech stack

- **Framework:** Next.js 16 (App Router)
- **ORM:** Prisma 7
- **Database:** PostgreSQL 17 (Docker Compose)
- **Validation:** Zod 4
- **Testing:** Vitest
- **UI components:** shadcn/ui (Radix, Nova preset)
- **Styling:** Tailwind CSS 4
- **Linting/formatting:** Biome 2
- **Language:** TypeScript
- **Package manager:** pnpm (always — never npm or yarn)
- **Node version:** 22.20.0 (see `.nvmrc`)

## UI conventions

- shadcn components live in `src/components/ui/` — do not edit them manually, use the CLI: `pnpm dlx shadcn@latest add <component>`
- Dark mode is enabled by default via the `dark` class on `<html>` in `layout.tsx`
- Font: Geist Sans loaded via `next/font/google`, injected as `--font-geist-sans`
- When adding shadcn components, check `components.json` for the current style/registry config
