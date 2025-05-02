# Plan de Migración Frontend

## Objetivo y Contexto

### Estado Actual
- Frontend construido con React + Ant Design
- Dos vistas principales separadas:
  - OperationSchemaView: Manejo de schemas y operaciones
  - OperationTemplateView: Gestión de templates
- Arquitectura actual:
  - Estado manejado con useState local
  - Componentes con lógica y UI mezclados
  - Dependencia fuerte de Ant Design
  - Sin tipado estricto (JavaScript)

### Stack Tecnológico

#### Tecnologías Actuales
```
Frontend Core:
- React 18
- JavaScript
- Ant Design (componentes UI)
- CSS tradicional

Herramientas:
- Wails (integración con Go)
- npm (gestor de paquetes)
```

#### Nuevas Tecnologías

##### Core
- **TypeScript 5.0+**
  - Tipado estricto habilitado
  - Tipos específicos para el dominio
  - Interfaces para comunicación con backend

- **React 18**
  - Hooks personalizados
  - Componentes funcionales
  - Suspense y lazy loading
  - Server Components (preparación futura)

##### UI y Estilos
- **Tailwind CSS**
  - Utilidades first
  - Sistema de diseño consistente
  - Temas personalizables
  - JIT (Just-In-Time) compiler

- **shadcn/ui**
  - Componentes base reutilizables
  - Personalización con Tailwind
  - Accesibilidad incorporada
  - Radix UI primitives

##### Gestión de Estado
- **Zustand**
  - Stores modulares
  - Middleware para persistencia
  - DevTools integration
  - TypeScript support

##### Utilidades y Herramientas
- **clsx/tailwind-merge**
  - Manejo de clases condicionales
  - Optimización de clases Tailwind

- **lucide-react**
  - Sistema de iconos consistente
  - Soporte para TypeScript
  - Personalizable con Tailwind

- **date-fns**
  - Manipulación de fechas
  - Soporte para internacionalización
  - Bundle size optimizado

##### Desarrollo y Calidad
- **ESLint**
  - Reglas personalizadas para TypeScript
  - Plugins para React Hooks
  - Integración con Prettier

- **Prettier**
  - Formateo consistente
  - Integración con Tailwind
  - Configuración compartida


### Estructura de Carpetas

#### Estructura Actual
```
frontend/
├── dist/
├── src/
│   ├── app/
│   ├── assets/
│   │   ├── fonts/
│   │   └── images/
│   ├── components/
│   │   ├── common/
│   │   │   ├── CustomSidebar/
│   │   │   ├── EditableTable/
│   │   │   ├── JsonViewer/
│   │   │   └── Loading/
│   │   ├── controls/
│   │   │   ├── CurlModal/
│   │   │   ├── RequestForm/
│   │   │   └── TemplateForm/
│   │   └── layout/
│   ├── constants/
│   ├── context/
│   ├── hooks/
│   ├── lib/
│   ├── routes/
│   ├── styles/
│   ├── utils/
│   └── views/
│       ├── OperationSchemaView/
│       └── OperationTemplateView/
│       └── SchemaTemplateView/
│           └── components/
│               └── operation-editor/
│               ├── operations-list/
│               ├── response-viewer/
│               ├── sidebar/
│               ├── template-editor/
│               ├── template-params-panel/
└── wailsjs/
```

#### Estructura Objetivo
```
frontend/
├── dist/
├── src/
│   ├── app/
│   ├── assets/
│   │   ├── fonts/
│   │   └── images/
│   ├── components/
│   │   ├── ui/                    # Componentes shadcn/ui personalizados
│   │   │   ├── button/
│   │   │   ├── input/
│   │   │   └── modal/
│   │   ├── common/               # Componentes compartidos
│   │   │   ├── Sidebar/
│   │   │   ├── JsonViewer/
│   │   │   └── Loading/
│   │   └── features/            # Componentes específicos de feature
│   │       ├── schema/
│   │       │   ├── SchemaEditor/
│   │       │   └── SchemaList/
│   │       └── template/
│   │           ├── TemplateEditor/
│   │           └── TemplateList/
│   ├── hooks/
│   │   ├── common/              # Hooks genéricos
│   │   └── features/            # Hooks específicos de feature
│   ├── stores/                  # Stores de Zustand
│   │   ├── schema/
│   │   │   ├── types.ts
│   │   │   └── store.ts
│   │   └── template/
│   │       ├── types.ts
│   │       └── store.ts
│   ├── lib/                     # Utilidades y configuraciones
│   │   ├── api/
│   │   ├── utils/
│   │   └── constants/
│   ├── types/                   # Tipos globales
│   │   ├── schema.ts
│   │   └── template.ts
│   └── views/
│       └── SchemaTemplateView/  # Vista unificada
│           ├── components/      # Componentes específicos de la vista
│           │   ├── operations-list/
│           │   ├── operation-editor/
│           │   ├── response-viewer/
│           │   ├── template-editor/
│           │   └── template-params-panel/
│           └── index.tsx
└── wailsjs/
```

