# Personal Finance App — Database & Use Case Spec

## Contexto del sistema

- Usuario cobra **$5,433 USD/mes** (sueldo fijo, día 27 de cada mes)
- Techo operativo autoimpuesto: **$5,000 USD** — los $433 restantes van automáticamente a ETFs
- Gasta principalmente en **guaraníes (Gs)**, ingresos en **dólares (USD)**
- País: Paraguay. Tipo de cambio variable mensual (referencia: ~5,985 Gs/USD)
- Pagos mayormente con tarjeta de crédito (puntos + beneficios), débito para transferencias grandes
- Carga de gastos: **en tiempo real**, mobile-first

---

## Cuentas y plataformas reales

| Cuenta | Moneda | Uso |
|---|---|---|
| Itaú cuenta corriente | USD | Operativa principal |
| Itaú cuenta corriente | Gs | Operativa principal |
| Ueno Bank | USD | Operativa secundaria |
| Ueno Bank | Gs | Operativa secundaria |
| Mango | Gs | Ocasional |
| Itaú Visa Infiniti | Gs | Tarjeta crédito principal (sin cuotas) |
| Ueno Mastercard | Gs | Tarjeta crédito secundaria (cuotas) |
| Investor (fondo mutuo) | USD | Fondo de emergencia |
| Investor (fondo mutuo) | Gs | Fondo de emergencia |
| XTB | USD | Inversión ETFs largo plazo |
| GNB cuenta corriente | Gs | Vinculada al crédito auto (crédito no es pasivo del usuario) |
| GNB Mastercard Standard | USD | Solo compras digitales internacionales (límite bajo, seguridad) |

> **Nota crédito auto GNB:** el crédito está a nombre de la esposa del usuario y ella lo paga. No se registra como pasivo del usuario — hacerlo distorsionaría su patrimonio neto real.

---

## Sistema de categorías

Cada transacción tiene **dos dimensiones**:

### Dimensión 1: Categoría
```
vivienda
salud
alimentacion
transporte
educacion
familia
digital
ocio
impuestos
compras_grandes
inversion
otros
```

### Dimensión 2: Esencialidad
```
esencial    — No cortable. Sin esto no funciona la vida básica.
importante  — Cortable con dolor. Se reconsideraría en crisis seria.
opcional    — Cortable sin drama.
inversion   — No es gasto, es activo.
```

### Ejemplos de clasificación
| Gasto | Categoría | Esencialidad |
|---|---|---|
| Alquiler | vivienda | esencial |
| Asismed (seguro salud) | salud | esencial |
| Supermercado | alimentacion | esencial |
| Seguro auto | transporte | esencial |
| Babysitter | familia | esencial |
| Cuotas gym en casa | salud | importante |
| Inglés / Platzi | educacion | importante |
| Netflix / HBO | digital | opcional |
| Restaurantes | ocio | opcional |
| IRP (impuesto renta) | impuestos | esencial |
| ETFs XTB | inversion | inversion |

---

## Tablas

### `categories`
Tabla de referencia de categorías. Permite ABM sin romper el historial — nunca borrar, usar `active = false`.

```sql
CREATE TABLE categories (
  id          SERIAL PRIMARY KEY,
  code        VARCHAR(50) NOT NULL UNIQUE,   -- identificador interno: 'alimentacion', 'vivienda'
  label       VARCHAR(100) NOT NULL,          -- texto visible en UI: 'Alimentación', 'Vivienda'
  description TEXT,                           -- descripción de qué incluye esta categoría
  active      BOOLEAN DEFAULT TRUE,           -- desactivar en lugar de borrar
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Datos iniciales
INSERT INTO categories (code, label, description) VALUES
  ('vivienda',        'Vivienda',        'Alquiler, electricidad, internet'),
  ('salud',           'Salud',           'Seguros médicos, consultas, gym'),
  ('alimentacion',    'Alimentación',    'Supermercado, almuerzo, delivery'),
  ('transporte',      'Transporte',      'Seguro auto, nafta, car wash, parking'),
  ('educacion',       'Educación',       'Cursos, plataformas, idiomas'),
  ('familia',         'Familia',         'Babysitter, gastos del bebé'),
  ('digital',         'Digital',         'Suscripciones y servicios digitales'),
  ('ocio',            'Ocio',            'Restaurantes, cine, bares, entretenimiento'),
  ('impuestos',       'Impuestos',       'IRP y obligaciones fiscales'),
  ('compras_grandes', 'Compras grandes', 'Compras no recurrentes mayores a $200'),
  ('inversion',       'Inversión',       'ETFs, fondos mutuos, activos financieros'),
  ('otros',           'Otros',           'Lo que no entra en ninguna categoría');
```

