import { Injectable } from '@angular/core';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { getValidationMessages } from './validation-messages';
import { FormlyFieldConfigResponse } from '../../features/dynamic-forms/models/form-definition.interface';

//Servicio para procesar campos de formulario que vienen del servidor
@Injectable({ providedIn: 'root' })
export class FormFieldProcessorService {
  // Convierte los campos del formato del backend al formato de Formly
  convertBackendFieldsToFormly(backendFields: FormlyFieldConfigResponse[]): FormlyFieldConfig[] {
    return backendFields.map((backendField) => this.convertBackendField(backendField));
  }

  // Convierte un campo individual del formato del backend al formato de Formly
  private convertBackendField(backendField: FormlyFieldConfigResponse): FormlyFieldConfig {
    const formlyField: FormlyFieldConfig = {
      key: backendField.key || undefined,
      type: backendField.type || undefined,
      defaultValue: backendField.defaultValue || undefined,
      className: backendField.className || undefined,
      fieldGroupClassName: backendField.fieldGroupClassName || undefined,
      hide: backendField.hide || undefined,
      resetOnHide: backendField.resetOnHide || undefined,
      focus: backendField.focus || undefined,
      wrappers:
        backendField.wrappers && backendField.wrappers.length > 0
          ? backendField.wrappers
          : undefined,
    };

    // Si el backend envía mensajes de validación personalizados, incluirlos
    if (backendField.validation?.messages && Object.keys(backendField.validation.messages).length > 0) {
      formlyField.validation = {
        messages: backendField.validation.messages,
      };
    }

    // Convertir las props si existen
    if (backendField.props) {
      formlyField.props = {
        type: backendField.props.type || undefined,
        label: backendField.props.label || undefined,
        placeholder: backendField.props.placeholder || undefined,
        description: backendField.props.description || undefined,
        required: backendField.props.required || undefined,
        disabled: backendField.props.disabled || undefined,
        readonly: backendField.props.readonly || undefined,
        hidden: backendField.props.hidden || undefined,
        appearance: backendField.props.appearance || undefined,
        tabindex: backendField.props.tabindex || undefined,
        // Validaciones numéricas - solo incluir si tienen valores mayores a 0
        min: backendField.props.min > 0 ? backendField.props.min : undefined,
        max: backendField.props.max > 0 ? backendField.props.max : undefined,
        minLength: backendField.props.minLength > 0 ? backendField.props.minLength : undefined,
        maxLength: backendField.props.maxLength > 0 ? backendField.props.maxLength : undefined,
        step: backendField.props.step > 0 ? backendField.props.step : undefined,
        rows: backendField.props.rows > 0 ? backendField.props.rows : undefined,
        cols: backendField.props.cols > 0 ? backendField.props.cols : undefined,
        pattern: backendField.props.pattern || undefined,
        // Convertir options si existen
        options:
          backendField.props.options && backendField.props.options.length > 0
            ? backendField.props.options.map((opt) => ({
                value: opt.value,
                label: opt.label,
              }))
            : undefined,
      };

      // Limpiar propiedades undefined
      Object.keys(formlyField.props).forEach((key) => {
        if (formlyField.props![key] === undefined) {
          delete formlyField.props![key];
        }
      });
    }

    // Procesar fieldGroup recursivamente si existe
    if (backendField.fieldGroup && backendField.fieldGroup.length > 0) {
      formlyField.fieldGroup = this.convertBackendFieldsToFormly(backendField.fieldGroup);
    }

    // Limpiar propiedades undefined del campo principal
    Object.keys(formlyField).forEach((key) => {
      if (formlyField[key as keyof FormlyFieldConfig] === undefined) {
        delete formlyField[key as keyof FormlyFieldConfig];
      }
    });

    return formlyField;
  }

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
    const props = field.props || {};

    // Detectar validaciones comunes
    if (props['required']) {
      validations.push('required');
    }

    if (props['minLength']) {
      validations.push('minlength');
    }

    if (props['maxLength']) {
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
