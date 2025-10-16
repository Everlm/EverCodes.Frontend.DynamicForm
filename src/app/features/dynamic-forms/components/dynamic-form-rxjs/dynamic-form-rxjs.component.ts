import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormlyModule, FormlyFieldConfig } from '@ngx-formly/core';
import { MatButtonModule } from '@angular/material/button';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Subject, takeUntil, BehaviorSubject, combineLatest, map, delay } from 'rxjs';
import { FormDefinitionRxjsService } from '../../services/form-definition-rxjs.service';

/**
 * Componente que usa RxJS Service
 *
 * Este componente demuestra el uso de RxJS con BehaviorSubject y Observables
 * para gestionar el estado del formulario dinámico.
 *
 * Compáralo con DynamicFormComponent para ver las diferencias entre Signals y RxJS.
 */
@Component({
  selector: 'app-dynamic-form-rxjs',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormlyModule,
    FormlyMaterialModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatFormFieldModule,
  ],
  templateUrl: './dynamic-form-rxjs.component.html',
  styleUrls: ['./dynamic-form-rxjs.component.scss'],
})
export class DynamicFormRxjsComponent implements OnInit, OnDestroy {
  private service = inject(FormDefinitionRxjsService);
  private destroy$ = new Subject<void>();

  // Subject para controlar el delay mínimo de visualización del loading
  private minimumLoadingTime = 800;
  private showLoading$ = new BehaviorSubject<boolean>(true);

  //form state
  form = new FormGroup({});
  model: any = {};

  // Observable combinado que mantiene el loading visible por el tiempo mínimo
  loading$ = combineLatest([this.service.loading$, this.showLoading$]).pipe(
    map(([serviceLoading, minimumLoading]) => serviceLoading || minimumLoading)
  );

  //Observables
  formName$ = this.service.formName$;
  fields$ = this.service.fields$;
  error$ = this.service.error$;
  lastUpdated$ = this.service.lastUpdated$;
  hasData$ = this.service.hasData$;
  hasError$ = this.service.hasError$;
  isReady$ = this.service.isReady$;
  fieldCount$ = this.service.fieldCount$;
  formStats$ = this.service.formStats$;

  // Trabajar con valores síncronos
  // formName: string | null = null;
  // fields: FormlyFieldConfig[] = [];
  // loading = false;

  //Hooks
  ngOnInit(): void {
    this.loadFormData();
    setTimeout(() => {
      this.showLoading$.next(false);
    }, this.minimumLoadingTime);

    // Imprimir los fields cuando cambien
    this.fields$.pipe(takeUntil(this.destroy$)).subscribe((fields) => {
      console.log('📋 Fields recibidos:', fields);
      console.log('📋 Fields JSON:', JSON.stringify(fields, null, 2));
    });
  }

  ngOnDestroy(): void {
    this.cleanupSubscriptions();
    this.showLoading$.complete();
  }

  //Metodos
  retry(): void {
    this.service.retry();
  }

  //Maneja el envío del formulario
  submit(): void {
    if (this.form.invalid) {
      this.markFormAsTouched();
      this.logValidationErrors();
    } else {
      this.submitFormData();
    }
  }

  //Carga los datos del formulario desde el servidor
  private loadFormData(): void {
    //Cargar desde el servidor
    this.service
      .loadFormDefinition$()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          if (result) {
            console.log('Formulario cargado:', result.name);
          }
        },
        error: (err) => {
          console.error('Error en componente:', err);
        },
      });

    // Cargar desde un mock de datos
    // this.service.loadFormDefinitionMock$()
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe();
  }

  /**
   * Marca todos los campos del formulario como touched
   * para mostrar los mensajes de validación
   */
  private markFormAsTouched(): void {
    Object.keys(this.form.controls).forEach((key) => {
      const control = this.form.get(key);
      control?.markAsTouched();
      control?.updateValueAndValidity();
    });
  }

  /**
   * Registra los errores de validación en la consola
   */
  private logValidationErrors(): void {
    console.log('Formulario inválido');
    console.log('Errores del formulario:', this.form.errors);

    // Mostrar errores de cada campo
    Object.keys(this.form.controls).forEach((key) => {
      const control = this.form.get(key);
      if (control?.errors) {
        console.log(`Campo "${key}":`, control.errors);
      }
    });
  }

  //Envía los datos del formulario al servidor
  private submitFormData(): void {
    console.log('Formulario enviado');

    this.formName$.pipe(takeUntil(this.destroy$)).subscribe((formName) => {
      console.log('Nombre del formulario:', formName);
    });

    console.log('Datos del formulario (JSON):');
    console.log(JSON.stringify(this.model, null, 2));

    // Mostrar estadísticas del formulario
    this.formStats$.pipe(takeUntil(this.destroy$)).subscribe((stats) => {
      console.log('Estadísticas del formulario:', stats);
    });

    console.table(this.model);

    // this.service
    //   .submitFormData(this.model)
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe({
    //     next: (response) => this.handleSubmitSuccess(response),
    //     error: (err) => this.handleSubmitError(err),
    //   });
  }

  //Limpia todas las suscripciones activas
  private cleanupSubscriptions(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  //MANUAL SUBSCRIPTION

  /**
   * Ejemplo de suscripción manual a los observables
   * Útil si necesitas transformar o procesar los datos antes de usarlos
   *
   * Solo usar si realmente lo necesitas - el async pipe es mejor
   */
  private subscribeToFormState(): void {
    // Suscribirse al nombre del formulario
    this.service.formName$.pipe(takeUntil(this.destroy$)).subscribe((name) => {
      console.log('FormName changed:', name);
    });

    // Suscribirse a los campos
    this.service.fields$.pipe(takeUntil(this.destroy$)).subscribe((fields) => {
      console.log('Fields changed:', fields.length, 'campos');
    });

    // Suscribirse al estado de carga
    this.service.loading$.pipe(takeUntil(this.destroy$)).subscribe((loading) => {
      console.log('Loading:', loading);
    });

    // Suscribirse a errores
    this.service.error$.pipe(takeUntil(this.destroy$)).subscribe((error) => {
      if (error) {
        console.error('Error:', error);
      }
    });
  }
}
