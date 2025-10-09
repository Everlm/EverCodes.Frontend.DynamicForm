import { FormlyFieldConfig } from '@ngx-formly/core';

export interface FormDefinitionResponse {
  id?: string;
  formName: string;
  version?: number;              
  fields: FormlyFieldConfig[];
}
