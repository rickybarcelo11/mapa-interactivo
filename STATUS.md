# Estado del Proyecto (bitácora)

Fecha: 2025-08-12

## Resumen de la sesión

- Estado global con Zustand: stores de `sectores`, `tareas`, `trabajadores` y `app` creados y conectados.
- Sistema de notificaciones: hook `useNotifications` con Sonner y reemplazo de todos los `alert()`.
- Validaciones con Zod: esquemas por entidad + helpers + uso en stores y formularios.
- Formularios actualizados: Sectores, Tareas, Trabajadores y Árboles validan con Zod.
- Manejo básico de errores: páginas `app/error.tsx`, `app/global-error.tsx`, `app/not-found.tsx`.
- Tareas (UX): lista expandible con panel de Historial; soporte de URL params `taskId`, `sectorId`, `workerId` y autoexpansión.
- Sectores (UX): modal de edición real (Zod) y eliminación; "Ver historial" redirige a `/tareas?sectorId=...&autoExpand=1`.
- Home (mapa): filtros aplicables desde el panel a los polígonos.
- Limpieza y fixes: problemas de HMR/caché `.next` resueltos; warnings de keys corregidos.
- **PASO 6 COMPLETADO**: Optimización de rendimiento implementada con `useMemo`/`useCallback`/`React.memo` en componentes críticos.
- **LIMPIEZA COMPLETADA**: Estandarización del gestor de paquetes (solo npm, eliminado pnpm-lock.yaml).
- **DISCUSIÓN BACKEND**: Análisis completo de opciones para implementar backend real (pendiente consulta docente).
- **SEGURIDAD API KEY**: Configuración de variables de entorno para proteger Google Maps API key.
- Código subido a main: repo `rickybarcelo11/mapa-interactivo` actualizado.

## 🔐 Configuración de Seguridad - Google Maps API Key

### **⚠️ PROBLEMA IDENTIFICADO:**
- **API key expuesta** en el frontend (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)
- **Sin protección** - cualquier usuario puede ver la key
- **Riesgo de seguridad** - uso no autorizado, cuota agotada

### **✅ SOLUCIÓN IMPLEMENTADA:**
- **Archivo .env.local** para variables locales (NO subir al repo)
- **Archivo .env.example** como plantilla (SÍ subir al repo)
- **.gitignore** ya protege archivos .env*

### **📁 Archivos de Configuración:**

#### **Archivo 1: .env.local (NO subir al repo)**
```env
# Google Maps API Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_api_key_real_aqui

# Otras variables de entorno
NODE_ENV=development
```

#### **Archivo 2: .env.example (SÍ subir al repo)**
```env
# Google Maps API Key
# IMPORTANTE: Copiar este archivo a .env.local y agregar tu API key real
# NUNCA subir .env.local al repositorio
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_api_key_aqui

# Otras variables de entorno (opcionales)
NODE_ENV=development

# Base de datos (para futuro)
# DATABASE_URL="postgresql://usuario:password@localhost:5432/nombre_db"

# Otros servicios (para futuro)
# JWT_SECRET=tu_jwt_secret_aqui
```

### **🚨 IMPORTANTE:**
1. **Crear .env.local** con tu API key real
2. **NUNCA subir .env.local** al repositorio
3. **SÍ subir .env.example** como plantilla
4. **Verificar** que .gitignore protege .env*

### **🔍 Ubicación de la API Key en el Código:**
```typescript
// components/home/google-map.tsx línea 19
googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
```

---

## ⚠️ IMPORTANTE: Consulta Pendiente con Docente

### **Contexto del Proyecto:**
- **Proyecto original**: Iniciado con compañero que iba a hacer backend en C#
- **Situación actual**: Compañero dejó la carrera, trabajo solo en el proyecto
- **Primera entrega**: Ya se presentó query SQL con C# al docente
- **Estado**: Pendiente consulta si se puede cambiar la tecnología del backend

