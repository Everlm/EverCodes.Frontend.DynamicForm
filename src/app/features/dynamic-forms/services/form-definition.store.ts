import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { FormDefinitionResponse } from '../models/form-definition.interface';

@Injectable({ providedIn: 'root' })
export class FormDefinitionStore {
  private apiUrl = 'https://localhost:7261/api/DynamicForm/get-form-definition';

  formName = signal<string | null>(null);
  fields = signal<FormlyFieldConfig[]>([]);
  loading = signal(false);

  constructor(private http: HttpClient) {}

  loadFormDefinition() {
    this.loading.set(true);
    this.http.get<FormDefinitionResponse>(this.apiUrl).subscribe({
      next: (form) => {
        this.formName.set(form.formName);
        this.fields.set(form.fields);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