### Cambios Principales en la Estructura
1. **Organización por Features**:
   - Componentes agrupados por funcionalidad
   - Separación clara entre UI común y específica

2. **Gestión de Estado**:
   - Nuevo directorio `stores/` para Zustand
   - Separación de tipos y lógica

3. **Mejora en Componentes**:
   - Separación de UI base (shadcn) y componentes de negocio
   - Mejor organización de componentes compartidos

4. **Types**:
   - Directorio dedicado para tipos TypeScript
   - Mejor organización de interfaces y tipos

5. **Vistas**:
   - Unificación en SchemaTemplateView
   - Componentes específicos de vista separados

### Objetivo
Modernizar y unificar el frontend para crear una experiencia más robusta y mantenible:
- Unificar las vistas de Schema y Template en una sola interfaz cohesiva: SchemaTemplateView
- Mejorar la experiencia de usuario con un diseño más moderno
- Facilitar el mantenimiento y la escalabilidad del código
- Reducir la complejidad técnica

### ¿Por qué?
1. **Técnico**:
   - Mejor mantenibilidad con TypeScript
   - Separación clara entre lógica y UI
   - Gestión de estado más predecible con Zustand
   - Reducción de dependencias externas

2. **UX/UI**:
   - Interfaz más moderna y consistente con shadcn/ui
   - Mejor feedback visual y experiencia de usuario
   - Diseño más intuitivo y eficiente
   - Mayor accesibilidad

3. **Negocio**:
   - Reducción en tiempo de desarrollo futuro
   - Menor curva de aprendizaje para nuevos desarrolladores
   - Mayor facilidad para implementar nuevas funcionalidades
   - Mejor rendimiento general de la aplicación

### ¿Cómo?
1. **Enfoque Gradual**:
   - Migración componente por componente
   - Testing continuo para evitar regresiones
   - Despliegue progresivo de nuevas funcionalidades

2. **Metodología**:
   - Desarrollo basado en componentes

3. **Fases**:
   - Configuración inicial y setup
   - Migración de componentes core
   - Implementación de nueva arquitectura de estado
   - Refinamiento de UI/UX
   - Testing y optimización

## 0. Reglas y Principios

### 0.1 Reglas de Desarrollo
- Usar TypeScript estricto (strict mode) en todos los nuevos archivos
- Seguir principios SOLID en la organización del código
- Implementar manejo de errores consistente
- Documentar todas las interfaces y tipos públicos
- Mantener componentes pequeños y con responsabilidad única

### 0.2 Reglas de UI/UX
- Mantener consistencia con el diseño de shadcn/ui
- Implementar feedback visual para todas las acciones
- Asegurar accesibilidad (ARIA labels, roles, etc)
- Mantener responsive design en todos los componentes
- Implementar transiciones y animaciones suaves

### 0.3 Reglas de Estado
- Mantener estado global solo para datos compartidos
- Usar estado local para UI temporal
- Implementar persistencia donde sea necesario
- Mantener sincronización entre stores relacionados

## 1. Configuración de Estado Global con Zustand

### 1.1 Estructura Base
- [X] Crear directorio `stores/`
- [X] Configurar TypeScript para stores
- [X] Implementar tipos base compartidos
- [X] Configurar middleware de desarrollo

### 1.2 [X] Schema Store
```typescript
interface SchemaStore {
  // Estado
  schemas: Schema[]
  selectedSchema: Schema | null
  loading: boolean
  error: Error | null
  
  // Acciones básicas
  fetchSchemas: () => Promise<void>
  selectSchema: (id: string) => void
  clearSelection: () => void
  
  // Operaciones CRUD
  createSchema: (schema: SchemaCreate) => Promise<void>
  updateSchema: (id: string, schema: SchemaUpdate) => Promise<void>
  deleteSchema: (id: string) => Promise<void>
  
  // Operaciones especiales
  testOperation: (data: OperationData) => Promise<void>
  transformJsonSchema: (json: any) => any
  importFromCurl: (curl: string) => Promise<void>
}
```

