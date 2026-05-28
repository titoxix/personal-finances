# Frontend — Pendientes

> Revisado el 2026-05-28. Refleja el estado actual del código en `main`.

---

## Alta prioridad

_Sin items pendientes de alta prioridad._

---

## Prioridad media

### Exchange Rates — solo create, sin edit ni delete

- No existe `app/(app)/exchange-rates/[id]/edit/page.tsx`.
- No hay acción `deleteExchangeRate` en `app/(app)/exchange-rates/actions.ts`.
- Las tasas registradas son inmutables desde la UI.
- **Fix esperado:** Agregar página de edición y acción de eliminación, siguiendo el mismo patrón que categorías.

### TransactionPageSidebar — datos hardcodeados

- **Archivo:** `src/components/transactions/TransactionPageSidebar.tsx`
- **Problema:** "Gasto por Categoría" usa mock data estático (`SPENDING_BY_CATEGORY`). El botón "Ver detalle →" no hace nada.
- **Fix esperado:** Recibir los datos reales como props desde `TransactionsPage` (gasto por categoría del mes actual, calculado igual que en `BudgetsPage`).

---

## Prioridad baja

### Analytics y Settings — implementación futura

- Los links están visibles en Sidebar y TopBar drawer pero **no son clickeables** — muestran badge "PRONTO" y cursor deshabilitado.
- Cuando se quiera implementar: crear `app/(app)/analytics/page.tsx` y `app/(app)/settings/page.tsx`, luego quitar `comingSoon: true` del item correspondiente en `NAV_ITEMS` de `Sidebar.tsx` y `TopBar.tsx`.

### InstallmentPlan — sin ninguna UI

- Service, repositorio y API routes completos, pero **no está wired en `lib/container.ts`** ni tiene páginas UI.
- Pantallas mínimas: lista (`/installment-plans`), crear, editar/eliminar.
- Pasos: 1) agregar `installmentPlanService` en `container.ts`, 2) crear páginas y componentes.

### MonthlySnapshot — solo lectura en UI

- `monthlySnapshotService` ya está wired en `lib/container.ts` ✓.
- No hay forma de crear ni editar snapshots desde la app.
- Pantallas mínimas: lista (`/snapshots`), crear.

---

## Completado

### Analytics y Settings — links deshabilitados ✅ (2026-05-28)

Las secciones aún no están implementadas pero los links en nav dejaban caer en 404. Solución: en lugar de crear páginas placeholder vacías, se agregó un flag `comingSoon: true` al item de `NAV_ITEMS` en `Sidebar.tsx` y `TopBar.tsx`. Los items con ese flag se renderizan como `<div>` (no navegan) con estilo apagado (`text-muted-foreground/40`, `cursor-not-allowed`) y un badge "PRONTO" alineado a la derecha. Los items clickeables siguen siendo `<Link>` sin cambios.

```ts
// Sidebar.tsx / TopBar.tsx — NAV_ITEMS
{ href: '/analytics', icon: TrendingUp, label: 'Analytics', comingSoon: true },
{ href: '/settings',  icon: Settings,   label: 'Settings',  comingSoon: true },
```

```tsx
// Render condicional en el map de NAV_ITEMS
if (comingSoon) {
  return (
    <div className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5
                    text-sm font-medium text-muted-foreground/40">
      <Icon className="h-4 w-4 shrink-0" />
      {label}
      <span className="ml-auto rounded-full bg-muted px-1.5 py-0.5
                       text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/60">
        Pronto
      </span>
    </div>
  )
}
```

### TopBar bugs de Ingresos ✅ (2026-05-28)

- `STATIC_INNER_PAGES` ahora incluye `/incomes/new` → `'Nuevo Ingreso'`.
- `getInnerPage` ahora cubre `/incomes/\d+/edit` → `'Editar Ingreso'`.
- `NAV_ITEMS` del drawer ahora incluye `{ href: '/incomes', icon: Wallet, label: 'Ingresos' }`.

### RecurringItem UI ✅ (2026-05-27)

- Wired en `lib/container.ts`.
- Páginas: lista (`/recurring-items`), crear, editar/desactivar.
- Componentes: `RecurringItemForm`, `RecurringItemList`, `RecurringItemCard`.
- Navegación: Sidebar + TopBar drawer + BottomNav inner pages (new/edit) con botón de volver en móvil.

### CU-01: Proyección de recurrentes en dashboard ✅ (2026-05-28)

- `app/(app)/page.tsx` calcula los recurrentes activos cuyo `billingDay > hoy` como "pendientes del mes".
- `MonthlyOverviewCard` muestra barra de dos segmentos (gastado + comprometido) y breakdown **Gastado | Pendiente | Libre**.
- "Libre" = cap − gastado − pendiente recurrente → responde en tiempo real "¿cuánto puedo gastar hoy?".

---

## Referencia rápida

| Item | Archivo(s) clave | Estado |
|---|---|---|
| Exchange rates edit/delete | `app/(app)/exchange-rates/` | Incompleto |
| TransactionPageSidebar real data | `TransactionPageSidebar.tsx` | Mock |
| Analytics y Settings | `Sidebar.tsx`, `TopBar.tsx` | Deshabilitado (Pronto) |
| InstallmentPlan UI | `app/(app)/installment-plans/` | No existe (sin wiring) |
| MonthlySnapshot UI | `app/(app)/snapshots/` | No existe (wiring ✓) |
| TopBar inner pages (incomes) | `TopBar.tsx` | ✅ Completo |
| TopBar NAV_ITEMS (incomes) | `TopBar.tsx` | ✅ Completo |
| RecurringItem UI | `app/(app)/recurring-items/` | ✅ Completo |
| CU-01 proyección dashboard | `app/(app)/page.tsx`, `MonthlyOverviewCard.tsx` | ✅ Completo |
