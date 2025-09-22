# Estado del Proyecto (bitácora)

Fecha: 2025-09-02

## Resumen de la sesión

- Estado global con Zustand: stores de `sectores`, `tareas`, `trabajadores` y `app` creados y conectados.
- Sistema de notificaciones: hook `useNotifications` con Sonner y reemplazo de todos los `alert()`.
- Validaciones con Zod: esquemas por entidad + helpers + uso en stores y formularios.
- Formularios actualizados: Sectores, Tareas, Trabajadores y Árboles validan con Zod.
- Manejo básico de errores: páginas `app/error.tsx`, `app/global-error.tsx`, `app/not-found.tsx`.
- Tareas (UX): lista expandible con panel de Historial; soporte de URL params `taskId`, `sectorId`, `workerId` y autoexpansión.
- Sectores (UX): modal de edición real (Zod) y eliminación; "Ver historial" redirige a `/tareas?sectorId=...&autoExpand=1`.
- Home (mapa): filtros aplicables desde el panel a los polígonos.
- Home (mapa): nombres de sectores como tooltip en hover (no permanentes) para evitar superposición al alejar.
- Sectores: miniatura de mapa real (Leaflet) cuadrada con auto-zoom al polígono.
- Persistencia real: tarea 1:1 creada automáticamente al crear sector (pendiente, "Sin asignar"). Botones Iniciar/Finalizar tarea con PATCH.
- Eliminación de sector: confirmación en UI y borrado en cascada de tareas asociadas.
- Fixes: loops de carga, z-index sobre modales, zoom dinámico y limpieza de duplicados.
- Limpieza y fixes: problemas de HMR/caché `.next` resueltos; warnings de keys corregidos.
- **PASO 6 COMPLETADO**: Optimización de rendimiento implementada con `useMemo`/`useCallback`/`React.memo` en componentes críticos.
- **PAGINACIÓN**: API con `page`/`pageSize` y filtros en `sectores`, `tareas` y `workers`; UI con selector 10/20/25.
- **TAREAS (UX)**: Modal "Nueva tarea"; regla 1 sector = 1 tarea activa (reinicio si existe).
- **HISTORIAL**: Prisma `TaskHistory` + endpoint `GET /api/tareas?historyTaskId=<id>` y panel de historial real.
- **SYNC SECTOR**: Estado del `Sector` se sincroniza al iniciar/finalizar/actualizar tarea.
- **UI OPTIMISTA**: Tareas reflejan cambios al instante (iniciar/finalizar/editar); sectores refrescan en segundo plano.
- **HOME**: Reactividad mejorada (suscrito directamente a `sectors` del store).
- **LIMPIEZA COMPLETADA**: Estandarización del gestor de paquetes (solo npm, eliminado pnpm-lock.yaml).
- **BACKEND ACTIVO**: Conectado a base en la nube (Neon) con Prisma y API Next.js operativa.
- **MAPAS**: Leaflet + OpenStreetMap activo (sin necesidad de API key de Google).
- Código subido a main: repo `rickybarcelo11/mapa-interactivo` actualizado.

## Ruta de integración: Neon (PostgreSQL) + Prisma

Pasos seguros (no rompen el frontend; los mocks siguen activos hasta el final):

1. Crear base de datos en Neon y copiar `DATABASE_URL`.
2. Variables de entorno
   - En `frontend/.env.local`:
     ```
     DATABASE_URL="postgresql://..."
     NEXT_PUBLIC_USE_MOCKS=true
     ```
3. Instalar y preparar Prisma
   ```bash
   cd frontend
   npm i @prisma/client
   npm i -D prisma
   npx prisma init --datasource-provider postgresql
   ```
4. Modelado inicial en `prisma/schema.prisma` (entidades: `Sector`, `Trabajador`, `Tarea`, `Arbol`).
5. Migrar y generar
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```
6. Cliente Prisma singleton en `src/server/db/prisma.ts`.
7. Seed opcional coherente con la UI en `prisma/seed.ts` y script `npm run prisma:seed`.
8. Capa de servicios en `src/services/*` (CRUD por entidad, validación con Zod en I/O).
9. Endpoints API en `app/api/*/route.ts` con Zod y `export const runtime = 'nodejs'`.
10. Provider de datos
    - Si `NEXT_PUBLIC_USE_MOCKS=true` → usar mocks actuales (UI intacta).
    - Si `false` → usar servicios/API (sin cambiar stores ni componentes).
11. QA
    - Probar con el flag en `false`; rollback inmediato volviendo a `true` si algo falla.
12. Deploy
    - Configurar envs en Vercel (incl. `DATABASE_URL`).
    - Migraciones:
      ```bash
      npx prisma migrate deploy
      ```
    - Neon ya provee pooling para conexiones en serverless.

## Bitácora Backend implementado (Neon + Prisma + API + Provider)

- Base de datos: creada en Neon. Migración inicial aplicada y seed ejecutado.
- Prisma: esquema con `Sector`, `Worker`, `Task` (+ enums `Status` y `SectorType`). Cliente singleton en `src/server/db/prisma.ts`.
- Servicios: `src/services/{workers,sectors,tasks}.ts` con mapping de enums ("en_proceso" ⇄ "en proceso") y fechas a `YYYY-MM-DD`.
- API Next.js: `app/api/{workers,sectores,tareas}/route.ts` con `GET` y CRUD (`POST/PUT/DELETE`, `PATCH` para finalizar tarea). `runtime = 'nodejs'`.
- Provider conmutable: `src/services/provider.ts` lee mocks si `NEXT_PUBLIC_USE_MOCKS=true` y API si `false`.
- Stores actualizados: `initialize*` de `workers`, `sectors`, `tasks` ahora usan el provider (UI intacta por flag).
- Endpoint salud: `app/api/health`.
- Variables de entorno: `DATABASE_URL` usando pooler Neon y `sslmode=require` (sin `channel_binding`).

### Arbolado en DB (nuevo)
- Esquema añadido: `Tree`, `StreetSection` y enums `SidewalkSide`, `GeneralStatus`, `TreeStatus` en `prisma/schema.prisma`.
- Migración aplicada: `trees`.
- Seed actualizado: inserta `streetsData` e `individualTreesData` desde `src/data/trees.data.ts` en `StreetSection` y `Tree`.
- API: `GET /api/trees` entrega `{ streets, trees }` (lectura server) y `views/trees-view.tsx` consume la API.

### Conmutación a API (sin mocks)
### Historial de tareas (nuevo)
- Prisma: `TaskHistory` + enum `TaskEventType`.
- Servicios: registran eventos en `create`, `start`, `finish`, `update` (y reinicio).
- API: `GET /api/tareas?historyTaskId=<taskId>` devuelve auditoría ordenada.
- UI: `TaskHistoryPanel` consume la API real.

- Flag en `frontend/.env.local`: `NEXT_PUBLIC_USE_MOCKS=false`.
- Vistas conectadas a API: `tareas`, `sectores`, `trabajadores`, `árboles`, `informes`.

### Enlaces rápidos
- Neon Console (proyecto): `https://console.neon.tech/app/projects/divine-dawn-86534582?branchId=br-frosty-term-acwivhc6`
- Neon Database Studio (branch actual): abrir "Database studio" desde el proyecto en Neon.
- Salud API local: `http://localhost:3000/api/health`
- Endpoints: `http://localhost:3000/api/workers`, `http://localhost:3000/api/sectores`, `http://localhost:3000/api/tareas`, `http://localhost:3000/api/trees`
- Historial de una tarea: `http://localhost:3000/api/tareas?historyTaskId=<id>`