### 1.3 [X] Template Store
```typescript
interface TemplateStore {
  // Estado
  templates: Template[]
  selectedTemplate: Template | null
  loading: boolean
  error: Error | null
  
  // Acciones básicas
  fetchTemplates: (schemaId: string) => Promise<void>
  selectTemplate: (id: string) => void
  clearSelection: () => void
  
  // Operaciones CRUD
  createTemplate: (template: TemplateCreate) => Promise<void>
  updateTemplate: (id: string, template: TemplateUpdate) => Promise<void>
  deleteTemplate: (id: string) => Promise<void>
  
  // Operaciones especiales
  syncWithSchema: (schemaId: string) => Promise<void>
  validateParameters: (params: Parameter[]) => boolean
}
```

## 2. Migración de Componentes

### 2.1 Componentes Base
- [ ] Crear estructura de carpetas para nuevos componentes
- [ ] Configurar tipos compartidos
- [ ] Implementar HOCs necesarios
- [ ] Crear hooks compartidos

### 2.2 OperationEditor
- [ ] Migrar validaciones de formulario
- [ ] Implementar integración con schemaStore
- [ ] Migrar lógica de test request
- [ ] Implementar manejo de errores
- [ ] Agregar feedback visual
- [ ] Implementar auto-guardado (opcional)

### 2.3 TemplateEditor
- [ ] Migrar sistema de parámetros
- [ ] Implementar integración con templateStore
- [ ] Migrar sincronización con schema
- [ ] Implementar validaciones
- [ ] Agregar preview de template
- [ ] Implementar historial de cambios (opcional)

### 2.4 ResponseViewer
- [ ] Migrar visualización de JSON
- [ ] Implementar transformación de datos
- [ ] Agregar opciones de formato
- [ ] Implementar búsqueda en JSON
- [ ] Agregar exportación de resultados

## 3. Implementación de Funcionalidades

### 3.1 Schemas
- [ ] Implementar listado y búsqueda
  - [ ] Filtrado
  - [ ] Ordenamiento
  - [ ] Paginación
- [ ] Implementar CRUD
  - [ ] Crear nuevo schema
  - [ ] Editar schema existente
  - [ ] Eliminar schema
  - [ ] Duplicar schema
- [ ] Implementar testing
  - [ ] Test request
  - [ ] Validación de respuesta
  - [ ] Manejo de timeouts
- [ ] Implementar importación
  - [ ] Desde CURL
  - [ ] Desde archivo
  - [ ] Desde clipboard

### 3.2 Templates
- [ ] Implementar gestión de templates
  - [ ] Listado por schema
  - [ ] Búsqueda y filtrado
  - [ ] Ordenamiento
- [ ] Implementar CRUD
  - [ ] Crear template
  - [ ] Editar template
  - [ ] Eliminar template
  - [ ] Duplicar template
- [ ] Implementar parámetros
  - [ ] Validación
  - [ ] Tipos dinámicos
  - [ ] Valores por defecto
- [ ] Implementar sincronización
  - [ ] Con schema padre
  - [ ] Entre templates
  - [ ] Historial de cambios

### 3.3 Funcionalidades Compartidas
- [ ] Sistema de notificaciones
  - [ ] Errores
  - [ ] Éxitos
  - [ ] Advertencias
  - [ ] Progreso
- [ ] Loading states
  - [ ] Skeletons
  - [ ] Spinners
  - [ ] Progress bars
- [ ] Modales y diálogos
  - [ ] Confirmaciones
  - [ ] Forms modales
  - [ ] Previews

## 4. Testing y Optimización

### 4.1 Optimización
- [ ] Performance
  - [ ] Lazy loading
  - [ ] Code splitting
  - [ ] Bundle size
- [ ] Renders
  - [ ] Memoización
  - [ ] Virtualización
  - [ ] Debouncing
- [ ] Network
  - [ ] Caching
  - [ ] Optimistic updates
  - [ ] Request batching

## 5. Limpieza y Documentación

### 5.1 Limpieza
- [ ] Código legacy
  - [ ] Remover componentes antiguos
  - [ ] Limpiar imports no usados
  - [ ] Actualizar dependencias
- [ ] Tipos
  - [ ] Remover tipos duplicados
  - [ ] Consolidar interfaces
  - [ ] Actualizar tipos obsoletos
- [ ] Estilos
  - [ ] Remover CSS no usado
  - [ ] Consolidar utilidades
  - [ ] Actualizar temas

## Criterios de Aceptación

### Funcionales
- [ ] Todas las funcionalidades existentes migradas
- [ ] Sin regresiones en funcionalidad
- [ ] Mejoras de UX implementadas

### Técnicos
- [ ] TypeScript sin errores
- [ ] Sin warnings de ESLint
- [ ] Performance igual o mejor que antes

### UI/UX
- [ ] Diseño consistente
- [ ] Responsive en todos los breakpoints
- [ ] Accesibilidad validada
- [ ] Feedback visual apropiado

