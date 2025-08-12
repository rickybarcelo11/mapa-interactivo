# Estado del Proyecto (bitácora)

Fecha: 2025-08-12

## Resumen de la sesión

- Estado global con Zustand: stores de `sectores`, `tareas`, `trabajadores` y `app` creados y conectados.
- Sistema de notificaciones: hook `useNotifications` con Sonner y reemplazo de todos los `alert()`.
- Validaciones con Zod: esquemas por entidad + helpers + uso en stores y formularios.
- Formularios actualizados: Sectores, Tareas, Trabajadores y Árboles validan con Zod.
- Manejo básico de errores: páginas `app/error.tsx`, `app/global-error.tsx`, `app/not-found.tsx`.
- Tareas (UX): lista expandible con panel de Historial; soporte de URL params `taskId`, `sectorId`, `workerId` y autoexpansión.
- Sectores (UX): modal de edición real (Zod) y eliminación; “Ver historial” redirige a `/tareas?sectorId=...&autoExpand=1`.
- Home (mapa): filtros aplicables desde el panel a los polígonos.
- Limpieza y fixes: problemas de HMR/caché `.next` resueltos; warnings de keys corregidos.
- Código subido a main: repo `rickybarcelo11/mapa-interactivo` actualizado.

## Pendientes / Próximos pasos

1. Optimización de rendimiento (Paso 6)
   - `useMemo`/`useCallback`/`React.memo` en tablas/listas y vistas.
   - Memoizar selectores en stores si aplica.
2. Lazy loading y code-splitting
   - Carga diferida de vistas pesadas y componentes secundarios.
3. Tipado estricto
   - Eliminar `any` residuales, reforzar tipos derivados de Zod.
4. Logging y monitoreo básico
   - Hook/util de logging + consola condicionada por env.
5. Testing
   - Unit tests (Zod, hooks) e integración básica (formularios/stores).
6. Autenticación (básico)
   - Estructura de rutas protegidas y stub de sesión.
7. Backend real (Node/Express/PostgreSQL/Prisma)
   - Servicios en `src/services/*` (ya podemos mockear allí para migrar fácil).
8. CI/CD
   - Lint/Build/Test en PRs; despliegue a Vercel cuando sea necesario.

## Cómo correr localmente

```bash
cd frontend
npm ci
npm run dev
```

Reiniciar dev server cuando: se cambien deps, `next.config.mjs`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, páginas de error, o si HMR falla. Tip: borrar `.next/` y `Ctrl+F5` en el navegador.

## Convenciones y notas

- Zod = fuente de verdad de validaciones; derivar tipos con `z.infer` donde sea posible.
- Los componentes no deben llamar a mocks directos: usar stores/servicios.
- Navegación de historial de tareas vía query params (`taskId`, `sectorId`, `workerId`, `autoExpand`).

## Idea para próxima sesión

- Implementar optimizaciones (Paso 6) y, si hay tiempo, iniciar `src/services/*` para preparar la integración de backend sin tocar la UI.