---

### `essentiality_levels`
Tabla de referencia de niveles de esencialidad. Define qué tan cortable es un gasto en caso de ajuste.

```sql
CREATE TABLE essentiality_levels (
  id          SERIAL PRIMARY KEY,
  code        VARCHAR(20) NOT NULL UNIQUE,   -- identificador interno: 'esencial', 'importante'
  label       VARCHAR(50) NOT NULL,           -- texto visible en UI: 'Esencial', 'Importante'
  description TEXT,                           -- criterio de clasificación
  sort_order  SMALLINT NOT NULL,              -- orden lógico para mostrar en UI (1 = más crítico)
  active      BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Datos iniciales
INSERT INTO essentiality_levels (code, label, description, sort_order) VALUES
  ('esencial',   'Esencial',   'No cortable. Sin esto no funciona la vida básica del hogar.', 1),
  ('importante', 'Importante', 'Cortable con dolor. Se reconsideraría solo en crisis seria.', 2),
  ('opcional',   'Opcional',   'Cortable sin drama si hace falta ajustar.',                   3),
  ('inversion',  'Inversión',  'No es gasto, es construcción de activo.',                     4);
```

---

### `income`
Registro mensual de ingresos con lógica de techo operativo.

```sql
CREATE TABLE income (
  id                       SERIAL PRIMARY KEY,
  month                    DATE NOT NULL,              -- primer día del mes: 2026-05-01
  gross_income_usd         DECIMAL(10,2) NOT NULL,     -- 5433.00
  budget_cap_usd           DECIMAL(10,2) NOT NULL,     -- 5000.00
  automatic_investment_usd DECIMAL(10,2) NOT NULL,     -- 433.00 (gross - cap)
  automatic_dest           VARCHAR(50) NOT NULL,       -- 'etf_xtb'
  exchange_rate            DECIMAL(10,2) NOT NULL,     -- tipo de cambio del mes
  notes                    TEXT,
  created_at               TIMESTAMP DEFAULT NOW()
);
```

---

### `transactions`
Corazón del sistema. Un registro por cada gasto real.

```sql
CREATE TABLE transactions (
  id                   SERIAL PRIMARY KEY,
  date                 DATE NOT NULL,
  description          VARCHAR(255) NOT NULL,
  amount_gs            DECIMAL(15,2),                 -- monto en guaraníes (null si es solo USD)
  amount_usd           DECIMAL(10,2),                 -- monto en dólares (null si es solo Gs)
  exchange_rate        DECIMAL(10,2),                 -- tipo de cambio usado (valor numérico)
  exchange_rate_id     INTEGER REFERENCES exchange_rates(id),
  category_id          INTEGER NOT NULL REFERENCES categories(id),
  essentiality_id      INTEGER NOT NULL REFERENCES essentiality_levels(id),
  payment_method       VARCHAR(30) NOT NULL,          -- ver lista de métodos de pago
  week_of_month        SMALLINT,                      -- 1, 2, 3 o 4 (para proyecciones intra-mes)
  is_installment       BOOLEAN DEFAULT FALSE,
  installment_current  SMALLINT,                      -- ej: 3 (de 12)
  installment_total    SMALLINT,                      -- ej: 12
  installment_plan_id  INTEGER REFERENCES installment_plans(id),
  is_recurring         BOOLEAN DEFAULT FALSE,
  notes                TEXT,
  created_at           TIMESTAMP DEFAULT NOW()
);

-- Métodos de pago válidos:
-- itau_visa / ueno_mastercard / itau_debito / ueno_debito / transferencia / mango / gnb_mastercard
```

---

### `installment_plans`
Trackea compras en cuotas completas. Permite a la AI calcular compromisos futuros.

