# 📋 EverCodes Dynamic Forms

Sistema de formularios dinámicos con Angular 20+, **ngx-formly** y **Angular Material**. Los formularios se generan completamente desde el backend (JSON) con validaciones personalizadas, grid layout de 12 columnas y estilos Glass Morphism.

## 🚀 Inicio Rápido

```bash
npm install    # Instalar dependencias
npm start      # Ejecutar en desarrollo (http://localhost:4200)
ng build --configuration production  # Build optimizado
```

## 🏗️ Stack

- **Angular 20** - Zoneless, Standalone Components
- **ngx-formly 7** - Formularios dinámicos JSON-driven
- **Angular Material 20** - UI Components
- **Signals + RxJS** - Dos implementaciones de estado
- **SCSS Mixins** - Estilos reutilizables

## 📂 Estructura

```
src/app/
├── features/dynamic-forms/
│   ├── components/
│   │   ├── dynamic-form-signals/        # Implementación con Signals
│   │   └── dynamic-form-rxjs/           # Implementación con RxJS
│   ├── services/
│   │   ├── form-definition.store.ts     # Store (Signals)
│   │   └── form-definition-rxjs.service.ts  # Service (RxJS)
│   └── models/
│       └── form-definition.interface.ts # Tipado TypeScript
├── shared/
│   ├── components/                      # Nav, Footer
│   ├── formly/
│   │   ├── form-field-processor.service.ts  # Conversión Backend→Formly
│   │   └── validation-messages.ts           # Mensajes de validación
│   └── styles/
│       └── _form-styles.scss            # Mixins SCSS reutilizables
└── styles.scss                          # Estilos globales
```

## ⚙️ Formato JSON Backend

El backend controla TODO el formulario via JSON:

```json
{
  "name": "User Form",
  "fields": [
    {
      "fieldGroupClassName": "display-grid",
      "fieldGroup": [
        {
          "key": "email",
          "type": "input",
          "className": "col-6",
          "props": {
            "label": "Email",
            "required": true,
            "pattern": "^[a-zA-Z0-9._\\+%\\-]+@evercodes\\.com$"
          },
          "validation": {
            "messages": {
              "required": "El email es obligatorio",
              "pattern": "Debe ser @evercodes.com"
            }
          }
        }
      ]
    }
  ]
}
```

**Propiedades clave:**

- `fieldGroupClassName: "display-grid"` → Activa grid de 12 columnas
- `className: "col-6"` → Ancho del campo (col-6 = 50%, col-12 = 100%)
- `validation.messages` → Mensajes personalizados desde backend
- `props.pattern` → Regex para validaciones (escapar con `\\`)

## ✨ Características

**🎯 Grid Layout Flexible:** Sistema de 12 columnas configurable desde JSON, responsive automático (1 columna en móvil)

**🔄 Dos Implementaciones:** `/dynamic-form/signals` (moderno) y `/dynamic-form/rxjs` (clásico)

**✅ Validaciones:** Mensajes desde backend o auto-generados, soporte para pattern/regex, validaciones: required, minLength, maxLength, email, pattern, min, max

**🎨 Estilos Reutilizables:** Mixins SCSS compartidos entre componentes (DRY), Glass Morphism effects

**📱 Responsive:** Desktop: grid flexible, Móvil: single column

## 📄 Licencia

Ver archivo [LICENSE](LICENSE)

## 👨‍💻 Autor

**Everlm** - [EverCodes](https://github.com/Everlm)
