import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, finalize, of, delay, tap } from 'rxjs';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { FormDefinitionResponse } from '../models/form-definition.interface';
import { FormFieldProcessorService } from '../../../shared/formly/form-field-processor.service';
import { MOCK_FORM_DEFINITION } from '../mock-data/form-definitions.mock';

/**
 * 🔄 Servicio con RxJS (BehaviorSubject + Observables) - Mejorado
 *
 * Este servicio es equivalente a FormDefinitionStore pero usa RxJS
 * en lugar de Signals para gestionar el estado.
 *
 * Mejoras implementadas:
 * ✅ Timestamp de última actualización
 * ✅ Observables derivados (hasData$, hasError$, isReady$, fieldCount$)
 * ✅ Métodos útiles: retry(), reset(), getFieldByKey(), updateField()
 * ✅ Estadísticas del formulario
 * ✅ Manejo robusto de errores
 */
@Injectable({ providedIn: 'root' })
export class FormDefinitionRxjsService {
  private apiUrl = 'https://localhost:7261/api/DynamicForm/get-form-definition';
  private http = inject(HttpClient);
  private fieldProcessor = inject(FormFieldProcessorService);

  // 📦 Estado privado con BehaviorSubjects
  private _formName$ = new BehaviorSubject<string | null>(null);
  private _fields$ = new BehaviorSubject<FormlyFieldConfig[]>([]);
  private _loading$ = new BehaviorSubject<boolean>(false);
  private _error$ = new BehaviorSubject<string | null>(null);
  private _lastUpdated$ = new BehaviorSubject<Date | null>(null);

  // 📤 Exposición pública como Observables (read-only)
  public readonly formName$: Observable<string | null> = this._formName$.asObservable();
  public readonly fields$: Observable<FormlyFieldConfig[]> = this._fields$.asObservable();
  public readonly loading$: Observable<boolean> = this._loading$.asObservable();
  public readonly error$: Observable<string | null> = this._error$.asObservable();
  public readonly lastUpdated$: Observable<Date | null> = this._lastUpdated$.asObservable();

  // 🧮 Observables derivados (equivalente a computed signals)
  public readonly hasData$: Observable<boolean> = this.fields$.pipe(
    map(fields => fields.length > 0)
  );

  public readonly isEmpty$: Observable<boolean> = this.fields$.pipe(
    map(fields => fields.length === 0)
  );

  public readonly hasError$: Observable<boolean> = this.error$.pipe(
    map(error => error !== null)
  );

  public readonly isReady$: Observable<boolean> = new Observable(observer => {
    const subscription = this.loading$.subscribe(loading => {
      const fields = this._fields$.value;
      const error = this._error$.value;
      observer.next(!loading && fields.length > 0 && !error);
    });
    return () => subscription.unsubscribe();
  });

  public readonly fieldCount$: Observable<number> = this.fields$.pipe(
    map(fields => this.countAllFields(fields))
  );

  // 📊 Estadísticas del formulario
  public readonly formStats$: Observable<{
    total: number;
    required: number;
    optional: number;
    types: string[];
  }> = this.fields$.pipe(
    map(fields => {
      const allFields = this.getAllFieldsRecursive(fields);
      return {
        total: allFields.length,
        required: allFields.filter(f => f.props?.required).length,
        optional: allFields.filter(f => !f.props?.required).length,
        types: [...new Set(allFields.map(f => f.type).filter(t => typeof t === 'string'))] as string[],
      };
    })
  );

  // 🎯 Getters para acceso sincrónico (opcional)
  get formName(): string | null {
    return this._formName$.value;
  }

  get fields(): FormlyFieldConfig[] {
    return this._fields$.value;
  }

  get loading(): boolean {
    return this._loading$.value;
  }

  get error(): string | null {
    return this._error$.value;
  }

  /**
   * 🔄 Carga la definición del formulario desde el servidor (RxJS style)
   * Los mensajes de validación se agregan automáticamente
   */
  loadFormDefinition(): void {
    this._loading$.next(true);
    this._error$.next(null);

    this.http.get<FormDefinitionResponse>(this.apiUrl)
      .pipe(
        // Procesar los campos
        map(form => ({
          formName: form.formName,
          fields: this.fieldProcessor.processFields(form.fields)
        })),
        // Actualizar el estado
        tap(result => {
          this._formName$.next(result.formName);
          this._fields$.next(result.fields);
          this._lastUpdated$.next(new Date());
        }),
        // Manejar errores
        catchError(err => {
          console.error('❌ Error al cargar el formulario:', err);
          this._error$.next(
            err.status === 0
              ? 'No se pudo conectar al servidor. Verifique su conexión.'
              : `Error al cargar el formulario (${err.status})`
          );
          return of(null);
        }),
        // Finalizar (se ejecuta siempre)
        finalize(() => this._loading$.next(false))
      )
      .subscribe();
  }