```sql
CREATE TABLE installment_plans (
  id                    SERIAL PRIMARY KEY,
  description           VARCHAR(255) NOT NULL,        -- 'Gym equipamiento'
  total_amount_gs       DECIMAL(15,2),
  total_amount_usd      DECIMAL(10,2),
  installments_total    SMALLINT NOT NULL,             -- 12
  installments_paid     SMALLINT DEFAULT 0,            -- se actualiza cada mes
  installment_amount_gs DECIMAL(15,2),                -- monto de cada cuota
  start_date            DATE NOT NULL,
  end_date              DATE,                          -- calculado: start + installments_total meses
  payment_method        VARCHAR(30) NOT NULL,
  category_id           INTEGER NOT NULL REFERENCES categories(id),
  essentiality_id       INTEGER NOT NULL REFERENCES essentiality_levels(id),
  active                BOOLEAN DEFAULT TRUE,
  notes                 TEXT,
  created_at            TIMESTAMP DEFAULT NOW()
);
```

---

### `budgets`
Presupuesto mensual por categoría. La AI compara contra `transactions` para alertas y proyecciones.

```sql
CREATE TABLE budgets (
  id             SERIAL PRIMARY KEY,
  month          DATE NOT NULL,                       -- primer día del mes: 2026-05-01
  category_id    INTEGER NOT NULL REFERENCES categories(id),
  essentiality_id INTEGER NOT NULL REFERENCES essentiality_levels(id),
  budgeted_usd   DECIMAL(10,2),
  budgeted_gs    DECIMAL(15,2),
  notes          TEXT,
  created_at     TIMESTAMP DEFAULT NOW(),
  UNIQUE(month, category_id)
);
```

---

### `monthly_snapshot`
Foto del patrimonio al cierre de cada mes. Se llena una vez al mes (~5 minutos).

**Flujo de carga:**
1. El usuario ingresa los campos manuales (ingresos, saldos bancarios, inversiones, deudas de tarjeta).
2. El backend calcula automáticamente los campos derivados antes de persistir.
3. El usuario nunca toca los campos calculados — son outputs, no inputs.

**Campos manuales (input del usuario):**
- Ingresos y tipo de cambio
- Saldos de cuentas bancarias (Itaú, Ueno, Mango, GNB)
- Saldo fondo de emergencia Investor (USD y Gs) + rendimiento
- Valor portafolio ETF XTB + rendimiento
- Deuda tarjeta Itaú y Ueno
- Cuotas futuras pendientes

**Campos calculados automáticamente por el backend:**

| Campo | Fórmula |
|---|---|
| `total_debt_usd` | `(itau_card_gs + ueno_card_gs + gnb_card_gs + pending_installments_gs) / exchange_rate` |
| `total_invested_usd` | `etf_portfolio_usd + investor_fund_usd + (investor_fund_gs / exchange_rate)` |
| `net_worth_usd` | `activos_totales_usd − total_debt_usd` |
| `savings_rate_pct` | `(total_invested_usd_delta / income_usd) * 100` — cuánto del ingreso bruto fue a inversión este mes |

donde `activos_totales_usd` = `balance_itau_usd + (balance_itau_gs / exchange_rate) + balance_ueno_usd + (balance_ueno_gs / exchange_rate) + (balance_mango_gs / exchange_rate) + (balance_gnb_gs / exchange_rate) + total_invested_usd`

> El crédito auto GNB **no se incluye en `total_debt_usd`** — está a nombre de la esposa y ella lo paga. Incluirlo distorsionaría el patrimonio neto real.

