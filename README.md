## 🌳 Mapa Interactivo — Planificación y Arbolado

![Next.js](https://img.shields.io/badge/Next.js-000?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232a?logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?logo=postgresql&logoColor=white)
![Neon](https://img.shields.io/badge/Neon-1b1f24?logo=neon&logoColor=00e599)
![Leaflet](https://img.shields.io/badge/Leaflet-199900?logo=leaflet&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-38B2AC?logo=tailwindcss&logoColor=white)

> Aplicación web para planificar, ejecutar y seguir tareas de corte de pasto y poda, con mapa interactivo, registro de sectores, tareas, trabajadores e inventario de árboles.

Stack: Next.js (React) + API interna + Prisma + PostgreSQL (Neon) + Leaflet.

---

¿Qué hace?
-Mapa interactivo con sectores coloreados por estado: pendiente, en proceso, completado.

-Gestión de sectores (dibujo/edición de polígonos, datos y observaciones).

-Gestión de tareas (alta, consulta, iniciar, finalizar, reasignar, historial).

-Trabajadores (altas, bajas, modificaciones y tareas asignadas).

-Árboles (inventario por calle y número; especie, estado y fechas).

-Historial de tareas para auditoría.

-Informes (tablas y resúmenes por período, sector, estado, responsable).

-Se apoya en mapas abiertos (Leaflet + tiles), sin necesidad de Google Maps.

## 🧱 Arquitectura 

-Frontend: Next.js + React (App Router), Tailwind, componentes UI.
-API interna: rutas /api/* dentro de Next.js (handlers GET/POST/PUT/DELETE).
-Persistencia: Prisma ORM → PostgreSQL (proyecto listo para Neon).
-Mapa: Leaflet; proveedor de teselas configurable (OpenStreetMap u otro).

Usuario ↔ Aplicación Web (Next.js)
Aplicación Web ↔ API interna (/api/*)
API ↔ Prisma ↔ PostgreSQL (Neon)
Aplicación Web ↔ Leaflet (tiles)

## 🔧 Requisitos

-Node.js 18+ (recomendado 20 LTS).
-npm 9+ (o pnpm/yarn si preferís).
-Base de datos PostgreSQL accesible (ej.: Neon).
-Acceso a internet para cargar teselas del mapa.

## 🔑 Variables de entorno
-Crear un archivo .env en la raíz del proyecto:
```bash
# PostgreSQL (Neon). Asegurate de incluir sslmode=require
DATABASE_URL="postgresql://USUARIO:CONTRASEÑA@HOST_NEON/BD?sslmode=require"

# Proveedor de teselas del mapa (puede cambiarse por otro servicio compatible XYZ)
NEXT_PUBLIC_TILE_URL="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
NEXT_PUBLIC_TILE_ATTRIBUTION="© OpenStreetMap contributors"

# Puerto opcional para la app (por defecto 3000)
PORT=3000
```
En Neon (Dashboard → Project → Connection details): copiá la cadena de PostgreSQL (direct) y agregá ?sslmode=require si no está presente.

## 🚀 Puesta en marcha

Instalar dependencias
npm install

Generar cliente de Prisma
npx prisma generate

Crear/actualizar la base
Si ya tenés migraciones en el repo:
npx prisma migrate deploy

En desarrollo (sin migraciones previas):
npx prisma db push

(Opcional) Revisar datos con Prisma Studio
npx prisma studio

Correr en desarrollo
npm run dev
# abre http://localhost:3000

Build y ejecución en producción
npm run build
npm start


## 📁 Estructura de carpetas 
app/
  (páginas y rutas API /api/*)
components/
  (UI: formularios, paneles, mapa)
views/
  (vistas de alto nivel por módulo)
src/
  services/        (servicios y acceso Prisma)
  validations/     (esquemas Zod, validaciones)
  stores/          (estado de UI - Zustand)
  utils/           (helpers, mapeos de enums, etc.)
prisma/
  schema.prisma    (modelo de datos)
  migrations/      (migraciones SQL de Prisma)
public/
  (estáticos)


## 🧩 Endpoints (guía rápida)
-Sectores: /api/sectores — GET (lista + filtros), POST (crear), PUT (editar), DELETE (borrar).

-Tareas: /api/tareas — GET/POST/PUT (consultar, crear, modificar, iniciar/finalizar según body).

-Trabajadores: /api/workers — GET/POST/PUT/DELETE.

-Árboles: /api/trees — GET/POST/PUT/DELETE.

-Historial: usualmente como parte de /api/tareas (evento por cambio).

-Salud: /api/health (si está presente).

-Algunos utilitarios pueden existir, p. ej.: /api/trees/preview, /api/trees/dedupe (según repo)


## 🗃️ Modelo de datos 
-Sector: id, name, type, status, path(JSON), direccion?, observaciones?, createdAt, updatedAt
-Task: id, sectorId(FK), sectorName, type, status, startDate, endDate?, assignedWorkerId?, assignedWorkerName?, observations?, createdAt, updatedAt
-TaskHistory: id, taskId(FK), eventType, timestamp, note?
-Worker: id, name, observaciones?, createdAt, updatedAt
-Tree: id, species, status, streetName, streetNumber, sidewalk?, location(JSON)?, plantingDate?,lastPruningDate?, observations?, createdAt, updatedAt

## 🗺️ Mapa (Leaflet)
-Usa NEXT_PUBLIC_TILE_URL para el proveedor (por defecto, OpenStreetMap).
-Sectores se dibujan como polígonos desde Sector.path (lista ordenada de {lat, lng}).
-Colores de sector según status: pendiente / en proceso / completado.

## 👤 Roles
-Administrador (actual): acceso completo a sectores, tareas, trabajadores, árboles e informes.
-No hay autenticación en esta versión (puede añadirse a futuro).

## 🔄 Flujo típico de uso
-Crear sectores (dibujar polígono y completar datos).
-Crear tareas para un sector (tipo, fecha, observaciones, responsable opcional).
-Iniciar y finalizar tareas (cambian estado y fechas).
-Ver historial y generar informes por período/sector/estado/responsable.
-Administrar trabajadores y árboles desde sus pantallas.


## 🩺 Consejos y problemas comunes
-Error SSL con Neon: asegurate de ?sslmode=require en DATABASE_URL.
-Migración no aplicada: corré npx prisma migrate deploy (prod) o npx prisma db push (dev).
-Mapa sin teselas: revisá NEXT_PUBLIC_TILE_URL y conexión a internet.
-Datos no visibles en UI: verificá filtros activos y la consola del navegador.

## 📜 Licencia / uso

Proyecto académico. Podés usar, adaptar y mejorar el código para fines educativos.
Si publicás, mencioná el uso de Leaflet y OpenStreetMap (u otro proveedor de tiles).

## 🤝 Contribuciones
-Issues y PRs con descripciones claras son bienvenidos.
-Mantener estilo y convenciones del proyecto (TypeScript, validaciones, paginación).

## 📫 Contacto
-Para dudas sobre instalación o uso, consultá este README o el manual de usuario.
-Si algo no funciona como esperabas, abrí un issue con: pasos para reproducir, logs y captura.


Neon (PostgreSQL en la nube)
-----------------------------

Qué es Neon
- Servicio de PostgreSQL administrado, con almacenamiento separado del cómputo, auto-sleep y escalado rápido.
- Ideal para Next.js y entornos serverless.

Crear proyecto y obtener conexiones
1. Entrá a `https://neon.tech` y creá un proyecto.
2. En el Dashboard → Project → Connection Details, copiá:
   - Connection string "Direct" (host `ep-xxxx.neon.tech`).
   - Connection string "Pooler" (host `ep-xxxx-pooler.neon.tech`).
3. Agregá `?sslmode=require` al final si no aparece.

Configurar variables
- En `.env` (o variables del proveedor en despliegue):

```bash
# Conexión directa (útil en desarrollo)
DATABASE_URL="postgresql://USUARIO:CONTRASEÑA@ep-xxxx.neon.tech/neondb?sslmode=require"

# Pooler (recomendado para producción/serverless)
# Usa PgBouncer y ajusta cómo Prisma maneja las conexiones
DATABASE_URL="postgresql://USUARIO:CONTRASEÑA@ep-xxxx-pooler.neon.tech/neondb?sslmode=require&pgbouncer=true"
```

Migraciones y seed (operan contra Neon)
```bash
# Generar cliente Prisma
npx prisma generate

# Aplicar migraciones existentes (producción/CI)
npx prisma migrate deploy

# En desarrollo, si no hay migraciones previas
npx prisma db push

# Cargar datos de ejemplo (si el repo lo incluye)
npx prisma db seed   # o: npm run prisma:seed
```

Uso en desarrollo
- Levantar la app: `npm run dev`.
- La API interna (`/api/*`) corre en Node.js y se conecta a Neon vía Prisma.
- Opcional: activar logs de Prisma para diagnóstico temporal: `DEBUG=prisma:* npm run dev`.

Buenas prácticas
- Producción/serverless: usar SIEMPRE el Pooler (`-pooler`) + `&pgbouncer=true`.
- No exponer `DATABASE_URL` al cliente. Mantenelo en `.env` o en variables del servidor.
- TLS obligatorio en Neon (`sslmode=require`).
- Para importaciones masivas (Excel), usar inserciones por lotes (ya implementado) y el Pooler.

Diagnóstico y problemas comunes
- "SSL error" → falta `sslmode=require` en la URL.
- "Too many connections" → usar Pooler, revisar límites y cerrar conexiones o reusar cliente Prisma.
- "Migraciones no aplicadas" → `npx prisma migrate deploy` (prod) o `npx prisma db push` (dev).
- Ver SQL/logs → `DEBUG=prisma:*` o habilitar `log: ['query','info','warn','error']` en la creación del PrismaClient (solo temporalmente).

