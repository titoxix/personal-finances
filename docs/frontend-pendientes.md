# Frontend — Pendientes

> Revisado el 2026-05-28. Refleja el estado actual del código en `main`.

---

## Alta prioridad

### Bug: TopBar no reconoce las páginas de Ingresos (móvil roto)

- **Archivo:** `src/components/layout/TopBar.tsx`
- **Problema:** `getInnerPage` no cubre `/incomes/new` ni `/incomes/[id]/edit`. En mobile, esas páginas muestran el header principal en lugar del inner header con botón de volver.
- **Fix esperado:** Agregar `/incomes/new` a `STATIC_INNER_PAGES` y un regex para `/incomes/\d+/edit`, igual al patrón de transactions/budgets.

### Bug: TopBar drawer no incluye el link a Ingresos

- **Archivo:** `src/components/layout/TopBar.tsx` (`NAV_ITEMS`)
- **Problema:** `/incomes` (ícono Wallet) está en Sidebar y BottomNav pero no en el drawer del TopBar móvil.
- **Fix esperado:** Agregar `{ href: '/incomes', icon: Wallet, label: 'Ingresos' }` al array `NAV_ITEMS` del TopBar.

### Páginas inexistentes con links activos (404)

- `/analytics` — aparece en Sidebar y TopBar, no tiene `page.tsx`.
- `/settings` — ídem.
- **Fix mínimo:** Crear páginas placeholder. **Fix real:** Implementar cada sección.

---

## Prioridad media

### Exchange Rates — solo create, sin edit ni delete

- No existe `/exchange-rates/[id]/edit`.
- No hay acción `deleteExchangeRate` en `actions.ts`.
- Las tasas registradas son inmutables desde la UI.
- **Fix esperado:** Agregar página de edición y acción de eliminación, siguiendo el mismo patrón que categorías.

### TransactionPageSidebar — datos hardcodeados

- **Archivo:** `src/components/transactions/TransactionPageSidebar.tsx`
- **Problema:** "Gasto por Categoría" usa mock data estático. El botón "Ver detalle →" no hace nada.
- **Fix esperado:** Recibir los datos reales como props desde `TransactionsPage` (gasto por categoría del mes actual, calculado igual que en `BudgetsPage`).

---

## Prioridad baja

### InstallmentPlan — sin ninguna UI

- Service, repositorio y API routes completos, pero no está wired en `lib/container.ts` ni tiene páginas.
- Pantallas mínimas: lista (`/installment-plans`), crear, editar/eliminar.

### MonthlySnapshot — solo lectura en UI

- El balance del sidebar/topbar se lee del último snapshot, pero no hay forma de crear ni editar snapshots desde la app.
- Pantallas mínimas: lista (`/snapshots`), crear.

---

## Completado

### RecurringItem UI ✅ (2026-05-27)

- Wired en `lib/container.ts`.
- Páginas: lista (`/recurring-items`), crear, editar/desactivar.
- Componentes: `RecurringItemForm`, `RecurringItemList`, `RecurringItemCard`.
- Navegación: Sidebar + TopBar drawer + inner pages (new/edit) con botón de volver en móvil.

### CU-01: Proyección de recurrentes en dashboard ✅ (2026-05-28)

- `app/(app)/page.tsx` calcula los recurrentes activos cuyo `billingDay > hoy` como "pendientes del mes".
- `MonthlyOverviewCard` muestra barra de dos segmentos (gastado + comprometido) y breakdown **Gastado | Pendiente | Libre**.
- "Libre" = cap − gastado − pendiente recurrente → responde en tiempo real "¿cuánto puedo gastar hoy?".

---

## Referencia rápida

| Item | Archivo(s) clave | Estado |
|---|---|---|
| TopBar inner pages (incomes) | `TopBar.tsx` | Bug |
| TopBar NAV_ITEMS (incomes) | `TopBar.tsx` | Bug |
| Página `/analytics` | `app/(app)/analytics/page.tsx` | Falta |
| Página `/settings` | `app/(app)/settings/page.tsx` | Falta |
| Exchange rates edit/delete | `app/(app)/exchange-rates/` | Incompleto |
| TransactionPageSidebar real data | `TransactionPageSidebar.tsx` | Mock |
| InstallmentPlan UI | `app/(app)/installment-plans/` | No existe |
| MonthlySnapshot UI | `app/(app)/snapshots/` | No existe |
| RecurringItem UI | `app/(app)/recurring-items/` | ✅ Completo |
| CU-01 proyección dashboard | `app/(app)/page.tsx`, `MonthlyOverviewCard.tsx` | ✅ Completo |