```sql
CREATE TABLE monthly_snapshot (
  id                       SERIAL PRIMARY KEY,
  month                    DATE NOT NULL UNIQUE,       -- primer día del mes

  -- Ingresos (manual)
  income_usd               DECIMAL(10,2),
  exchange_rate            DECIMAL(10,2),              -- tasa de referencia del mes
  exchange_rate_id         INTEGER REFERENCES exchange_rates(id),

  -- Cash operativo (manual)
  balance_itau_usd         DECIMAL(10,2),
  balance_itau_gs          DECIMAL(15,2),
  balance_ueno_usd         DECIMAL(10,2),
  balance_ueno_gs          DECIMAL(15,2),
  balance_mango_gs         DECIMAL(15,2),

  -- GNB (manual)
  balance_gnb_gs           DECIMAL(15,2),             -- saldo cuenta corriente GNB
  gnb_card_gs              DECIMAL(15,2),             -- saldo tarjeta GNB (debería ser siempre bajo)

  -- Fondo de emergencia Investor (manual)
  investor_fund_usd        DECIMAL(10,2),
  investor_fund_gs         DECIMAL(15,2),
  investor_return_pct      DECIMAL(5,2),              -- rendimiento últimos 12m en %

  -- Inversiones largo plazo (manual)
  etf_portfolio_usd        DECIMAL(10,2),
  etf_return_pct           DECIMAL(5,2),              -- rendimiento últimos 12m en %

  -- Deuda de tarjetas (manual)
  itau_card_gs             DECIMAL(15,2),             -- saldo tarjeta Itaú
  ueno_card_gs             DECIMAL(15,2),             -- saldo tarjeta Ueno
  pending_installments_gs  DECIMAL(15,2),             -- suma cuotas futuras pendientes

  -- CALCULADOS AUTOMÁTICAMENTE POR EL BACKEND — no se ingresan manualmente
  net_worth_usd            DECIMAL(10,2),             -- activos totales − deudas totales
  total_invested_usd       DECIMAL(10,2),             -- ETF + Investor (USD + Gs convertidos)
  total_debt_usd           DECIMAL(10,2),             -- tarjetas + cuotas pendientes en USD
  savings_rate_pct         DECIMAL(5,2),              -- % del ingreso bruto que fue a inversión

  notes                    TEXT,
  created_at               TIMESTAMP DEFAULT NOW()
);
```

---

### `recurring_items`
Catálogo de gastos recurrentes fijos. Permite a la AI proyectar el mes antes de que se cargue cualquier transacción.

```sql
CREATE TABLE recurring_items (
  id              SERIAL PRIMARY KEY,
  description     VARCHAR(255) NOT NULL,               -- 'Netflix', 'Asismed', 'Alquiler'
  amount_gs       DECIMAL(15,2),
  amount_usd      DECIMAL(10,2),
  category_id     INTEGER NOT NULL REFERENCES categories(id),
  essentiality_id INTEGER NOT NULL REFERENCES essentiality_levels(id),
  payment_method  VARCHAR(30) NOT NULL,
  frequency       VARCHAR(20) NOT NULL,                -- 'monthly' / 'annual'
  billing_day     SMALLINT,                            -- día del mes que se cobra (ej: 5)
  billing_month   SMALLINT,                            -- para gastos anuales: mes del año (ej: 3 = marzo)
  is_variable     BOOLEAN DEFAULT FALSE,               -- true si el monto varía (electricidad, IRP)
  active          BOOLEAN DEFAULT TRUE,
  notes           TEXT,
  created_at      TIMESTAMP DEFAULT NOW()
);
```

---

## Relaciones entre tablas

```
categories (N) ◄─────────────── FK desde transactions, budgets, recurring_items, installment_plans
essentiality_levels (N) ◄─────── FK desde transactions, budgets, recurring_items, installment_plans

income (1) ──────────────────── (mes de referencia)
    │
    ├── budgets (N)             por categoría del mes
    │
transactions (N) ──────────────── registro de cada gasto real
    │                              │
    └── installment_plans (1)      └── exchange_rates (1)
                                        ↑
monthly_snapshot (1 por mes) ──────────┘

exchange_rates (N) ─────────── historial de tasas por fuente
                                'itau' / 'ueno' / 'bcp'

recurring_items                catálogo estático de recurrentes
```

---

## Casos de uso que debe soportar el sistema

### CU-01: "¿Cuánto puedo invertir este mes?"
**Tablas:** `income` + `transactions` + `installment_plans` + `recurring_items`
**Lógica:**
1. Tomar `budget_cap_usd` del mes desde `income`
2. Sumar transacciones reales del mes en curso desde `transactions`
3. Proyectar recurrentes aún no cobradas desde `recurring_items`
4. Calcular cuotas que vencen este mes desde `installment_plans`
5. Resultado = cap - gastado - proyectado pendiente

---

