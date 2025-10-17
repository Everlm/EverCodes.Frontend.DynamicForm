import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { FormlyFormResponse } from '../models/form-definition.interface';
import { FormFieldProcessorService } from '../../../shared/formly/form-field-processor.service';
import { delay, of, tap, catchError, map, finalize } from 'rxjs';

// Store con Signals
@Injectable({ providedIn: 'root' })
export class FormDefinitionStore {
  private apiUrl = 'http://localhost:5059/api/dynamic-forms/sample';
  private http = inject(HttpClient);
  private fieldProcessor = inject(FormFieldProcessorService);

  // Signals privados (solo escritura interna)
  private _formName = signal<string | null>(null);
  private _fields = signal<FormlyFieldConfig[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);
  private _lastUpdated = signal<Date | null>(null);
  private _formDefinitionId = signal<string | null>(null);
  private _version = signal<number>(1);

  // Exposición pública readonly
  readonly formName = this._formName.asReadonly();
  readonly fields = this._fields.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly lastUpdated = this._lastUpdated.asReadonly();
  readonly formDefinitionId = this._formDefinitionId.asReadonly();
  readonly version = this._version.asReadonly();

  // Computed Signals (estados derivados reactivos)
  readonly hasData = computed(() => this._fields().length > 0);
  readonly isEmpty = computed(() => this._fields().length === 0);
  readonly hasError = computed(() => this._error() !== null);
  readonly isReady = computed(() => !this._loading() && this.hasData() && !this.hasError());
  readonly fieldCount = computed(() => this.countAllFields(this._fields()));

  // Estado consolidado (útil para debugging y UI compleja)
  readonly formState = computed(() => ({
    id: this._formDefinitionId(),
    version: this._version(),
    name: this._formName(),
    fieldCount: this.fieldCount(),
    isLoading: this._loading(),
    hasError: this.hasError(),
    errorMessage: this._error(),
    isReady: this.isReady(),
    lastUpdated: this._lastUpdated(),
  }));

  // Estadísticas del formulario
  readonly formStats = computed(() => {
    const allFields = this.getAllFieldsRecursive(this._fields());
    return {
      total: allFields.length,
      required: allFields.filter((f) => f.props?.required).length,
      optional: allFields.filter((f) => !f.props?.required).length,
      types: [
        ...new Set(allFields.map((f) => f.type).filter((t): t is string => typeof t === 'string')),
      ],
    };
  });

  // Carga la definición del formulario desde el servidor
  loadFormDefinition$() {
    this._loading.set(true);
    this._error.set(null);

    return this.http.get<FormlyFormResponse>(this.apiUrl).pipe(
      map((response) => {
        const formlyFields = this.fieldProcessor.convertBackendFieldsToFormly(response.fields);
        const processedFields = this.fieldProcessor.processFields(formlyFields);

        return {
          id: response.id,
          name: response.name,
          description: response.description,
          fields: processedFields,
        };
      }),
      tap((result) => {
        this._formDefinitionId.set(result.id || null);
        this._version.set(1);
        this._formName.set(result.name);
        this._fields.set(result.fields);
        this._lastUpdated.set(new Date());
      }),
      catchError((err) => {
        console.error('Error al cargar el formulario:', err);
        this._error.set(
          err.status === 0
            ? 'No se pudo conectar al servidor. Verifique su conexión.'
            : `Error al cargar el formulario (${err.status})`
        );
        return of(null);
      }),
      finalize(() => this._loading.set(false))
    );
  }

  // Reintentar después de un error
  retry$() {
    if (!this._loading()) {
      return this.loadFormDefinition$();
    }
    return of(null);
  }

  // Reset completo del estado
  reset(): void {
    this._formName.set(null);
    this._fields.set([]);
    this._loading.set(false);
    this._error.set(null);
    this._lastUpdated.set(null);
    this._formDefinitionId.set(null);
    this._version.set(1);
  }

  // Buscar un campo por key
  getFieldByKey(key: string): FormlyFieldConfig | undefined {
    return this._fields().find((f) => f.key === key);
  }

  // Actualizar un campo específico
  updateField(key: string, updates: Partial<FormlyFieldConfig>): void {
    const fields = this._fields();
    const index = fields.findIndex((f) => f.key === key);

    if (index !== -1) {
      const updatedFields = [...fields];
      updatedFields[index] = { ...updatedFields[index], ...updates };
      this._fields.set(updatedFields);
    }
  }

  // Cuenta todos los campos recursivamente
  private countAllFields(fields: FormlyFieldConfig[]): number {
    let count = 0;

    for (const field of fields) {
      if (field.fieldGroup && field.fieldGroup.length > 0) {
        count += this.countAllFields(field.fieldGroup);
      } else if (field.key) {
        count++;
      }
    }

    return count;
  }

  //  Obtiene todos los campos recursivamente
  private getAllFieldsRecursive(fields: FormlyFieldConfig[]): FormlyFieldConfig[] {
    const allFields: FormlyFieldConfig[] = [];

    for (const field of fields) {
      if (field.fieldGroup && field.fieldGroup.length > 0) {
        allFields.push(...this.getAllFieldsRecursive(field.fieldGroup));
      } else if (field.key) {
        allFields.push(field);
      }
    }

    return allFields;
  }
}
