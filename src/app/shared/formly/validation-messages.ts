// validation-messages.ts
// Mensajes de validación centralizados y reutilizables

export const ValidationMessages = {
  required: 'Este campo es obligatorio',
  email: 'Formato de correo inválido',

  // Mensajes dinámicos (funciones)
  minlength: (length: number) => `Debe tener al menos ${length} caracteres`,
  maxlength: (length: number) => `No puede tener más de ${length} caracteres`,
  min: (value: number) => `El valor mínimo es ${value}`,
  max: (value: number) => `El valor máximo es ${value}`,
  pattern: (message?: string) => message || 'El formato no es válido',
};

/**
 * Helper para generar mensajes de validación para un campo
 * @param validations - Array de nombres de validaciones necesarias
 * @param props - Propiedades del campo (para valores dinámicos)
 * @returns Objeto con los mensajes de validación
 */
export function getValidationMessages(
  validations: string[],
  props?: any
): { [key: string]: string } {
  const messages: { [key: string]: string } = {};

  validations.forEach((validation) => {
    switch (validation) {
      case 'required':
        messages['required'] = ValidationMessages.required;
        break;
      case 'email':
        messages['email'] = ValidationMessages.email;
        break;
      case 'minlength':
        messages['minlength'] = ValidationMessages.minlength(props?.minLength || 0);
        break;
      case 'maxlength':
        messages['maxlength'] = ValidationMessages.maxlength(props?.maxLength || 0);
        break;
      case 'min':
        messages['min'] = ValidationMessages.min(props?.min || 0);
        break;
      case 'max':
        messages['max'] = ValidationMessages.max(props?.max || 0);
        break;
      case 'pattern':
        messages['pattern'] = ValidationMessages.pattern(props?.patternValidationMessage);
        break;
    }
  });

  return messages;
}
