import { FormlyFieldConfig } from '@ngx-formly/core';

export interface FormDefinitionResponse {
  formName: string;
  fields: FormlyFieldConfig[];
}
