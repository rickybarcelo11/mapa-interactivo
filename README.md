## Mapa Interactivo – Frontend (Next.js + Prisma + Neon)

Aplicación web para gestionar sectores, tareas, trabajadores e inventario de arbolado urbano con mapas interactivos. Construida con Next.js (App Router), React, TypeScript, Prisma y PostgreSQL (Neon). Incluye importación desde Excel y vistas de informes.

---

## Tabla de contenidos
- Requisitos
- Instalación rápida
- Variables de entorno
- Base de datos (Neon + Prisma)
- Ejecutar en desarrollo y producción
- Estructura del proyecto
  - Arquitectura del sistema
  - Estructura de carpetas detallada
- Flujo y arquitectura
- Endpoints API
- Importación de árboles desde Excel
- Modo sin base de datos (mocks)
- Despliegue
- Solución de problemas

---

## Documentación Técnica

### Arquitectura del sistema
- **Frontend**: Next.js 15 (App Router) + React 19 + TypeScript. UI basada en shadcn/ui (Radix) y Tailwind.
- **Estado**: Zustand para estado global simple y componible.
- **Validación**: Zod para validar inputs y DTOs entre UI y API.
- **Mapas**: Leaflet + React-Leaflet para representación de sectores y árboles.
- **Backend (API interna)**: Rutas en `app/api/**` ejecutadas en runtime Node.js. Orquestan lógica de servicios.
- **Capa de servicios**: `src/services/**` implementa casos de uso (paginación, filtros, normalizaciones, historiales, importaciones) y accede a Prisma.
- **Persistencia**: Prisma ORM contra PostgreSQL (Neon). Esquema en `prisma/schema.prisma`. Migraciones versionadas en `prisma/migrations/**`.
- **Entorno**: `DATABASE_URL` inyectada vía `.env.local` o variables del proveedor. En desarrollo, Prisma client se reutiliza para evitar fugas por HMR.

Diagrama lógico (alto nivel):

UI (React/Next) → API interna (`app/api/*`) → Servicios (`src/services/*`) → Prisma (`src/server/db/prisma.ts`) → PostgreSQL (Neon)

### Estructura de carpetas detallada y responsabilidades
- `app/`
  - `page.tsx` y subrutas por dominio (`sectores`, `tareas`, `trabajadores`, `informes`, `arboles`).
  - `api/**/route.ts`: Endpoints HTTP (Node runtime). Reciben query/body, delegan en servicios y devuelven respuestas tipadas.
  - Manejo de errores por ruta y páginas de error (`error.tsx`, `global-error.tsx`, `not-found.tsx`).
- `components/`
  - `home/`: Mapa interactivo, herramientas y paneles.
  - `sectors/`, `tasks/`, `workers/`, `reports/`, `trees/`: componentes específicos (tablas, modales, mini-mapas, filtros, import UI).
  - `ui/`: Librería de componentes reutilizables (shadcn/ui) adaptados al proyecto.
  - `layout/`: `app-shell`, `navbar`, `theme-provider`.
- `views/`: Páginas a nivel vista que orquestan componentes y servicios por dominio (mantienen UI limpia y lógica separada).
- `src/services/`
  - `sectors.ts`: CRUD + paginación + sincronización de tipo de tareas con el sector. Mapea enums DB⇄UI.
  - `tasks.ts`: CRUD + filtros avanzados (texto, rango fechas, joins lógicos) + historial de tareas + acciones `start/finish` que sincronizan estado del sector.
  - `workers.ts`: CRUD + paginación + filtro por trabajadores con tareas activas (conteo derivado).
  - `trees.ts`: Listado de secciones de calles y árboles individuales, mapeos de estado general y específico.
  - `provider.ts`: Capa de fetch del lado del cliente. Permite alternar entre API real y mocks con `NEXT_PUBLIC_USE_MOCKS`.
- `src/server/db/`
  - `prisma.ts`: Inicialización de `PrismaClient` con `DATABASE_URL` y caching en desarrollo.