### CU-02: "¿Puedo comprarme X cosa que cuesta $Y?"
**Tablas:** `income` + `transactions` + `budgets` + `installment_plans`
**Lógica:**
1. Calcular margen libre del mes (mismo que CU-01)
2. Comparar $Y contra margen libre
3. Verificar si agregaría presión a cuotas futuras
4. Si no cabe este mes: calcular en cuántos días/semanas podría comprarlo
5. Sugerir estrategia (cuotas sin interés vs contado, timing óptimo del mes)

---

### CU-03: "¿En qué estoy gastando de más?"
**Tablas:** `transactions` + `budgets`
**Lógica:**
1. Comparar `transactions` por categoría vs `budgets` del mes
2. Detectar categorías con desvío > 10%
3. Comparar contra promedio histórico de los últimos 3 meses
4. Mostrar ranking de desvíos

---

### CU-04: Proyección intra-mes por categoría
**Tablas:** `transactions` (historial) con `week_of_month`
**Lógica:**
1. Analizar patrón semanal histórico de la categoría (ej: supermercado semana 1, 2, 3, 4)
2. Con las semanas transcurridas del mes actual, proyectar cierre del mes
3. Alertar proactivamente si la proyección supera el presupuesto de la categoría
4. Recalcular cada vez que se carga una nueva transacción

---

### CU-05: "¿Cuánto me cuesta vivir mínimo?"
**Tablas:** `transactions` filtrado por `essentiality = 'esencial'`
**Lógica:**
1. Promedio de los últimos 3-6 meses de gastos esenciales
2. Separar en categorías para ver dónde está el peso
3. Útil para calcular: meses cubiertos por fondo de emergencia

---

### CU-06: Evolución del patrimonio
**Tablas:** `monthly_snapshot` histórico
**Lógica:**
1. Serie temporal de `net_worth_usd` mes a mes
2. Tasa de crecimiento del portafolio ETF
3. Comparar `savings_rate_pct` vs target del usuario

---

### CU-07: Gestión de cuotas activas
**Tablas:** `installment_plans`
**Lógica:**
1. Listar planes activos con cuotas restantes
2. Calcular compromiso total futuro en USD
3. Proyectar mes a mes cuándo termina cada plan
4. Alertar si acumulás demasiadas cuotas simultáneas

---

### CU-08: Alerta de gastos anuales (IRP y similares)
**Tablas:** `recurring_items` con `frequency = 'annual'`
**Lógica:**
1. Identificar gastos anuales y su mes de vencimiento
2. Calcular provisión mensual necesaria
3. Alertar 3 meses antes con monto a apartar por mes

---

## Datos iniciales sugeridos para `recurring_items`

| Descripción | Monto Gs | Categoría | Esencialidad | Frecuencia | Día cobro | Método pago | Es variable |
|---|---|---|---|---|---|---|---|
| Alquiler apartamento | 7,000,000 | vivienda | esencial | monthly | 1 | transferencia | no |
| Internet + contrato celular | 295,000 | vivienda | esencial | monthly | 4 | itau_visa | no |
| Asismed | 1,369,000 | salud | esencial | monthly | 10 | itau_visa | no |
| Electricidad apartamento | 618,422 | vivienda | esencial | monthly | 13 | itau_visa | **sí** — usar como estimación base |
| Seguro auto | 470,483 | transporte | esencial | monthly | 17 | itau_visa | no |
| Babysitter | 1,500,000 | familia | esencial | monthly | 28 | transferencia | no |
| Cuota gym (equipamiento) | 1,322,862 | salud | importante | monthly | (confirmar) | ueno_mastercard | no |
| Netflix | (confirmar) | digital | opcional | monthly | (confirmar) | gnb_mastercard | no |
| HBO | (confirmar) | digital | opcional | monthly | (confirmar) | gnb_mastercard | no |
| Claude Code | (confirmar) | digital | importante | monthly | (confirmar) | gnb_mastercard | no |
| GitHub | (confirmar) | digital | importante | monthly | (confirmar) | gnb_mastercard | no |
| Inglés | (confirmar) | educacion | importante | monthly | (confirmar) | gnb_mastercard | no |
| Platzi | 1,483,789 | educacion | importante | annual | 30 enero | gnb_mastercard | no |
| IRP | 6,648,000 | impuestos | esencial | annual | 25 marzo | transferencia | **sí** — varía según contador |

