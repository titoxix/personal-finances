<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Task history

The `/tasks` directory contains context on pending and completed tasks. Review it when you need to understand what has already been done or what work is still in progress.

---

# Definition of Done

**Every task is complete only when all three checks pass.** Run them in this order after any change, before reporting the task as done:

```bash
pnpm check          # Biome: lint + format (0 errors required)
pnpm typecheck      # TypeScript: tsc --noEmit (0 type errors required)
pnpm test:run       # Vitest: all tests must pass
```

If any check fails, fix the issue and re-run before proceeding. Do not skip, suppress, or work around a failing check — fix the root cause.

---

# Architecture

Personal finance PWA (mobile-first). Backend and frontend live in the same Next.js project.

## Layer structure

```
src/
├── domain/
│   ├── entities/        # Pure TypeScript types — no framework deps
│   └── repositories/    # Interfaces only: ITransactionRepository, etc.
│
├── repositories/
│   └── prisma/          # Prisma implementations of domain interfaces
│
├── services/            # Business logic — depends on repository interfaces, not implementations
│
├── app/
│   ├── api/             # Next.js route handlers — external HTTP API only
│   └── (app)/           # UI route group — all screens live here
│
├── components/
│   ├── ui/              # shadcn — CLI only, never edit manually
│   ├── layout/          # App shell: BottomNav, PageHeader
│   ├── transactions/    # Feature components: TransactionForm, TransactionCard
│   └── categories/      # Feature components: CategoryForm, CategoryList, CategoryItem
│
└── lib/
    ├── container.ts     # DI wiring — exports pre-built service instances
    └── utils.ts
```

**Backend data flow:** `API Route → Service → IRepository → PrismaRepository → DB`

**Frontend data flow:** `page.tsx (Server Component) → lib/container.ts → Service → DB`

**Mutation flow:** `"use client" Form → Server Action (actions.ts) → lib/container.ts → Service → revalidatePath`

## Rules

- `domain/` has zero dependencies on frameworks, Prisma, or Next.js.
- **Functional style only — no classes.** Use factory functions everywhere: `createPrismaXxxRepository(prisma)` for repositories, `createXxxService(repo)` for services. Never use `class` or `new`.
- **Dependency injection via parameters.** Services receive their repository as a function parameter typed as the interface (`ICategoryRepository`), not the concrete implementation. This decouples the service from Prisma and makes it trivially testable by passing a mock object with `vi.fn()` methods.
- **Closure over dependencies.** The object returned by a factory function closes over the injected parameter — all returned methods share access to `repo` or `prisma` without needing `this`. This is the functional equivalent of a `private readonly` field in a class.
- Route handlers only handle HTTP: parse input, call service, return response. No business logic here.
- No DTOs or mappers unless domain and DB models diverge significantly.
- No use case layer — services cover orchestration at this scale.

## How to add a new backend feature

1. Add or update the entity type in `domain/entities/`.
2. Add the method signature to the interface in `domain/repositories/`.
3. Implement the method in `repositories/prisma/Prisma<Entity>Repository.ts`.
4. Add or update the service method in `services/<Entity>Service.ts`.
5. Export the service instance from `lib/container.ts`.
6. Add or update the route handler in `app/api/<resource>/route.ts`.
7. Write tests at each layer (see Testing section).

## How to add a new UI screen

1. Create the page at `app/(app)/<feature>/page.tsx` — always a Server Component.
2. Import the service from `lib/container.ts` and call it directly (no `fetch`).
3. Create feature components in `components/<feature>/` — use `"use client"` only for interactive parts.
4. For mutations, create `app/(app)/<feature>/actions.ts` with `"use server"` functions.
5. Server Actions call `lib/container.ts` → service, then `revalidatePath` + `redirect`.

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
- **Node version:** 24.17.0 (see `.nvmrc`)

## UI conventions

- shadcn components live in `src/components/ui/` — do not edit them manually, use the CLI: `pnpm dlx shadcn@latest add <component>`
- Dark mode is enabled by default via the `dark` class on `<html>` in `layout.tsx`
- Font: Geist Sans loaded via `next/font/google`, injected as `--font-geist-sans`
- When adding shadcn components, check `components.json` for the current style/registry config