- `src/validations/`
  - Esquemas Zod: `sector-schemas.ts`, `task-schemas.ts`, `worker-schemas.ts`, `tree-schemas.ts`, re-exportados desde `index.ts`.
- `src/types/`: Tipos compartidos para UI/servicios (por ejemplo, `SectorPolygon`, `Task`, `Worker`, `StreetWithSections`, `IndividualTree`).
- `src/stores/`: Estado global (Zustand) por dominio (`sectors-store.ts`, `tasks-store.ts`, etc.).
- `src/utils/`: Utilidades (colores, exportaciones, helpers Leaflet, mapeos de estados UI/DB en `status.ts`).
- `src/data/`: Datos de ejemplo usados por el `seed` y el modo mocks.
- `prisma/`: `schema.prisma`, migraciones y `seed.ts` (carga datos de ejemplo con limpieza ordenada).

---

### Descripción técnica de funcionalidades por módulo

#### Sectores
- Modelo: `Sector { id, name, type, status, path(Json), direccion, observaciones, timestamps }`.
- API: `GET /api/sectores` (listado), filtros/paginación vía querystring; `POST/PUT/DELETE` para CRUD.
- Servicios (`sectors.ts`):
  - `listSectors`, `listSectorsPage`: filtros por `name`, `type`, `status`, `direccion`; paginación con `skip/take`.
  - `createSector`: valida input, crea sector y genera automáticamente una tarea asociada (pendiente) con trabajador "Sin asignar".
  - `updateSector`: actualiza sector y sincroniza el tipo en tareas existentes si cambió.
  - `deleteSector`: elimina en cascada tareas del sector.
  - `syncAllTaskTypesWithSectors`: utilidad para normalizar `Task.type` según el `Sector.type` existente.

#### Tareas
- Modelo: `Task { id, sectorId(+Sector), sectorName, type, status, startDate, endDate, assignedWorkerId(+Worker), assignedWorkerName, observations, timestamps }` + `TaskHistory` para auditoría.
- API: `GET /api/tareas` (listado o paginado con filtros texto/estado/tipo/sector/worker/rango de fechas), `POST/PUT` (CRUD), `PATCH` (iniciar/finalizar), `DELETE`.
- Servicios (`tasks.ts`):
  - Filtros avanzados combinando condiciones `AND/OR`.
  - Sincronización de estado con el sector al crear/actualizar/finalizar/iniciar tareas.
  - Historial: `listTaskHistory` y `seedTaskHistoryCycles` para generar ciclos de prueba.
  - Normalización de fechas a strings `YYYY-MM-DD` para la UI.

#### Trabajadores
- Modelo: `Worker { id, name, observaciones, timestamps }`.
- API: `GET /api/workers` (listado o paginado con filtros), `POST/PUT/DELETE`.
- Servicios (`workers.ts`):
  - `listWorkersPage`: filtro por nombre y opción `hasActiveTasks` con conteo derivado para saber si tiene tareas no completadas.
  - Validación con Zod para crear/actualizar. Prohíbe eliminar si tiene tareas asociadas.

#### Arbolado
- Modelos: `StreetSection` (secciones de calles) y `Tree` (árbol individual) con enums de estado.
- API: `GET /api/trees` devuelve secciones y árboles. `POST /api/trees` importa desde Excel o JSON (ver sección de importación). `DELETE` limpia la tabla de `Tree`.
- Servicios (`trees.ts`):
  - Agrupa `StreetSection` por calle para una vista amigable.
  - Mapea estados DB⇄UI (`Necesita_Intervencion` → `Necesita Intervención`; `Recien_Plantado` ↔ `Recién Plantado`).

#### Informes
- API: `GET /api/informes` genera resúmenes y métricas en base a filtros (fechas/estado/tipo/relaciones). UI en `components/reports/*`.

#### Mapa interactivo
- Componentes principales: `components/home/map-interactive.tsx`, `sector-mini-map.tsx`, `sector-leaflet-thumbnail.tsx`.
- Funciones clave: dibujo/edición de polígonos de sectores, selección, zoom, y sincronización con formularios/modales.
- Utilidades Leaflet en `src/utils/leaflet.ts` y helpers de colores en `src/utils/colors.ts`.

