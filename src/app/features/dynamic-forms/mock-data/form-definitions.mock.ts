/**
 * 🧪 Mock de Respuesta del Servidor
 *
 * Este archivo simula la respuesta que vendría del servidor
 * Úsalo para probar el procesamiento automático de validaciones
 * Y el sistema de grid layout con fieldGroupClassName y className
 */

export const MOCK_FORM_DEFINITION = {
  formName: "Formulario de Registro Completo",
  fields: [
    // ========== GRUPO CON GRID: 2 COLUMNAS ==========
    {
      fieldGroupClassName: 'display-grid', // ← Activa el grid de 12 columnas
      fieldGroup: [
        // Fila 1: Nombre y Apellido (50% cada uno)
        {
          key: "firstName",
          type: "input",
          className: "col-6", // ← 6 de 12 columnas = 50%
          props: {
            label: "Nombre",
            placeholder: "Ingrese su nombre",
            required: true,
            minLength: 2,
            maxLength: 50
          }
        },
        {
          key: "lastName",
          type: "input",
          className: "col-6", // ← 6 de 12 columnas = 50%
          props: {
            label: "Apellido",
            placeholder: "Ingrese su apellido",
            required: true,
            minLength: 2,
            maxLength: 50
          }
        },

        // Fila 2: Username y Email (50% cada uno)
        {
          key: "username",
          type: "input",
          className: "col-6",
          props: {
            label: "Nombre de Usuario",
            placeholder: "usuario123",
            required: true,
            minLength: 3,
            maxLength: 20
          }
        },
        {
          key: "email",
          type: "input",
          className: "col-6",
          props: {
            label: "Correo Electrónico",
            placeholder: "usuario@ejemplo.com",
            required: true,
            type: "email"
          }
        },

        // Fila 3: Password ocupa todo el ancho (100%)
        {
          key: "password",
          type: "input",
          className: "col-12", // ← 12 de 12 columnas = 100%
          props: {
            label: "Contraseña",
            placeholder: "Ingrese una contraseña segura",
            type: "password",
            required: true,
            minLength: 8,
            maxLength: 50
          }
        },

        // Fila 4: Edad, Teléfono y Código Postal (33% cada uno)
        {
          key: "age",
          type: "input",
          className: "col-4", // ← 4 de 12 columnas = 33.33%
          props: {
            label: "Edad",
            placeholder: "18",
            type: "number",
            required: true,
            min: 18,
            max: 100
          }
        },
        {
          key: "phone",
          type: "input",
          className: "col-4",
          props: {
            label: "Teléfono",
            placeholder: "1234567890",
            required: true,
            pattern: "^[0-9]{10}$",
            patternValidationMessage: "Debe ingresar exactamente 10 dígitos numéricos"
          }
        },
        {
          key: "zipCode",
          type: "input",
          className: "col-4",
          props: {
            label: "Código Postal",
            placeholder: "12345",
            required: false,
            pattern: "^[0-9]{5}$",
            patternValidationMessage: "El código postal debe tener 5 dígitos"
          }
        }
      ]
    }
  ]
};

/**
 * Mock con mensajes personalizados del servidor
 */
export const MOCK_FORM_WITH_CUSTOM_MESSAGES = {
  formName: "Formulario con Mensajes Personalizados",
  fields: [
    {
      fieldGroupClassName: 'display-grid',
      fieldGroup: [
        {
          key: "username",
          type: "input",
          className: "col-6",
          props: {
            label: "Usuario VIP",
            required: true,
            minLength: 5,
            maxLength: 15
          },
          validation: {
            messages: {
              required: "⭐ Este campo es obligatorio para usuarios VIP",
              minlength: "⭐ El usuario VIP debe tener al menos 5 caracteres",
              maxlength: "⭐ El usuario VIP no puede exceder 15 caracteres"
            }
          }
        },
        {
          key: "email",
          type: "input",
          className: "col-6",
          props: {
            label: "Email Corporativo",
            required: true,
            type: "email"
          },
          validation: {
            messages: {
              required: "📧 Necesitamos tu email corporativo",
              email: "📧 Por favor, ingresa un email corporativo válido"
            }
          }
        }
      ]
    }
  ]
};

/**
 * Mock con campos anidados (fieldGroup)
 * Demuestra el uso de secciones con su propio grid independiente
 */
export const MOCK_FORM_WITH_NESTED_FIELDS = {
  formName: "Formulario con Secciones",
  fields: [
    // Sección 1: Información Personal con grid
    {
      key: "personalInfo",
      wrappers: ["panel"],
      props: {
        label: "👤 Información Personal"
      },
      fieldGroupClassName: 'display-grid', // ← Grid para esta sección
      fieldGroup: [
        {
          key: "firstName",
          type: "input",
          className: "col-6", // ← 50% ancho
          props: {
            label: "Nombre",
            required: true,
            minLength: 2
          }
        },
        {
          key: "lastName",
          type: "input",
          className: "col-6", // ← 50% ancho
          props: {
            label: "Apellido",
            required: true,
            minLength: 2
          }
        },
        {
          key: "age",
          type: "input",
          className: "col-12", // ← 100% ancho
          props: {
            label: "Edad",
            type: "number",
            required: true,
            min: 18,
            max: 100
          }
        }
      ]
    },
    // Sección 2: Información de Contacto con grid
    {
      key: "contactInfo",
      wrappers: ["panel"],
      props: {
        label: "📞 Información de Contacto"
      },
      fieldGroupClassName: 'display-grid', // ← Grid para esta sección
      fieldGroup: [
        {
          key: "email",
          type: "input",
          className: "col-8", // ← 66% ancho
          props: {
            label: "Email",
            required: true,
            type: "email"
          }
        },
        {
          key: "phone",
          type: "input",
          className: "col-4", // ← 33% ancho
          props: {
            label: "Teléfono",
            required: true,
            pattern: "^[0-9]{10}$",
            patternValidationMessage: "10 dígitos requeridos"
          }
        }
      ]
    }
  ]
};
