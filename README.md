# 📋 EverCodes Dynamic Forms

Aplicación Angular 20 para generar formularios dinámicos a partir de definiciones JSON usando **ngx-formly** con **Angular Material**.

## 🚀 Inicio Rápido

### Requisitos
- Node.js 18+ 
- Angular CLI 20+

### Instalación y Ejecución

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm start
# La app estará en http://localhost:4200
```

## 🏗️ Tecnologías

- **Angular 20** - Framework principal
- **ngx-formly 7** - Generación de formularios dinámicos
- **Angular Material** - Componentes UI
- **TypeScript 5.9** - Lenguaje
- **Signals** - Manejo de estado reactivo

## 📂 Estructura

```
src/
├── app/
│   ├── features/
│   │   └── dynamic-forms/
│   │       ├── components/
│   │       │   └── dynamic-form/         # Componente principal del formulario
│   │       ├── models/                   # Interfaces TypeScript
│   │       └── services/
│   │           └── form-definition.store.ts  # Store con Signals
│   └── shared/
│       └── components/
│           └── nav-bar/                  # Barra de navegación
```

## ⚙️ Configuración del API

El formulario consume un endpoint REST que debe devolver:

```json
{
  "formName": "User Registration",
  "fields": [
    {
      "key": "username",
      "type": "input",
      "templateOptions": {
        "label": "Username",
        "required": true,
        "minLength": 3,
        "maxLength": 20,
        "type": "text",
        "placeholder": "Ingrese su usuario",
        "options": null
      }
    }
  ]
}
```

**Endpoint por defecto:** `https://localhost:7261/api/DynamicForm/get-form-definition`

Para cambiar la URL del API, edita: `src/app/features/dynamic-forms/services/form-definition.store.ts`

## 🎨 Tipos de Campo Soportados

### Campos de Material (ngx-formly/material)

- `input` - Campo de texto
- `textarea` - Área de texto
- `select` - Selector dropdown
- `checkbox` - Casilla de verificación
- `radio` - Botones de radio
- `datepicker` - Selector de fecha

## 📱 Diseño Responsive

- **Paleta de colores:** Grises y azules neutros
- **Navegación:** Sticky navbar con gradiente
- **Formulario:** Diseño moderno con sombras y bordes redondeados
- **Adaptable:** Se ajusta a móviles y tablets

## 🛠️ Comandos Disponibles

```bash
# Desarrollo
npm start              # Servidor de desarrollo

# Build
npm run build          # Build de producción en /dist

# Testing
npm test               # Ejecutar tests con Karma

# Watch mode
npm run watch          # Build en modo watch
```

## 📝 Ejemplo de Uso

1. El backend devuelve la definición del formulario
2. `FormDefinitionStore` carga y almacena la configuración usando Signals
3. El componente `dynamic-form` renderiza el formulario con `formly-form`
4. Al enviar, los datos se validan y procesan

## 🔗 Rutas

- `/` - Página principal
- `/dynamic-form` - Formulario dinámico

## 📄 Licencia

Ver archivo [LICENSE](LICENSE)

## 👨‍💻 Autor

**Everlm** - [EverCodes](https://github.com/Everlm)
