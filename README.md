# Personal Finances

PWA mobile-first para el control de finanzas personales.

## Stack

- **Framework:** Next.js 16 (App Router)
- **ORM:** Prisma 7
- **Validación:** Zod 4
- **UI:** shadcn/ui (Radix, Nova preset) + Tailwind CSS 4
- **Testing:** Vitest + React Testing Library
- **Linting/Formato:** Biome 2
- **Lenguaje:** TypeScript
- **Node:** 22.20.0

## Requisitos

- Node 22.20.0 (usar `nvm use`)
- pnpm

## Desarrollo

```bash
pnpm install
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en el navegador.

## Scripts

| Comando | Descripción |
|---|---|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Build de producción |
| `pnpm test` | Tests en modo watch |
| `pnpm test:run` | Tests en modo CI |
| `pnpm check` | Lint + formato (read-only) |
| `pnpm check:fix` | Lint + formato con auto-fix |

## Arquitectura

Ver [AGENTS.md](./AGENTS.md) para la documentación completa de arquitectura y convenciones.