#### Validaciones y DTOs
- Zod en `src/validations/**` garantiza coherencia de datos. Los servicios devuelven DTOs tipados que la UI consume directamente.

#### Estado global y UI
- Zustand (`src/stores/**`) mantiene filtros y selección. Componentes UI reutilizables en `components/ui/**` aseguran consistencia visual.


---

## Requisitos
- Node.js 18 o superior (recomendado 20+)
- npm 9+ (o pnpm/yarn si lo preferís)
- Cuenta en Neon (PostgreSQL gestionado) para la base de datos

Opcional:
- Cliente Prisma CLI local. Si al correr comandos de Prisma te falta el CLI:

```bash
npm i -D prisma
```

---

## Instalación rápida
1) Clonar e instalar dependencias:

```bash
git clone <URL_DEL_REPO>
cd frontend
npm install
```

2) Configurar variables de entorno creando un archivo `.env.local` en la raíz del proyecto (ver sección siguiente).

3) Preparar base de datos (generar cliente, aplicar migraciones y sembrar datos de ejemplo):

```bash
npm run prisma:generate
npm run prisma:deploy
npm run prisma:seed
```

4) Levantar el entorno de desarrollo:

```bash
npm run dev
```

Abrí `http://localhost:3000`.

---

## Variables de entorno
Crea un archivo `.env.local` en la raíz y define al menos:

```bash
# Cadena de conexión PostgreSQL de Neon (TLS requerido)
DATABASE_URL="postgres://USUARIO:PASSWORD@ep-xxxxx.neon.tech/neondb?sslmode=require"

# Si usás el pooler de Neon (recomendado en serverless):
# DATABASE_URL="postgres://USUARIO:PASSWORD@ep-xxxxx-pooler.neon.tech/neondb?sslmode=require&pgbouncer=true"

# Modo de datos simulados (solo lectura en UI). Default: false
# NEXT_PUBLIC_USE_MOCKS=true
```

Notas:
- Neon requiere TLS, por eso `sslmode=require`.
- En plataformas serverless usá la URL del pooler y agregá `&pgbouncer=true`.

---

## Base de datos (Neon + Prisma)
El ORM es Prisma y lee la URL desde `DATABASE_URL`.

- Esquema Prisma: `prisma/schema.prisma`
- Cliente Prisma: `src/server/db/prisma.ts`

Comandos principales:

```bash
# Generar cliente a partir del schema
npm run prisma:generate

# Aplicar migraciones pendientes en el entorno actual (producción o CI/CD)
npm run prisma:deploy

# Crear una nueva migración durante el desarrollo (edita el schema primero)
npm run prisma:migrate

# Cargar datos de ejemplo (trabajadores, sectores, tareas, arbolado)
npm run prisma:seed
```

Si te falta el CLI de Prisma en tu entorno local:

```bash
npm i -D prisma
```

---

## Ejecutar
Desarrollo:

```bash
npm run dev
```

Build y producción local:

```bash
npm run build
npm run start
```

Scripts útiles (definidos en `package.json`):

```bash
npm run dev            # Next dev
npm run build          # Next build
npm run start          # Next start
npm run lint           # Lint
npm run prisma:generate
npm run prisma:migrate
npm run prisma:deploy
npm run prisma:seed
```

---

## Estructura del proyecto (resumen)
- `app/` – Rutas y páginas (App Router) y las rutas API (`app/api/**/route.ts`)
- `components/` – Componentes UI (shadcn/ui), mapas, tablas, formularios
- `src/services/` – Capa de servicios (fetch a API interna, validaciones, DTOs)
- `src/server/db/` – Cliente Prisma (`prisma.ts`)
- `src/stores/` – Estado global (Zustand)
- `src/validations/` – Esquemas Zod
- `prisma/` – Esquema, migraciones y seed
- `views/` – Vistas por sección (composición de componentes + servicios)

Páginas principales:
- `/` Inicio (mapa)
- `/sectores`
- `/tareas`
- `/trabajadores`
- `/informes`
- `/arboles`

