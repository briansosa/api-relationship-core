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
- [X] Crear estructura de carpetas para nuevos componentes
- [X] Configurar tipos compartidos
- [X] Implementar HOCs necesarios
- [X] Crear hooks compartidos

### 2.2 OperationEditor
1- [X] Migrar validaciones de formulario
2- [X] Implementar integración con schemaStore
3- [ ] Migrar lógica de test request
4- [ ] Implementar manejo de errores
5- [ ] Agregar feedback visual

### 2.3 TemplateEditor
1- [ ] Implementar integración con templateStore
2- [ ] Migrar sincronización con schema
3- [ ] Implementar validaciones
4- [ ] Agregar preview de template
5- [ ] Implementar historial de cambios (opcional)

### 2.4 ResponseViewer
1- [ ] Migrar visualización de JSON
2- [ ] Implementar transformación de datos
3- [ ] Agregar opciones de formato
4- [ ] Implementar búsqueda en JSON
5- [ ] Agregar exportación de resultados

## 3. Implementación de Funcionalidades

### 3.1 Schemas
1- [ ] Implementar listado y búsqueda
  1- [ ] Filtrado
  2- [ ] Ordenamiento
  3- [ ] Paginación
2- [ ] Implementar CRUD
  1- [ ] Crear nuevo schema
  2- [ ] Editar schema existente
  3- [ ] Eliminar schema
  4- [ ] Duplicar schema
3- [ ] Implementar testing
  1- [ ] Test request
  2- [ ] Validación de respuesta
  3- [ ] Manejo de timeouts
4- [ ] Implementar importación
  1- [ ] Desde CURL
  2- [ ] Desde archivo
  3- [ ] Desde clipboard

### 3.2 Templates
1- [ ] Implementar gestión de templates
  1- [ ] Listado por schema
  2- [ ] Búsqueda y filtrado
  3- [ ] Ordenamiento
2- [ ] Implementar CRUD
  1- [ ] Crear template
  2- [ ] Editar template
  3- [ ] Eliminar template
  4- [ ] Duplicar template
3- [ ] Implementar parámetros
  1- [ ] Validación
  2- [ ] Tipos dinámicos
  3- [ ] Valores por defecto
4- [ ] Implementar sincronización
  1- [ ] Con schema padre
  2- [ ] Entre templates
  3- [ ] Historial de cambios

### 3.3 Funcionalidades Compartidas
1- [ ] Sistema de notificaciones
  1- [ ] Errores
  2- [ ] Éxitos
  3- [ ] Advertencias
  4- [ ] Progreso
2- [ ] Loading states
  1- [ ] Skeletons
  2- [ ] Spinners
  3- [ ] Progress bars
3- [ ] Modales y diálogos
  1- [ ] Confirmaciones
  2- [ ] Forms modales
  3- [ ] Previews

## 4. Testing y Optimización

### 4.1 Optimización
1- [ ] Performance
  1- [ ] Lazy loading
  2- [ ] Code splitting
  3- [ ] Bundle size
2- [ ] Renders
  1- [ ] Memoización
  2- [ ] Virtualización
  3- [ ] Debouncing
3- [ ] Network
  1- [ ] Caching
  2- [ ] Optimistic updates
  3- [ ] Request batching

## 5. Limpieza y Documentación

### 5.1 Limpieza
1- [ ] Código legacy
  1- [ ] Remover componentes antiguos
  2- [ ] Limpiar imports no usados
  3- [ ] Actualizar dependencias
2- [ ] Tipos
  1- [ ] Remover tipos duplicados
  2- [ ] Consolidar interfaces
  3- [ ] Actualizar tipos obsoletos
3- [ ] Estilos
  1- [ ] Remover CSS no usado
  2- [ ] Consolidar utilidades
  3- [ ] Actualizar temas

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

