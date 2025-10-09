import { Injectable } from '@angular/core';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { getValidationMessages } from './validation-messages';

//Servicio para procesar campos de formulario que vienen del servidor
@Injectable({ providedIn: 'root' })
export class FormFieldProcessorService {
  // Procesa un array de campos de formulario y les agrega los mensajes de validación
  processFields(fields: FormlyFieldConfig[]): FormlyFieldConfig[] {
    return fields.map((field) => this.processField(field));
  }

  //Procesa un campo individual
  private processField(field: FormlyFieldConfig): FormlyFieldConfig {
    // Si el campo ya tiene mensajes de validación personalizados, los respetamos
    if (field.validation?.messages) {
      return field;
    }

    // Detectar qué validaciones tiene el campo
    const validations = this.detectValidations(field);

    // Si tiene validaciones, agregar los mensajes automáticamente
    if (validations.length > 0) {
      const props = field.props || field.templateOptions || {};

      field.validation = {
        ...field.validation,
        messages: getValidationMessages(validations, props),
      };
    }

    // Si el campo tiene fieldGroup (campos anidados), procesarlos recursivamente
    if (field.fieldGroup && field.fieldGroup.length > 0) {
      field.fieldGroup = this.processFields(field.fieldGroup);
    }

    // Si el campo tiene fieldArray, procesar el template
    if (
      field.fieldArray &&
      typeof field.fieldArray === 'object' &&
      'fieldGroup' in field.fieldArray
    ) {
      const fieldArray = field.fieldArray as FormlyFieldConfig;
      if (fieldArray.fieldGroup) {
        fieldArray.fieldGroup = this.processFields(fieldArray.fieldGroup);
      }
    }

    return field;
  }

  // Detecta automáticamente qué validaciones tiene un campo basándose en props templateOptions
  private detectValidations(field: FormlyFieldConfig): string[] {
    const validations: string[] = [];
    const props = field.props || field.templateOptions || {};

    // Detectar validaciones comunes
    if (props['required']) {
      validations.push('required');
    }

    if (props['minLength'] || props['minlength']) {
      validations.push('minlength');
    }

    if (props['maxLength'] || props['maxlength']) {
      validations.push('maxlength');
    }

    if (props['min'] !== undefined) {
      validations.push('min');
    }

    if (props['max'] !== undefined) {
      validations.push('max');
    }

    if (props['pattern']) {
      validations.push('pattern');
    }

    if (props['type'] === 'email' || field.type === 'email') {
      validations.push('email');
    }

    // Si el campo tiene validators personalizados, también los incluimos
    if (field.validators) {
      Object.keys(field.validators).forEach((validatorName) => {
        if (!validations.includes(validatorName)) {
          validations.push(validatorName);
        }
      });
    }

    return validations;
  }

  // Método alternativo: procesar y permitir sobrescribir mensajes desde el servidor
  processFieldsWithServerMessages(
    fields: FormlyFieldConfig[],
    serverMessages?: { [fieldKey: string]: { [validationKey: string]: string } }
  ): FormlyFieldConfig[] {
    return fields.map((field) => {
      const processedField = this.processField(field);

      // Si hay mensajes del servidor para este campo, sobrescribirlos
      if (serverMessages && field.key && serverMessages[field.key as string]) {
        processedField.validation = {
          ...processedField.validation,
          messages: {
            ...processedField.validation?.messages,
            ...serverMessages[field.key as string],
          },
        };
      }

      return processedField;
    });
  }
}
