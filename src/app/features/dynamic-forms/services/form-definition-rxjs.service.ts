import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, finalize, of, delay, tap } from 'rxjs';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { FormDefinitionResponse } from '../models/form-definition.interface';
import { FormFieldProcessorService } from '../../../shared/formly/form-field-processor.service';
import { MOCK_FORM_DEFINITION } from '../mock-data/form-definitions.mock';

/**
 * 🔄 Servicio con RxJS (BehaviorSubject + Observables)
 *
 * Este servicio es equivalente a FormDefinitionStore pero usa RxJS
 * en lugar de Signals para gestionar el estado.
 *
 * Compáralo con FormDefinitionStore para ver las diferencias entre:
 * - Signals (moderno, simple, reactivo)
 * - RxJS (tradicional, poderoso, con operadores)
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

  // 📤 Exposición pública como Observables (read-only)
  public readonly formName$: Observable<string | null> = this._formName$.asObservable();
  public readonly fields$: Observable<FormlyFieldConfig[]> = this._fields$.asObservable();
  public readonly loading$: Observable<boolean> = this._loading$.asObservable();
  public readonly error$: Observable<string | null> = this._error$.asObservable();

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
        // Manejar errores
        catchError(err => {
          console.error('Error al cargar el formulario:', err);
          this._error$.next('Error al cargar el formulario. Por favor, intente de nuevo.');
          return of(null);
        }),
        // Finalizar (se ejecuta siempre)
        finalize(() => this._loading$.next(false))
      )
      .subscribe(result => {
        if (result) {
          this._formName$.next(result.formName);
          this._fields$.next(result.fields);
        }
      });
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
        catchError(err => {
          this._error$.next('Error al cargar datos mock');
          return of(null);
        }),
        finalize(() => this._loading$.next(false))
      )
      .subscribe(result => {
        if (result) {
          this._formName$.next(result.formName);
          this._fields$.next(result.fields);
        }
      });
  }

  /**
   * 🔄 Limpia el estado del servicio
   */
  reset(): void {
    this._formName$.next(null);
    this._fields$.next([]);
    this._loading$.next(false);
    this._error$.next(null);
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
}