---

## Frontend architecture

### Route map

All UI screens live inside the `(app)` route group, which owns the mobile shell (bottom nav, safe-area padding).

```
app/
└── (app)/
    ├── layout.tsx              # Mobile shell — renders BottomNav, applies safe-area padding
    ├── page.tsx                # Home / Dashboard
    ├── transactions/
    │   ├── actions.ts          # Server Actions: createTransaction
    │   └── new/
    │       └── page.tsx        # New transaction form
    └── categories/
        ├── actions.ts          # Server Actions: createCategory, updateCategory, deleteCategory
        ├── page.tsx            # Category list
        ├── new/
        │   └── page.tsx        # New category form
        └── [id]/
            └── edit/
                └── page.tsx    # Edit category form
```

### Component map

```
components/
├── ui/                         # shadcn — CLI only, never edit manually
├── layout/
│   ├── BottomNav.tsx           # "use client" — active route needs usePathname
│   └── PageHeader.tsx          # Server Component — title + optional back button
├── transactions/
│   ├── TransactionForm.tsx     # "use client" — calls createTransaction server action
│   └── TransactionCard.tsx     # Server Component — display only
└── categories/
    ├── CategoryForm.tsx        # "use client" — calls createCategory / updateCategory
    ├── CategoryList.tsx        # Server Component — renders list of CategoryItem
    └── CategoryItem.tsx        # Server Component — single row with edit/delete actions
```

### Dependency injection on the frontend

`lib/container.ts` is the single file that wires the DI graph. It is the only place that imports `prisma`, repositories, and services together. Pages and Server Actions import pre-built instances from here — they never construct services themselves.

```ts
// lib/container.ts
import { prisma } from '@/lib/prisma'
import { createPrismaCategoryRepository } from '@/repositories/prisma/PrismaCategoryRepository'
import { createCategoryService } from '@/services/CategoryService'

export const categoryService = createCategoryService(
  createPrismaCategoryRepository(prisma)
)
// add more services as the app grows
```

### Server Component page pattern

Pages are `async` Server Components. They fetch data by calling the service directly — no `fetch()`, no API round-trip.

```ts
// app/(app)/categories/page.tsx
import { categoryService } from '@/lib/container'
import { CategoryList } from '@/components/categories/CategoryList'

export default async function CategoriesPage() {
  const categories = await categoryService.getAll()
  return <CategoryList categories={categories} />
}
```

### Server Action pattern

Mutations live in `actions.ts` co-located with their route segment. They are `"use server"` functions that call the service, then invalidate the cache and redirect.

```ts
// app/(app)/categories/actions.ts
'use server'
import { categoryService } from '@/lib/container'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createCategory(formData: FormData) {
  const name = formData.get('name') as string
  await categoryService.create({ name })
  revalidatePath('/categories')
  redirect('/categories')
}
```

### Client Component form pattern

Forms are `"use client"` components. They receive the Server Action as a prop or import it directly, and use it as the `action` on a `<form>` or via `useActionState`.

```ts
// components/categories/CategoryForm.tsx
'use client'
import { createCategory } from '@/app/(app)/categories/actions'

export function CategoryForm() {
  return (
    <form action={createCategory}>
      <input name="name" />
      <button type="submit">Save</button>
    </form>
  )
}
```

### Rules

- **`page.tsx` is always a Server Component** — never add `"use client"` to a page file. If a page needs interactivity, extract it into a component.
- **Never `fetch()` the own API routes from the UI** — Server Components call services directly; Client Components call Server Actions. The `app/api/` routes are the external HTTP interface only.
- **`lib/container.ts` is the only DI wiring point** — add new service instances here as the app grows.
- **`actions.ts` is co-located with its route segment** — category actions live in `app/(app)/categories/actions.ts`, not in a global file.
- **`"use client"` boundary is at the form/interactive component level** — keep Server Components as high as possible in the tree to maximise server-side rendering.
