import { FormlyFieldConfig } from '@ngx-formly/core';

export interface FormDefinitionResponse {
  id?: string;                    // ID del formulario (opcional por ahora)
  formName: string;
  version?: number;               // Versión del formulario (opcional por ahora)
  fields: FormlyFieldConfig[];
}
