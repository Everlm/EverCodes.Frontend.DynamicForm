
export interface FormlyFormResponse {
  id: string;
  name: string;
  description: string;
  fields: FormlyFieldConfigResponse[];
}

export interface FormlyFieldValidationResponse {
  id: string;
  formlyFieldConfigId: string;
  name: string;
  messages: { [key: string]: string };
  show: boolean;
  formlyFieldConfig: any;
}

export interface FormlyFieldConfigResponse {
  id: string;
  parentId: string | null;
  formlyFormId: string;
  key: string;
  type: string;
  defaultValue: any;
  name: string;
  className: string;
  fieldGroupClassName: string;
  template: string;
  hide: boolean;
  resetOnHide: boolean;
  focus: boolean;
  validation: FormlyFieldValidationResponse | null;
  validator: any;
  props: FormlyFieldPropsResponse | null;
  formlyForm: any;
  formlyFieldConfigParent: any;
  fieldGroup: FormlyFieldConfigResponse[];
  wrappers: string[];
}

export interface FormlyFieldPropsResponse {
  id: string;
  formlyFieldConfigId: string;
  type: string;
  label: string;
  placeholder: string;
  disabled: boolean;
  rows: number;
  cols: number;
  description: string;
  hidden: boolean;
  max: number;
  min: number;
  minLength: number;
  maxLength: number;
  pattern: string;
  required: boolean;
  tabindex: number;
  readonly: boolean;
  step: number;
  appearance: string;
  attributes: any;
  additionalProperties: any;
  formlyFieldConfig: any;
  options: FormlyFieldOptionResponse[];
}

export interface FormlyFieldOptionResponse {
  id: string;
  formlyFieldPropId: string;
  value: string;
  label: string;
  formlyFieldProp: any;
}