  /**
   * 🔄 Versión alternativa que retorna un Observable (más idiomático en RxJS)
   * Útil si quieres encadenar operaciones o hacer múltiples suscripciones
   */
  loadFormDefinition$(): Observable<FormDefinitionResponse | null> {
    this._loading$.next(true);
    this._error$.next(null);

    return this.http.get<FormDefinitionResponse>(this.apiUrl).pipe(
      // Procesar los campos
      map(form => ({
        formName: form.formName,
        fields: this.fieldProcessor.processFields(form.fields)
      })),
      // Actualizar el estado
      tap(result => {
        this._formName$.next(result.formName);
        this._fields$.next(result.fields);
      }),
      // Manejar errores
      catchError(err => {
        console.error('Error al cargar el formulario:', err);
        this._error$.next('Error al cargar el formulario. Por favor, intente de nuevo.');
        return of(null);
      }),
      // Finalizar
      finalize(() => this._loading$.next(false))
    );
  }

  /**
   * 🧪 MODO DESARROLLO: Usa datos mock en lugar del servidor
   */
  loadFormDefinitionMock(): void {
    this._loading$.next(true);
    this._error$.next(null);

    of(MOCK_FORM_DEFINITION)
      .pipe(
        delay(1000), // Simula latencia de red
        map(form => ({
          formName: form.formName,
          fields: this.fieldProcessor.processFields(form.fields)
        })),
        tap(result => {
          this._formName$.next(result.formName);
          this._fields$.next(result.fields);
          this._lastUpdated$.next(new Date());
        }),
        catchError(err => {
          this._error$.next('Error al cargar datos mock');
          return of(null);
        }),
        finalize(() => this._loading$.next(false))
      )
      .subscribe();
  }

  /**
   * 🔄 Reintentar después de un error
   */
  retry(): void {
    if (!this._loading$.value) {
      this.loadFormDefinition();
    }
  }

  /**
   * 🔄 Limpia el estado del servicio
   */
  reset(): void {
    this._formName$.next(null);
    this._fields$.next([]);
    this._loading$.next(false);
    this._error$.next(null);
    this._lastUpdated$.next(null);
  }

  /**
   * 🔍 Buscar un campo por key
   */
  getFieldByKey(key: string): FormlyFieldConfig | undefined {
    return this._fields$.value.find(f => f.key === key);
  }

  /**
   * ✏️ Actualizar un campo específico (útil para formularios dinámicos)
   */
  updateField(key: string, updates: Partial<FormlyFieldConfig>): void {
    const fields = this._fields$.value;
    const index = fields.findIndex(f => f.key === key);

    if (index !== -1) {
      const updatedFields = [...fields];
      updatedFields[index] = { ...updatedFields[index], ...updates };
      this._fields$.next(updatedFields);
    }
  }

  /**
   * 🎨 Ejemplo de operaciones avanzadas con RxJS
   * Combina múltiples observables para crear vistas derivadas
   */
  get formState$(): Observable<{
    formName: string | null;
    fields: FormlyFieldConfig[];
    loading: boolean;
    error: string | null;
    hasData: boolean;
  }> {
    // combineLatest emite cuando cualquiera de los observables cambia
    return new Observable(observer => {
      // Implementación manual para mantenerlo simple
      const subscription = this.fields$.subscribe(fields => {
        observer.next({
          formName: this.formName,
          fields: fields,
          loading: this.loading,
          error: this.error,
          hasData: fields.length > 0
        });
      });

      return () => subscription.unsubscribe();
    });
  }

  /**
   * 💾 Guarda los datos del formulario en el servidor
   * Ejemplo de cómo manejar POST con RxJS
   */
  submitFormData(data: any): Observable<any> {
    this._loading$.next(true);

    return this.http.post(`${this.apiUrl}/submit`, data).pipe(
      tap(response => {
        console.log('✅ Formulario enviado exitosamente', response);
      }),
      catchError(err => {
        console.error('❌ Error al enviar formulario:', err);
        this._error$.next('Error al enviar el formulario');
        throw err; // Re-lanza el error para que el componente pueda manejarlo
      }),
      finalize(() => this._loading$.next(false))
    );
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
