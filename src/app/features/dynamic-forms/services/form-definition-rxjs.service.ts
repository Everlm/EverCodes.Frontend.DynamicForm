import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, finalize, of, delay, tap } from 'rxjs';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { FormlyFormResponse } from '../models/form-definition.interface';
import { FormFieldProcessorService } from '../../../shared/formly/form-field-processor.service';

/**
 * Servicio con RxJS (BehaviorSubject + Observables)
 *
 * Este servicio es equivalente a FormDefinitionStore pero usa RxJS
 * en lugar de Signals para gestionar el estado.
 */
@Injectable({ providedIn: 'root' })
export class FormDefinitionRxjsService {
  private apiUrl = 'https://localhost:7261/api/dynamic-forms/sample';
  private http = inject(HttpClient);
  private fieldProcessor = inject(FormFieldProcessorService);

  // Estado privado con BehaviorSubjects
  private _formName$ = new BehaviorSubject<string | null>(null);
  private _fields$ = new BehaviorSubject<FormlyFieldConfig[]>([]);
  private _loading$ = new BehaviorSubject<boolean>(false);
  private _error$ = new BehaviorSubject<string | null>(null);
  private _lastUpdated$ = new BehaviorSubject<Date | null>(null);

  // Exposición pública como Observables (read-only)
  public readonly formName$: Observable<string | null> = this._formName$.asObservable();
  public readonly fields$: Observable<FormlyFieldConfig[]> = this._fields$.asObservable();
  public readonly loading$: Observable<boolean> = this._loading$.asObservable();
  public readonly error$: Observable<string | null> = this._error$.asObservable();
  public readonly lastUpdated$: Observable<Date | null> = this._lastUpdated$.asObservable();

  // Observables derivados (equivalente a computed signals)
  public readonly hasData$: Observable<boolean> = this.fields$.pipe(
    map((fields) => fields.length > 0)
  );

  public readonly isEmpty$: Observable<boolean> = this.fields$.pipe(
    map((fields) => fields.length === 0)
  );

  public readonly hasError$: Observable<boolean> = this.error$.pipe(map((error) => error !== null));

  public readonly isReady$: Observable<boolean> = new Observable((observer) => {
    const subscription = this.loading$.subscribe((loading) => {
      const fields = this._fields$.value;
      const error = this._error$.value;
      observer.next(!loading && fields.length > 0 && !error);
    });
    return () => subscription.unsubscribe();
  });

  public readonly fieldCount$: Observable<number> = this.fields$.pipe(
    map((fields) => this.countAllFields(fields))
  );

  // Estadísticas del formulario
  public readonly formStats$: Observable<{
    total: number;
    required: number;
    optional: number;
    types: string[];
  }> = this.fields$.pipe(
    map((fields) => {
      const allFields = this.getAllFieldsRecursive(fields);
      return {
        total: allFields.length,
        required: allFields.filter((f) => f.props?.required).length,
        optional: allFields.filter((f) => !f.props?.required).length,
        types: [
          ...new Set(allFields.map((f) => f.type).filter((t) => typeof t === 'string')),
        ] as string[],
      };
    })
  );

  // Getters para acceso sincrónico
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

  // Observable que emite la definición del formulario
  loadFormDefinition$(): Observable<FormlyFormResponse | null> {
    this._loading$.next(true);
    this._error$.next(null);
    return this.http.get<FormlyFormResponse>(this.apiUrl).pipe(
      // Transforma los valores del stream
      map((response) => {
        const formlyFields = this.fieldProcessor.convertBackendFieldsToFormly(response.fields);
        const processedFields = this.fieldProcessor.processFields(formlyFields);

        return {
          id: response.id,
          name: response.name,
          description: response.description,
          fields: response.fields,
        };
      }),
      // Efectos secundarios para actualizar el estado
      tap((result) => {
        // Guardar el nombre del formulario
        this._formName$.next(result.name);
        // Convertir y procesar los campos
        const formlyFields = this.fieldProcessor.convertBackendFieldsToFormly(result.fields);
        const processedFields = this.fieldProcessor.processFields(formlyFields);
        this._fields$.next(processedFields);
        this._lastUpdated$.next(new Date());
      }),
      // Manejo de errores
      catchError((err) => {
        console.error('Error al cargar el formulario:', err);
        this._error$.next(
          err.status === 0
            ? 'No se pudo conectar al servidor. Verifique su conexión.'
            : `Error al cargar el formulario (${err.status})`
        );
        return of(null);
      }),
      // Finaliza el loading sin importar éxito o error
      finalize(() => this._loading$.next(false))
    );
  }

  // Reintentar después de un error
  retry(): void {
    if (!this._loading$.value) {
      this.loadFormDefinition$().subscribe();
    }
  }

  // Limpia el estado del servicio
  reset(): void {
    this._formName$.next(null);
    this._fields$.next([]);
    this._loading$.next(false);
    this._error$.next(null);
    this._lastUpdated$.next(null);
  }

  // Buscar un campo por key
  getFieldByKey(key: string): FormlyFieldConfig | undefined {
    return this._fields$.value.find((f) => f.key === key);
  }

  // Actualizar un campo específico (útil para formularios dinámicos)
  updateField(key: string, updates: Partial<FormlyFieldConfig>): void {
    const fields = this._fields$.value;
    const index = fields.findIndex((f) => f.key === key);
    if (index !== -1) {
      const updatedFields = [...fields];
      updatedFields[index] = { ...updatedFields[index], ...updates };
      this._fields$.next(updatedFields);
    }
  }

  // Combina múltiples observables para crear vistas derivadas
  get formState$(): Observable<{
    formName: string | null;
    fields: FormlyFieldConfig[];
    loading: boolean;
    error: string | null;
    hasData: boolean;
  }> {
    return new Observable((observer) => {
      const subscription = this.fields$.subscribe((fields) => {
        observer.next({
          formName: this.formName,
          fields: fields,
          loading: this.loading,
          error: this.error,
          hasData: fields.length > 0,
        });
      });
      return () => subscription.unsubscribe();
    });
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

  // Obtiene todos los campos recursivamente
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
