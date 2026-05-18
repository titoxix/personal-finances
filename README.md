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
- Docker

## Desarrollo

```bash
pnpm install       # instalar dependencias
pnpm db:up         # levantar PostgreSQL con Docker
pnpm dev           # iniciar servidor de desarrollo
```

Abre [http://localhost:3000](http://localhost:3000) en el navegador.

## Base de datos

Dos instancias PostgreSQL via Docker Compose:

| Instancia | Puerto | Base de datos | Uso |
|---|---|---|---|
| `db` | `5432` | `personal_finances` | Desarrollo |
| `db_test` | `5433` | `personal_finances_test` | Tests |

Credenciales por defecto (ver `.env.example`): usuario `postgres`, contraseña `postgres`.

```bash
pnpm db:up         # levantar contenedores
pnpm db:down       # detener contenedores
pnpm db:reset      # borrar volúmenes y reiniciar limpio
```

Migraciones:

```bash
pnpm prisma migrate dev   # aplicar migraciones en dev
pnpm prisma generate      # regenerar cliente Prisma
```

## Scripts

| Comando | Descripción |
|---|---|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Build de producción |
| `pnpm test` | Tests en modo watch |
| `pnpm test:run` | Tests en modo CI |
| `pnpm test:coverage` | Tests con reporte de coverage |
| `pnpm check` | Lint + formato (read-only) |
| `pnpm check:fix` | Lint + formato con auto-fix |
| `pnpm db:up` | Levantar bases de datos |
| `pnpm db:down` | Detener bases de datos |
| `pnpm db:reset` | Resetear bases de datos |

## Arquitectura

Ver [AGENTS.md](./AGENTS.md) para la documentación completa de arquitectura y convenciones.
