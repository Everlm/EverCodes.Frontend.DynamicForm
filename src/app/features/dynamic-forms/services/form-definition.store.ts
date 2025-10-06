import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { FormDefinitionResponse } from '../models/form-definition.interface';
import { FormFieldProcessorService } from '../../../shared/formly/form-field-processor.service';
import { MOCK_FORM_DEFINITION } from '../mock-data/form-definitions.mock';
import { delay, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FormDefinitionStore {
  private apiUrl = 'https://localhost:7261/api/DynamicForm/get-form-definition';
  private http = inject(HttpClient);
  private fieldProcessor = inject(FormFieldProcessorService);

  formName = signal<string | null>(null);
  fields = signal<FormlyFieldConfig[]>([]);
  loading = signal(false);

  /**
   * Carga la definición del formulario desde el servidor
   * Los mensajes de validación se agregan automáticamente
   */
  loadFormDefinition() {
    this.loading.set(true);
    this.http.get<FormDefinitionResponse>(this.apiUrl).subscribe({
      next: (form) => {
        this.formName.set(form.formName);

        // Procesar los campos para agregar mensajes de validación automáticamente
        const processedFields = this.fieldProcessor.processFields(form.fields);
        this.fields.set(processedFields);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar el formulario:', err);
        this.loading.set(false);
      },
    });
  }

  /**
   * 🧪 MODO DESARROLLO: Usa datos mock en lugar del servidor
   * Útil para desarrollo sin necesidad de tener el backend corriendo
   * Descomenta el import de MOCK_FORM_DEFINITION arriba para usar esto
   */
  loadFormDefinitionMock() {
    this.loading.set(true);
    // Simula un delay de red
    of(MOCK_FORM_DEFINITION)
      .pipe(delay(1000))
      .subscribe({
        next: (form) => {
          this.formName.set(form.formName);
          const processedFields = this.fieldProcessor.processFields(form.fields);
          this.fields.set(processedFields);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }
}