### **¿Por qué necesitamos consultar?**
- Cambio de tecnología (C# → Next.js/Node.js) puede afectar evaluación
- Primera entrega ya comprometió C# como tecnología
- Necesitamos aprobación del docente antes de proceder

---

## 🗄️ ANÁLISIS COMPLETO DE OPCIONES PARA BACKEND

### **Contexto del Proyecto Académico:**
- **Tipo**: Prácticas Profesionalizantes II
- **Equipo**: Un solo desarrollador (tú)
- **Usuarios**: 1 administrador (tú mismo)
- **Concurrencia**: Cero usuarios simultáneos
- **Escala**: Cientos de registros (no miles)
- **Hardware**: PC personal potente (más que convencional)
- **Datos actuales**: Mockeados en archivos estáticos

---

## 🆚 OPCIONES ANALIZADAS PARA BACKEND

### **Opción 1: Next.js + Base de Datos Directa (RECOMENDADA)**

#### ✅ **PROS:**
- **Simplicidad máxima**: Todo en un solo proyecto
- **Desarrollo rápido**: No configurar backend separado
- **Tipos compartidos**: Frontend y backend comparten TypeScript
- **Deploy simple**: Un solo deploy en Vercel
- **Hot reload**: Desarrollo rápido con cambios automáticos
- **Reutilizar Zod**: Las mismas validaciones en frontend y backend
- **Perfecto para académico**: Demuestra habilidades full-stack
- **Hardware suficiente**: Tu PC puede manejar la carga sin problemas
- **Sin concurrencia**: No hay problemas de escalabilidad

#### ❌ **CONTRAS:**
- **Limitado para escalar**: Si en el futuro quisieras miles de usuarios
- **Todo junto**: Frontend y backend en el mismo proceso
- **Testing**: Más difícil separar para tests unitarios
- **Monolítico**: No puedes escalar solo el backend

#### 🎯 **Casos de uso ideales:**
- Proyectos académicos
- MVPs y prototipos
- Sistemas administrativos simples
- Un solo usuario o pocos usuarios

---

### **Opción 2: Backend Separado (Node.js + Express + TypeScript)**

#### ✅ **PROS:**
- **Separación clara**: Frontend y backend independientes
- **Escalabilidad**: Puede crecer significativamente
- **Testing**: Fácil de testear por separado
- **Flexibilidad**: Puedes cambiar solo el backend
- **Arquitectura profesional**: Estructura empresarial

#### ❌ **CONTRAS:**
- **Complejidad**: Proyecto separado, más archivos
- **Configuración**: Setup adicional, deploy separado
- **Overkill**: Demasiado para un proyecto académico
- **Tiempo**: Desarrollo más lento
- **Tipos duplicados**: Posible inconsistencia entre frontend y backend

#### 🎯 **Casos de uso ideales:**
- Proyectos empresariales
- APIs complejas
- Sistemas que necesitan escalar
- Equipos de desarrollo

---

### **Opción 3: C# (.NET) - OPCIÓN ORIGINAL**

#### ✅ **PROS:**
- **Performance**: Excelente rendimiento
- **Herramientas**: Visual Studio, Entity Framework
- **Empresarial**: Estándar en muchas empresas
- **Tipado fuerte**: C# es muy robusto
- **Aprobado**: Ya se presentó al docente

#### ❌ **CONTRAS:**
- **Stack diferente**: No comparte nada con tu frontend actual
- **Curva de aprendizaje**: Si no lo conoces
- **Deploy**: Windows Server o Azure
- **Inconsistencia**: Dos tecnologías completamente diferentes
- **Trabajo extra**: Necesitas aprender/implementar C#

#### 🎯 **Casos de uso ideales:**
- Empresas que usan .NET
- APIs complejas
- Integración con sistemas existentes
- Cuando ya está aprobado por el docente

---

## 🎯 RECOMENDACIÓN TÉCNICA (PENDIENTE APROBACIÓN DOCENTE)

### **Para tu proyecto específico: OPCIÓN 1 (Next.js + BD Directa)**

**¿Por qué es la mejor opción técnicamente?**

1. **Contexto académico**: No necesitas arquitectura empresarial
2. **Un solo usuario**: No hay problemas de concurrencia
3. **Desarrollo rápido**: Enfoque en funcionalidad, no en infraestructura
4. **Hardware suficiente**: Tu PC puede manejar todo
5. **Stack consistente**: Todo en TypeScript/JavaScript
6. **Portfolio**: Demuestra habilidades full-stack completas
7. **Flexibilidad**: Puedes migrar a backend separado después si quieres

### **Tecnologías Recomendadas:**
- **Base de datos**: PostgreSQL + Prisma
- **API**: Next.js API Routes
- **ORM**: Prisma (type-safe, migraciones automáticas)
- **Deploy**: Vercel (gratis para proyectos académicos)

---

## 🚨 ESTADO ACTUAL: PENDIENTE DECISIÓN

### **Acciones requeridas:**
1. **Consultar con docente** si se puede cambiar de C# a Next.js/Node.js
2. **Presentar justificación** del cambio
3. **Mostrar beneficios** de la nueva arquitectura
4. **Obtener aprobación** antes de proceder

### **Si se aprueba el cambio:**
- Implementar Next.js + Base de Datos Directa
- Migrar datos mock a base de datos real
- Implementar Lazy Loading sin problemas

### **Si NO se aprueba el cambio:**
- Mantener C# como backend
- Implementar backend separado en C#
- Integrar con frontend Next.js existente

---

## Limpieza y Estandarización del Proyecto

### ✅ **Gestor de Paquetes Estandarizado:**
- **Problema identificado**: Proyecto tenía tanto `package-lock.json` (npm) como `pnpm-lock.yaml` (pnpm)
- **Causa**: Cambio de gestor de paquetes sin limpiar archivos residuales
- **Solución implementada**: 
  - Eliminado `pnpm-lock.yaml` residual
  - Mantenido solo `package-lock.json` funcional
  - Verificado que todas las dependencias funcionen correctamente
- **Beneficios**: 
  - Sin conflictos entre gestores de paquetes
  - Dependencias consistentes y estables
  - Build exitoso y funcional

### 📦 **Estado Actual de Dependencias:**
- **Gestor**: npm (estándar y compatible)
- **Dependencias**: 290 paquetes instalados correctamente
- **Build**: ✅ Exitoso sin errores
- **Tamaños**: Optimizados y estables

## Optimizaciones de Rendimiento Implementadas (Paso 6)

### ✅ Componentes Optimizados:

#### **SectorsTable** (`components/sectors/sectors-table.tsx`)
- Componente principal envuelto en `React.memo`
- `SectorRow` memoizado individualmente para evitar re-renderizados de filas
- `useCallback` en `toggleRow`, `onEdit`, `onDelete`, `onViewHistory`
- `useMemo` para `memoizedSectors` y cálculos de badges
- Handlers optimizados para evitar recreación de funciones

#### **SectorsFilters** (`components/sectors/sectors-filters.tsx`)
- Componente envuelto en `React.memo`
- `useCallback` en `handleInputChange`, `handleSelectChange`, `clearFilters`
- `useMemo` para `sectorTypes` y `sectorStatuses` estáticos
- Handlers memoizados para evitar re-renderizados en cambios de filtros

#### **TasksExpandableList** (`components/tasks/tasks-expandable-list.tsx`)
- Componente principal envuelto en `React.memo`
- `TaskRow` memoizado individualmente para cada tarea
- `useCallback` en `toggle`, `onEdit`, `onDelete`, `onFinish`
- `useMemo` para `memoizedTasks` y `isCompleted`
- Handlers optimizados para evitar recreación de funciones

#### **MapInteractive** (`components/home/map-interactive.tsx`)
- Componente principal envuelto en `React.memo`
- `DrawingHandler` memoizado para el modo dibujo
- `SectorPolygon` memoizado para cada polígono del mapa
- `useCallback` en `handleMapClick`, `handleFinishDrawing`, `getMarkerIcon`
- `useMemo` para `positions`, `pathOptions`, `centroid`, `drawingPoints`
- Optimización de renderizado de polígonos y marcadores

#### **WorkersTable** (`components/workers/workers-table.tsx`)
- Componente principal envuelto en `React.memo`
- `WorkerRow` memoizado individualmente para cada trabajador
- `useCallback` en `toggleRow`, `onEdit`, `onDelete`
- `useMemo` para `memoizedWorkers` y `memoizedWorkerTasks`
- Handlers optimizados para evitar re-renderizados

#### **WorkersFilters** (`components/workers/workers-filters.tsx`)
- Componente envuelto en `React.memo`
- `useCallback` en `handleNameChange`, `handleActiveTasksChange`, `clearFilters`
- Handlers memoizados para cambios de filtros

#### **TasksFilters** (`components/tasks/tasks-filters.tsx`)
- Componente envuelto en `React.memo`
- `useCallback` en todos los handlers de cambio de filtros
- `useMemo` para `uniqueSectors` y `dateRangeText`
- Optimización de filtros complejos con múltiples criterios

### ✅ Store Optimizado:

#### **SectorsStore** (`src/stores/sectors-store.ts`)
- Cache memoizado para `getFilteredSectors` con clave basada en filtros
- Limpieza automática de cache en operaciones CRUD
- Función helper `generateCacheKey` para generar claves únicas
- Cache se invalida automáticamente al cambiar filtros o datos

### 🎯 Beneficios de Rendimiento:
- **Reducción de re-renderizados**: Componentes memoizados evitan re-renderizados innecesarios
- **Memoización de cálculos**: Filtros y transformaciones costosas se calculan solo cuando cambian las dependencias
- **Handlers optimizados**: Funciones de eventos no se recrean en cada render
- **Componentes hijos memoizados**: Filas de tablas y elementos de listas se renderizan solo cuando cambian sus props
- **Cache inteligente**: Store evita recálculos de filtros con los mismos parámetros

### 📊 Impacto Esperado:
- **Tablas grandes**: Mejora significativa en listas de 50+ elementos
- **Filtros complejos**: Reducción de tiempo de respuesta en filtros múltiples
- **Mapa interactivo**: Mejor rendimiento con muchos polígonos
- **Dispositivos móviles**: Mejor experiencia en hardware limitado

## Pendientes / Próximos pasos

1. ~~Optimización de rendimiento (Paso 6)~~ ✅ **COMPLETADO**
2. ~~Limpieza de gestores de paquetes~~ ✅ **COMPLETADO**
3. ~~Configuración de seguridad API key~~ ✅ **COMPLETADO**
4. **CONSULTA DOCENTE** ⚠️ **PENDIENTE** - Cambio de backend C# a Next.js/Node.js
5. **Implementación de Backend** - Depende de la respuesta del docente
6. Lazy loading y code-splitting
   - Carga diferida de vistas pesadas y componentes secundarios.
7. Tipado estricto
   - Eliminar `any` residuales, reforzar tipos derivados de Zod.
8. Logging y monitoreo básico
   - Hook/util de logging + consola condicionada por env.
9. Testing
   - Unit tests (Zod, hooks) e integración básica (formularios/stores).
10. Autenticación (básico)
    - Estructura de rutas protegidas y stub de sesión.
11. Backend real (Node/Express/PostgreSQL/Prisma) o C# (.NET)
    - Depende de la decisión del docente.
12. CI/CD
    - Lint/Build/Test en PRs; despliegue a Vercel cuando sea necesario.

## Cómo correr localmente

```bash
cd frontend
npm ci
npm run dev
```

**IMPORTANTE**: 
- Usar solo `npm` como gestor de paquetes. El proyecto está estandarizado para npm.
- **Crear archivo .env.local** con tu API key de Google Maps antes de ejecutar.

Reiniciar dev server cuando: se cambien deps, `next.config.mjs`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, páginas de error, o si HMR falla. Tip: borrar `.next/` y `Ctrl+F5` en el navegador.

## Convenciones y notas

- Zod = fuente de verdad de validaciones; derivar tipos con `z.infer` donde sea posible.
- Los componentes no deben llamar a mocks directos: usar stores/servicios.
- Navegación de historial de tareas vía query params (`taskId`, `sectorId`, `workerId`, `autoExpand`).
- **NUEVO**: Usar `useCallback`, `useMemo` y `React.memo` para optimizar componentes que se renderizan frecuentemente.
- **NUEVO**: Memoizar componentes hijos que se renderizan en listas para evitar re-renderizados innecesarios.
- **NUEVO**: Implementar cache en stores para selectores computados costosos.
- **NUEVO**: Usar solo `npm` como gestor de paquetes para evitar conflictos.
- **NUEVO**: Backend pendiente de consulta docente - no implementar hasta obtener aprobación.
- **NUEVO**: API key de Google Maps debe estar en .env.local (NO subir al repo).

## Idea para próxima sesión

- **PRIORIDAD 1**: Consultar con docente sobre cambio de backend C# a Next.js/Node.js
- **PRIORIDAD 2**: Una vez aprobado, implementar Next.js + Base de Datos Directa
- **PRIORIDAD 3**: Migrar datos mock a base de datos real
- **PRIORIDAD 4**: Implementar Lazy Loading sin problemas de datos
- **ALTERNATIVA**: Si no se aprueba el cambio, implementar backend C# separado
