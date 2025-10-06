/**
 * 🎨 Ejemplos de Layouts con Formly Grid Integration
 *
 * Este archivo contiene diferentes ejemplos de layouts que puedes usar
 * con el sistema de grid de 12 columnas de Formly.
 *
 * IMPORTANTE: El servidor debe enviar el JSON con:
 * - fieldGroupClassName: 'display-grid' para activar el grid
 * - className: 'col-X' en cada campo para definir su ancho
 */

import { FormDefinitionResponse } from '../models/form-definition.interface';

/**
 * 📝 EJEMPLO 1: Formulario de Contacto Simple
 * Layout: 2 columnas para nombre/apellido, resto 100% ancho
 */
export const CONTACT_FORM: FormDefinitionResponse = {
  formName: "Formulario de Contacto",
  fields: [
    {
      fieldGroupClassName: 'display-grid',
      fieldGroup: [
        // Fila 1: Nombre y Apellido (50% cada uno)
        {
          key: "firstName",
          type: "input",
          className: "col-6",
          props: { label: "Nombre", required: true }
        },
        {
          key: "lastName",
          type: "input",
          className: "col-6",
          props: { label: "Apellido", required: true }
        },
        // Fila 2: Email (100% ancho)
        {
          key: "email",
          type: "input",
          className: "col-12",
          props: { label: "Email", required: true, type: "email" }
        },
        // Fila 3: Mensaje (100% ancho)
        {
          key: "message",
          type: "textarea",
          className: "col-12",
          props: { label: "Mensaje", required: true, rows: 5 }
        }
      ]
    }
  ]
};

/**
 * 🏢 EJEMPLO 2: Formulario de Dirección
 * Layout: Mixto con diferentes anchos
 */
export const ADDRESS_FORM: FormDefinitionResponse = {
  formName: "Dirección de Envío",
  fields: [
    {
      fieldGroupClassName: 'display-grid',
      fieldGroup: [
        // Fila 1: Calle (66%) y Número (33%)
        {
          key: "street",
          type: "input",
          className: "col-8",
          props: { label: "Calle", required: true }
        },
        {
          key: "number",
          type: "input",
          className: "col-4",
          props: { label: "Número", required: true }
        },
        // Fila 2: Ciudad, Estado, CP (33% cada uno)
        {
          key: "city",
          type: "input",
          className: "col-4",
          props: { label: "Ciudad", required: true }
        },
        {
          key: "state",
          type: "input",
          className: "col-4",
          props: { label: "Estado", required: true }
        },
        {
          key: "zipCode",
          type: "input",
          className: "col-4",
          props: { label: "Código Postal", required: true }
        },
        // Fila 3: País (100% ancho)
        {
          key: "country",
          type: "input",
          className: "col-12",
          props: { label: "País", required: true }
        }
      ]
    }
  ]
};

/**
 * 💳 EJEMPLO 3: Formulario de Pago
 * Layout: Complejo con diferentes proporciones
 */
export const PAYMENT_FORM: FormDefinitionResponse = {
  formName: "Información de Pago",
  fields: [
    {
      fieldGroupClassName: 'display-grid',
      fieldGroup: [
        // Fila 1: Número de tarjeta (100%)
        {
          key: "cardNumber",
          type: "input",
          className: "col-12",
          props: {
            label: "Número de Tarjeta",
            required: true,
            placeholder: "1234 5678 9012 3456"
          }
        },
        // Fila 2: Titular (100%)
        {
          key: "cardHolder",
          type: "input",
          className: "col-12",
          props: {
            label: "Titular de la Tarjeta",
            required: true
          }
        },
        // Fila 3: Fecha (50%), CVV (25%), Tipo (25%)
        {
          key: "expiryDate",
          type: "input",
          className: "col-6",
          props: {
            label: "Fecha de Vencimiento",
            required: true,
            placeholder: "MM/YY"
          }
        },
        {
          key: "cvv",
          type: "input",
          className: "col-3",
          props: {
            label: "CVV",
            required: true,
            placeholder: "123"
          }
        },
        {
          key: "cardType",
          type: "select",
          className: "col-3",
          props: {
            label: "Tipo",
            required: true,
            options: [
              { value: 'visa', label: 'Visa' },
              { value: 'mastercard', label: 'Mastercard' },
              { value: 'amex', label: 'American Express' }
            ]
          }
        }
      ]
    }
  ]
};

/**
 * 👤 EJEMPLO 4: Perfil de Usuario
 * Layout: Con secciones separadas, cada una con su propio grid
 */