---

## Flujo y arquitectura
- La UI (React/Next) consume la API interna (`/api/*`).
- Las rutas API usan la capa de servicios (`src/services/**`) y Prisma para acceder a PostgreSQL.
- Prisma lee `DATABASE_URL`. En desarrollo se reutiliza una única instancia del cliente para evitar fugas de conexión por HMR.
- Mapas: Leaflet/React-Leaflet.
- Estado global: Zustand.
- Validaciones: Zod.

---

## Endpoints API (resumen)
Las rutas están implementadas en `app/api/**/route.ts` y usan `runtime = 'nodejs'` (compatible con Prisma).

- `GET /api/health` – Chequeo básico `{ ok: true }`
- `GET|POST|PUT|DELETE /api/workers` – CRUD de trabajadores y paginación
- `GET|POST|PUT|PATCH|DELETE /api/tareas` – CRUD de tareas, historial y acciones (iniciar/finalizar)
- `GET|POST|PUT|DELETE /api/sectores` – CRUD y filtros de sectores
- `GET|POST|DELETE /api/trees` – Listado e importación masiva de árboles (Excel/JSON) y limpieza
- `GET /api/informes` – Generación de informes (filtros por fechas/estado/tipo/relaciones)

Detalles y tipos se encuentran en `src/services/**` y `src/validations/**`.

---

## Importación de árboles desde Excel
Ruta: `POST /api/trees` con `multipart/form-data` y el campo `file` (xlsx/xls). Alternativamente se acepta JSON `{ rows: [...] }` ya normalizado.

Puntos clave:
- Detección de columnas por alias (p. ej. `Especie/species`, `Calle/streetName`, `Altura/streetNumber`).
- Normalización de estado (`Sano`, `Enfermo`, `Necesita_Poda`, `Recien_Plantado`, `Seco`, `Malo`).
- Normalización de vereda (`Norte/Sur/Este/Oeste/Ambas/Ninguna`).
- Deduplicación por clave: `streetName | streetNumber | species | sidewalk`.
- Inserción por lotes (`createMany`) con chunks grandes para performance.
- Opción `replaceAll=1` para reemplazar todo el dataset.

Para datasets muy grandes, preferir el pooler de Neon.

---

## Modo sin base de datos (mocks)
Si querés explorar la UI sin una base de datos, podés activar datos simulados de solo lectura para algunas vistas:

```bash
NEXT_PUBLIC_USE_MOCKS=true
```

Advertencia: operaciones de escritura (crear/editar/eliminar) no están disponibles en modo mocks.

---

## Despliegue
1) Configurar `DATABASE_URL` en el proveedor (p. ej. Vercel). En serverless usá la URL del pooler de Neon y `&pgbouncer=true`.
2) Ejecutar migraciones en el entorno de despliegue:

```bash
npm run prisma:deploy
```

3) Build/start según tu plataforma. Las rutas API ya declaran `runtime = 'nodejs'` para compatibilidad con Prisma.

---

## Solución de problemas
**Error de conexión / TLS**
- Asegurate de tener `sslmode=require` en `DATABASE_URL` (Neon obliga TLS).

**Demasiadas conexiones / timeouts**
- Usá el connection pooling de Neon (`-pooler`) y agregá `&pgbouncer=true` en la URL.

**Falta el CLI de Prisma**
- Instalalo localmente: `npm i -D prisma`.

**Migraciones no aplicadas**
- Corré `npm run prisma:deploy`. En desarrollo, para crear nuevas migraciones: `npm run prisma:migrate` (previo cambio en `schema.prisma`).

**Seed falló**
- Verificá que la base está accesible y que corriste antes `prisma:deploy`. El seed limpia tablas en orden seguro y vuelve a insertar datos de `src/data/**`.

**Rutas API responden 500**
- Revisá `GET /api/health` y `GET /api/workers`. Esta última expone señales útiles (`hasDbUrl`, `isNeon`) en el mensaje de error.

---

## Licencia
Proyecto privado o definir la licencia que corresponda.


