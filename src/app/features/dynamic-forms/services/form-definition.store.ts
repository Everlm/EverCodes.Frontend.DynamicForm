import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { FormDefinitionResponse } from '../models/form-definition.interface';
import { FormFieldProcessorService } from '../../../shared/formly/form-field-processor.service';
import { MOCK_FORM_DEFINITION } from '../mock-data/form-definitions.mock';
import { delay, of, tap, catchError, map, finalize } from 'rxjs';

/**
 * 🎯 Store con Signals - Angular 20 (Buenas Prácticas)
 *
 * Mejoras implementadas:
 * ✅ Signals privados con exposición readonly (encapsulación)
 * ✅ Computed signals para estados derivados
 * ✅ Manejo robusto de errores con signal
 * ✅ Timestamp de última actualización
 * ✅ Métodos útiles: retry(), reset(), getFieldByKey()
 * ✅ Estadísticas del formulario
 */
@Injectable({ providedIn: 'root' })
export class FormDefinitionStore {
  private apiUrl = 'https://localhost:7261/api/DynamicForm/get-form-definition';
  private http = inject(HttpClient);
  private fieldProcessor = inject(FormFieldProcessorService);

  // 🔒 Signals privados (solo escritura interna)
  private _formName = signal<string | null>(null);
  private _fields = signal<FormlyFieldConfig[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);
  private _lastUpdated = signal<Date | null>(null);
  private _formDefinitionId = signal<string | null>(null);
  private _version = signal<number>(1);

  // 📤 Exposición pública readonly (buena práctica)
  readonly formName = this._formName.asReadonly();
  readonly fields = this._fields.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly lastUpdated = this._lastUpdated.asReadonly();
  readonly formDefinitionId = this._formDefinitionId.asReadonly();
  readonly version = this._version.asReadonly();

  // 🧮 Computed Signals (estados derivados reactivos)
  readonly hasData = computed(() => this._fields().length > 0);
  readonly isEmpty = computed(() => this._fields().length === 0);
  readonly hasError = computed(() => this._error() !== null);
  readonly isReady = computed(() => !this._loading() && this.hasData() && !this.hasError());
  readonly fieldCount = computed(() => this.countAllFields(this._fields()));

  // 📊 Estado consolidado (útil para debugging y UI compleja)
  readonly formState = computed(() => ({
    id: this._formDefinitionId(),
    version: this._version(),
    name: this._formName(),
    fieldCount: this.fieldCount(),
    isLoading: this._loading(),
    hasError: this.hasError(),
    errorMessage: this._error(),
    isReady: this.isReady(),
    lastUpdated: this._lastUpdated()
  }));

  // 📊 Estadísticas del formulario
  readonly formStats = computed(() => {
    const allFields = this.getAllFieldsRecursive(this._fields());
    return {
      total: allFields.length,
      required: allFields.filter(f => f.props?.required).length,
      optional: allFields.filter(f => !f.props?.required).length,
      types: [...new Set(allFields.map(f => f.type).filter((t): t is string => typeof t === 'string'))],
    };
  });

  /**
   * 🔄 Carga la definición del formulario desde el servidor
   * Los mensajes de validación se agregan automáticamente
   */
  loadFormDefinition(): void {
    this._loading.set(true);
    this._error.set(null);

    this.http.get<FormDefinitionResponse>(this.apiUrl).pipe(
      map(form => ({
        id: form.id,
        version: form.version || 1,
        formName: form.formName,
        fields: this.fieldProcessor.processFields(form.fields)
      })),
      tap(result => {
        this._formDefinitionId.set(result.id || null);
        this._version.set(result.version);
        this._formName.set(result.formName);
        this._fields.set(result.fields);
        this._lastUpdated.set(new Date());
      }),
      catchError(err => {
        console.error('❌ Error al cargar el formulario:', err);
        this._error.set(
          err.status === 0
            ? 'No se pudo conectar al servidor. Verifique su conexión.'
            : `Error al cargar el formulario (${err.status})`
        );
        return of(null);
      }),
      finalize(() => this._loading.set(false))
    ).subscribe();
  }

  /**
   * 🧪 MODO DESARROLLO: Usa datos mock en lugar del servidor
   * Útil para desarrollo sin necesidad de tener el backend corriendo
   */
  loadFormDefinitionMock(): void {
    this._loading.set(true);
    this._error.set(null);

    of(MOCK_FORM_DEFINITION).pipe(
      delay(1000),
      map(form => ({
        id: form.id,
        version: form.version || 1,
        formName: form.formName,
        fields: this.fieldProcessor.processFields(form.fields)
      })),
      tap(result => {
        this._formDefinitionId.set(result.id || null);
        this._version.set(result.version);
        this._formName.set(result.formName);
        this._fields.set(result.fields);
        this._lastUpdated.set(new Date());
      }),
      catchError(err => {
        this._error.set('Error al cargar datos mock');
        return of(null);
      }),
      finalize(() => this._loading.set(false))
    ).subscribe();
  }

  /**
   * 🔄 Reintentar después de un error
   */
  retry(): void {
    if (!this._loading()) {
      this.loadFormDefinition();
    }
  }

  /**
   * 🧹 Reset completo del estado
   */
  reset(): void {
    this._formName.set(null);
    this._fields.set([]);
    this._loading.set(false);
    this._error.set(null);
    this._lastUpdated.set(null);
    this._formDefinitionId.set(null);
    this._version.set(1);
  }

  /**
   * 🔍 Buscar un campo por key
   */
  getFieldByKey(key: string): FormlyFieldConfig | undefined {
    return this._fields().find(f => f.key === key);
  }

  /**
   * ✏️ Actualizar un campo específico (útil para formularios dinámicos)
   */
  updateField(key: string, updates: Partial<FormlyFieldConfig>): void {
    const fields = this._fields();
    const index = fields.findIndex(f => f.key === key);

    if (index !== -1) {
      const updatedFields = [...fields];
      updatedFields[index] = { ...updatedFields[index], ...updates };
      this._fields.set(updatedFields);
    }
  }

  /**
   * 🔢 Cuenta todos los campos recursivamente (incluyendo los dentro de fieldGroups)
   * @param fields Array de campos de Formly
   * @returns Número total de campos con key (campos reales)
   */
  private countAllFields(fields: FormlyFieldConfig[]): number {
    let count = 0;

    for (const field of fields) {
      // Si tiene fieldGroup, contar los campos internos recursivamente
      if (field.fieldGroup && field.fieldGroup.length > 0) {
        count += this.countAllFields(field.fieldGroup);
      }
      // Si tiene key (es un campo real), contarlo
      else if (field.key) {
        count++;
      }
    }

    return count;
  }

  /**
   * 📦 Obtiene todos los campos recursivamente (incluyendo los de fieldGroups)
   * @param fields Array de campos de Formly
   * @returns Array plano con todos los campos reales (que tienen key)
   */
  private getAllFieldsRecursive(fields: FormlyFieldConfig[]): FormlyFieldConfig[] {
    const allFields: FormlyFieldConfig[] = [];

    for (const field of fields) {
      // Si tiene fieldGroup, obtener los campos internos recursivamente
      if (field.fieldGroup && field.fieldGroup.length > 0) {
        allFields.push(...this.getAllFieldsRecursive(field.fieldGroup));
      }
      // Si tiene key (es un campo real), agregarlo
      else if (field.key) {
        allFields.push(field);
      }
    }

    return allFields;
  }
}