export const USER_PROFILE_FORM: FormDefinitionResponse = {
  formName: "Perfil de Usuario",
  fields: [
    // Sección 1: Información Personal
    {
      props: { label: "👤 Información Personal" },
      fieldGroupClassName: 'display-grid',
      fieldGroup: [
        {
          key: "firstName",
          type: "input",
          className: "col-6",
          props: { label: "Nombre", required: true }
        },
        {
          key: "lastName",
          type: "input",
          className: "col-6",
          props: { label: "Apellido", required: true }
        },
        {
          key: "birthDate",
          type: "input",
          className: "col-6",
          props: { label: "Fecha de Nacimiento", type: "date", required: true }
        },
        {
          key: "gender",
          type: "select",
          className: "col-6",
          props: {
            label: "Género",
            options: [
              { value: 'male', label: 'Masculino' },
              { value: 'female', label: 'Femenino' },
              { value: 'other', label: 'Otro' }
            ]
          }
        }
      ]
    },
    // Sección 2: Contacto
    {
      props: { label: "📞 Información de Contacto" },
      fieldGroupClassName: 'display-grid',
      fieldGroup: [
        {
          key: "email",
          type: "input",
          className: "col-8",
          props: { label: "Email", required: true, type: "email" }
        },
        {
          key: "phone",
          type: "input",
          className: "col-4",
          props: { label: "Teléfono", required: true }
        }
      ]
    },
    // Sección 3: Redes Sociales
    {
      props: { label: "🌐 Redes Sociales" },
      fieldGroupClassName: 'display-grid',
      fieldGroup: [
        {
          key: "twitter",
          type: "input",
          className: "col-4",
          props: { label: "Twitter", placeholder: "@usuario" }
        },
        {
          key: "linkedin",
          type: "input",
          className: "col-4",
          props: { label: "LinkedIn", placeholder: "linkedin.com/in/usuario" }
        },
        {
          key: "github",
          type: "input",
          className: "col-4",
          props: { label: "GitHub", placeholder: "@usuario" }
        }
      ]
    }
  ]
};

/**
 * 🎓 EJEMPLO 5: Formulario de Registro Académico
 * Layout: Complejo con diferentes configuraciones por fila
 */
export const ACADEMIC_FORM: FormDefinitionResponse = {
  formName: "Registro Académico",
  fields: [
    {
      fieldGroupClassName: 'display-grid',
      fieldGroup: [
        // Fila 1: Nombre completo (100%)
        {
          key: "fullName",
          type: "input",
          className: "col-12",
          props: { label: "Nombre Completo", required: true }
        },
        // Fila 2: Matrícula (25%), Carrera (50%), Semestre (25%)
        {
          key: "studentId",
          type: "input",
          className: "col-3",
          props: { label: "Matrícula", required: true }
        },
        {
          key: "program",
          type: "select",
          className: "col-6",
          props: {
            label: "Carrera",
            required: true,
            options: [
              { value: 'cs', label: 'Ciencias de la Computación' },
              { value: 'eng', label: 'Ingeniería' },
              { value: 'math', label: 'Matemáticas' }
            ]
          }
        },
        {
          key: "semester",
          type: "input",
          className: "col-3",
          props: { label: "Semestre", type: "number", required: true }
        },
        // Fila 3: Email institucional y personal (50% cada uno)
        {
          key: "institutionalEmail",
          type: "input",
          className: "col-6",
          props: {
            label: "Email Institucional",
            required: true,
            type: "email",
            placeholder: "estudiante@universidad.edu"
          }
        },
        {
          key: "personalEmail",
          type: "input",
          className: "col-6",
          props: {
            label: "Email Personal",
            type: "email",
            placeholder: "correo@ejemplo.com"
          }
        },
        // Fila 4: Teléfono (33%), Móvil (33%), Emergencia (33%)
        {
          key: "phone",
          type: "input",
          className: "col-4",
          props: { label: "Teléfono Casa" }
        },
        {
          key: "mobile",
          type: "input",
          className: "col-4",
          props: { label: "Móvil", required: true }
        },
        {
          key: "emergencyContact",
          type: "input",
          className: "col-4",
          props: { label: "Contacto Emergencia", required: true }
        }
      ]
    }
  ]
};

/**
 * 🏪 EJEMPLO 6: Formulario de Producto (E-commerce)
 * Layout: Asimétrico para diferentes tipos de campos
 */