> **Nota electricidad:** 618,422 Gs es el último valor registrado. La AI lo usa como estimación y recalcula el promedio histórico cada vez que se carga un recibo real en `transactions`.

> **Nota IRP:** 6,648,000 Gs es referencia del último año. La AI debe alertar en diciembre para provisionar ~554,000 Gs/mes durante enero–marzo. Monto final lo confirma el contador.

> **Nota Platzi:** cobro anual en USD via GNB Mastercard. Registrar también en `transactions` como gasto real cuando se efectúe el cobro.

---

### `exchange_rates`
Historial de tipos de cambio por fuente. Se carga manualmente cuando el usuario consulta las tasas. Cada registro es una foto en el tiempo — los anteriores nunca se modifican.

```sql
CREATE TABLE exchange_rates (
  id           SERIAL PRIMARY KEY,
  recorded_at  TIMESTAMP NOT NULL DEFAULT NOW(),  -- fecha y hora exacta del registro
  source       VARCHAR(20) NOT NULL,              -- 'itau' / 'ueno' / 'bcp'
  rate_buy     DECIMAL(10,2),                     -- tasa compra (banco te compra tus USD)
                                                  -- null para BCP (publica tasa media)
  rate_sell    DECIMAL(10,2),                     -- tasa venta (banco te vende USD)
                                                  -- null para BCP (publica tasa media)
  rate_mid     DECIMAL(10,2),                     -- tasa media / referencia
                                                  -- obligatorio para BCP, opcional para bancos
  notes        TEXT,                              -- contexto opcional
  created_at   TIMESTAMP DEFAULT NOW()
);
```

**Regla de carga:** cada vez que el usuario registra tasas, carga una fila por fuente. Mínimo dos filas por sesión (Itaú + Ueno). BCP cuando esté disponible.

**Lo que la AI puede hacer con este historial:**
- Comparación inmediata: "Hoy conviene cambiar en Itaú — diferencia de X Gs/USD, en $1,000 son X Gs"
- Spread bancario: alertar si un banco está cobrando un spread inusualmente alto vs su propio historial
- Tendencia: detectar si el guaraní se está depreciando y cuánto impacta el costo de vida real en USD
- Timing: patrones de cuándo sube o baja la tasa (requiere varios meses de datos)

---

## Notas de implementación para Claude Code

1. **Moneda principal de análisis:** USD. Todos los montos en Gs se convierten usando el `exchange_rate` de la transacción o del mes correspondiente.

2. **Campo `week_of_month`:** calcular automáticamente en el backend al insertar una transacción: semana 1 = días 1-7, semana 2 = 8-14, semana 3 = 15-21, semana 4 = 22+.

3. **`end_date` en `installment_plans`:** calcular automáticamente: `start_date + installments_total meses`.

4. **Proyecciones de la AI:** la AI recibirá como contexto las 3 tablas principales (transactions del mes, budgets del mes, snapshot del mes anterior) para cualquier consulta en tiempo real.

5. **Mobile-first:** el formulario de carga de transacción debe funcionar en 3-4 taps: monto → categoría → método de pago → confirmar. Descripción y notas opcionales.

6. **Control GNB Mastercard:** esta tarjeta solo debe tener transacciones de `category = 'digital'` o `category = 'educacion'` con servicios internacionales. Si la AI detecta un cargo en GNB de otra categoría o un monto inusualmente alto, debe alertar al usuario — puede indicar una suscripción no autorizada o filtración de datos de la tarjeta.

7. **Tipo de cambio — tres fuentes:** `itau` y `ueno` tienen `rate_buy` y `rate_sell`. `bcp` solo tiene `rate_mid` (tasa de referencia oficial). El spread bancario se calcula como `(bcp.rate_mid - bank.rate_buy) / bcp.rate_mid * 100`. La AI debe alertar si el spread de un banco supera su promedio histórico en más de 0.5%.

8. **Evolución futura del tipo de cambio:** la tabla `exchange_rates` está diseñada para que eventualmente una fuente `'bcp'` pueda cargarse automáticamente via API o scraping del sitio del BCP, sin cambios de esquema.