### Comandos útiles
```bash
# Migraciones remotas (usa DATABASE_URL de Neon)
npx prisma migrate deploy

# Migración de desarrollo (genera + aplica)
npx prisma migrate dev --name <nombre>

# Regenerar cliente
npx prisma generate

# Seed (puebla Worker/Sector/Task/Tree/StreetSection)
npm run prisma:seed

# Reset (si hay drift en desarrollo)
npx prisma migrate reset --force
```


## Pendientes / Próximos pasos

1. ~~Optimización de rendimiento (Paso 6)~~ ✅ **COMPLETADO**
2. ~~Limpieza de gestores de paquetes~~ ✅ **COMPLETADO**
3. ~~Configuración de seguridad API key~~ ✅ **COMPLETADO**
4. Integración fina con backend
   - Estados de loading/error; reintentos; mover paginación UI local de `tareas`/`workers` a server si aplica.
5. (Descartado) Autenticación y protección de rutas
   - Proyecto con un único administrador. No se implementará autenticación.
6. Bugs visuales y pulido de UI
   - Re-render inmediato en vistas; consistencia de colores/estados; pequeños glitches.
7. Importación de datos (Excel/CSV)
   - Definir plantillas; validaciones; mapeo de campos; previsualización y rollback.
8. Tipado estricto
   - Eliminar `any` residuales; tipos derivados de Zod en servicios y stores.
9. Lazy loading y code-splitting
   - Carga diferida de vistas pesadas y componentes secundarios.
10. Logging y monitoreo
   - Trazas controladas por env; evaluar Sentry/LogRocket.
11. Testing
   - Unit (Zod, hooks, servicios) e integración básica (formularios/stores/API).
12. CI/CD
    - Lint/Build/Test en PRs y migraciones `prisma migrate deploy` en deploy.

## Cómo correr localmente

```bash
cd frontend
npm ci
npm run dev
```

**IMPORTANTE**: 
- Usar solo `npm` como gestor de paquetes. El proyecto está estandarizado para npm.
- La API key de Google Maps ya no es necesaria (mapa con OpenStreetMap).

Reiniciar dev server cuando: se cambien deps, `next.config.mjs`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, páginas de error, o si HMR falla. Tip: borrar `.next/` y `Ctrl+F5` en el navegador.

## Convenciones y notas

- Zod = fuente de verdad de validaciones; derivar tipos con `z.infer` donde sea posible.
- Los componentes no deben llamar a mocks directos: usar stores/servicios.
- Navegación de historial de tareas vía query params (`taskId`, `sectorId`, `workerId`, `autoExpand`).
- **NUEVO**: Usar `useCallback`, `useMemo` y `React.memo` para optimizar componentes que se renderizan frecuentemente.
- **NUEVO**: Memoizar componentes hijos que se renderizan en listas para evitar re-renderizados innecesarios.
- **NUEVO**: Implementar cache en stores para selectores computados costosos.
- **NUEVO**: Usar solo `npm` como gestor de paquetes para evitar conflictos.
- **NUEVO**: Backend activo - usar servicios/API; mocks solo para pruebas aisladas.
- **NUEVO**: API key de Google Maps ya no se usa (OpenStreetMap).

## Idea para próxima sesión

- **PRIORIDAD 1**: Bugs visuales y reactividad en tiempo real en todas las vistas
- **PRIORIDAD 2**: Importación Excel/CSV (plantillas + validación + preview + commit)
- **PRIORIDAD 3**: Estados de error/loading consistentes y reintentos
- **PRIORIDAD 4**: Tipado estricto (eliminar `any`, tipos derivados de Zod)
- **PRIORIDAD 5**: Configurar pipeline CI (lint/build/test) y migraciones