export const PRODUCT_FORM: FormDefinitionResponse = {
  formName: "Nuevo Producto",
  fields: [
    {
      fieldGroupClassName: 'display-grid',
      fieldGroup: [
        // Fila 1: Nombre del producto (100%)
        {
          key: "productName",
          type: "input",
          className: "col-12",
          props: { label: "Nombre del Producto", required: true }
        },
        // Fila 2: SKU (33%), Precio (33%), Stock (33%)
        {
          key: "sku",
          type: "input",
          className: "col-4",
          props: { label: "SKU", required: true }
        },
        {
          key: "price",
          type: "input",
          className: "col-4",
          props: { label: "Precio", type: "number", required: true }
        },
        {
          key: "stock",
          type: "input",
          className: "col-4",
          props: { label: "Stock", type: "number", required: true }
        },
        // Fila 3: Categoría (66%), Estado (33%)
        {
          key: "category",
          type: "select",
          className: "col-8",
          props: {
            label: "Categoría",
            required: true,
            options: [
              { value: 'electronics', label: 'Electrónica' },
              { value: 'clothing', label: 'Ropa' },
              { value: 'books', label: 'Libros' }
            ]
          }
        },
        {
          key: "status",
          type: "select",
          className: "col-4",
          props: {
            label: "Estado",
            required: true,
            options: [
              { value: 'active', label: 'Activo' },
              { value: 'inactive', label: 'Inactivo' }
            ]
          }
        },
        // Fila 4: Descripción (100%)
        {
          key: "description",
          type: "textarea",
          className: "col-12",
          props: { label: "Descripción", rows: 4 }
        }
      ]
    }
  ]
};

/**
 * 📊 EJEMPLO 7: Layout Responsivo Complejo
 * Combina diferentes anchos para crear un layout interesante
 */
export const COMPLEX_LAYOUT_FORM: FormDefinitionResponse = {
  formName: "Layout Complejo Demo",
  fields: [
    {
      fieldGroupClassName: 'display-grid',
      fieldGroup: [
        // Fila 1: 25% + 75%
        {
          key: "field1",
          type: "input",
          className: "col-3",
          props: { label: "25%" }
        },
        {
          key: "field2",
          type: "input",
          className: "col-9",
          props: { label: "75%" }
        },
        // Fila 2: 33% + 33% + 33%
        {
          key: "field3",
          type: "input",
          className: "col-4",
          props: { label: "33%" }
        },
        {
          key: "field4",
          type: "input",
          className: "col-4",
          props: { label: "33%" }
        },
        {
          key: "field5",
          type: "input",
          className: "col-4",
          props: { label: "33%" }
        },
        // Fila 3: 50% + 50%
        {
          key: "field6",
          type: "input",
          className: "col-6",
          props: { label: "50%" }
        },
        {
          key: "field7",
          type: "input",
          className: "col-6",
          props: { label: "50%" }
        },
        // Fila 4: 100%
        {
          key: "field8",
          type: "input",
          className: "col-12",
          props: { label: "100%" }
        },
        // Fila 5: 20% + 20% + 20% + 20% + 20%
        {
          key: "field9",
          type: "input",
          className: "col-2",
          props: { label: "20%" }
        },
        {
          key: "field10",
          type: "input",
          className: "col-2",
          props: { label: "20%" }
        },
        {
          key: "field11",
          type: "input",
          className: "col-2",
          props: { label: "20%" }
        },
        {
          key: "field12",
          type: "input",
          className: "col-2",
          props: { label: "20%" }
        },
        {
          key: "field13",
          type: "input",
          className: "col-4",
          props: { label: "40%" }
        }
      ]
    }
  ]
};

/**
 * 📋 CÓMO USAR ESTOS EJEMPLOS EN TU APLICACIÓN
 *
 * 1. En el componente TypeScript:
 *
 *    import { CONTACT_FORM } from './layout-examples.mock';
 *
 *    ngOnInit() {
 *      this.fields.set(CONTACT_FORM.fields);
 *    }
 *
 * 2. Desde el servidor (C# ejemplo):
 *
 *    public class FormDefinitionResponse
 *    {
 *        public string FormName { get; set; }
 *        public List<FormlyFieldConfig> Fields { get; set; }
 *    }
 *
 *    public class FormlyFieldConfig
 *    {
 *        public string Key { get; set; }
 *        public string Type { get; set; }
 *        public string ClassName { get; set; }  // ← "col-6", "col-12", etc.
 *        public string FieldGroupClassName { get; set; }  // ← "display-grid"
 *        public List<FormlyFieldConfig> FieldGroup { get; set; }
 *        public FieldProps Props { get; set; }
 *    }
 *
 * 3. Respuesta JSON del servidor:
 *
 *    {
 *      "formName": "Mi Formulario",
 *      "fields": [
 *        {
 *          "fieldGroupClassName": "display-grid",
 *          "fieldGroup": [
 *            {
 *              "key": "firstName",
 *              "type": "input",
 *              "className": "col-6",
 *              "props": { "label": "Nombre" }
 *            }
 *          ]
 *        }
 *      ]
 *    }
 */
