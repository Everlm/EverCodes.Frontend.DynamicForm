# 📋 EverCodes Dynamic Forms

Aplicación Angular 18+ para generar formularios dinámicos a partir de definiciones JSON usando **ngx-formly** con **Angular Material**. Incluye dos implementaciones: **Signals** (moderno) y **RxJS** (clásico) para comparación.

## 🚀 Inicio Rápido

```bash
npm install    # Instalar dependencias
npm start      # Ejecutar en desarrollo (http://localhost:4200)
```

## 🏗️ Tecnologías

- **Angular 18+** - Standalone components, control flow
- **ngx-formly v6+** - Formularios dinámicos con grid layout
- **Angular Material** - Componentes UI
- **Signals + RxJS** - Dos enfoques de manejo de estado
- **TypeScript** - Strict mode

## 📂 Estructura

```
src/app/
├── features/dynamic-forms/
│   ├── components/
│   │   ├── dynamic-form/              # Componente con Signals
│   │   └── dynamic-form-rxjs/         # Componente con RxJS
│   ├── services/
│   │   ├── form-definition.store.ts   # Store con Signals
│   │   └── form-definition-rxjs.service.ts  # Service con RxJS
│   └── mock-data/
│       ├── form-definitions.mock.ts   # Datos de prueba
│       └── layout-examples.mock.ts    # Ejemplos de layouts
└── shared/
    ├── components/nav-bar/            # Navegación entre versiones
    └── formly/
        ├── formly.config.ts           # Configuración de Formly
        ├── validation-messages.ts     # Mensajes centralizados
        └── form-field-processor.service.ts  # Auto-procesamiento
```

## ⚙️ Formato JSON del Servidor

**Estructura con Grid Layout (Recomendado):**

```json
{
  "formName": "User Registration",
  "fields": [
    {
      "fieldGroupClassName": "display-grid",
      "fieldGroup": [
        {
          "key": "username",
          "type": "input",
          "className": "col-6",
          "props": {
            "label": "Username",
            "required": true,
            "minLength": 3,
            "placeholder": "Ingrese su usuario"
          }
        }
      ]
    }
  ]
}
```

**Propiedades clave:**
- `props` - Configuración del campo (en lugar de `templateOptions`)
- `fieldGroupClassName: "display-grid"` - Activa el sistema de grid
- `className: "col-X"` - Define el ancho (col-6 = 50%, col-12 = 100%)

**Endpoint:** `https://localhost:7261/api/DynamicForm/get-form-definition`

## ✨ Características

### 🎯 Grid Layout Flexible
- Sistema de **12 columnas** (como Bootstrap)
- Configurable desde el JSON del servidor
- **Responsive automático** (1 columna en móvil)
- Layouts mixtos en el mismo formulario

### 🔄 Dos Implementaciones
- **⚡ Signals** (`/dynamic-form`) - Enfoque moderno de Angular
- **🔄 RxJS** (`/dynamic-form/rxjs`) - Enfoque tradicional con Observables

### ✅ Validaciones
- **Mensajes centralizados** en `validation-messages.ts`
- **Auto-procesamiento** de validaciones desde el servidor
- Soporte para mensajes personalizados por campo
- Validaciones: required, minLength, maxLength, email, pattern, min, max

### 📱 Diseño
- Material Design con Angular Material
- Responsive (desktop: grid flexible, móvil: 1 columna)
- Animaciones y transiciones suaves

## 🎨 Ejemplos de Grid Layout

```json
// 50% + 50%
"className": "col-6"

// 33% + 33% + 33%
"className": "col-4"

// 66% + 33%
"className": "col-8" y "col-4"

// 100%
"className": "col-12"
```

## � Rutas

- **`/`** - Formulario con Signals
- **`/rxjs`** - Formulario con RxJS

Navega entre versiones usando la barra superior.

## � Documentación

- `layout-examples.mock.ts` - 7 ejemplos de layouts diferentes
- `form-definitions.mock.ts` - Datos de prueba con grid
- Componentes incluyen README.md con documentación

## 📄 Licencia

Ver archivo [LICENSE](LICENSE)

## 👨‍💻 Autor

**Everlm** - [EverCodes](https://github.com/Everlm)
