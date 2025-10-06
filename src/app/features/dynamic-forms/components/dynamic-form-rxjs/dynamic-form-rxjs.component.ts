import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormlyModule, FormlyFieldConfig } from '@ngx-formly/core';
import { MatButtonModule } from '@angular/material/button';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Subject, takeUntil } from 'rxjs';
import { FormDefinitionRxjsService } from '../../services/form-definition-rxjs.service';

/**
 * 🔄 Componente que usa RxJS Service
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
  // ==================== DEPENDENCIES ====================
  private service = inject(FormDefinitionRxjsService);
  private destroy$ = new Subject<void>();

  // ==================== FORM STATE ====================
  form = new FormGroup({});
  model: any = {};

  // ==================== OBSERVABLES (para template con async pipe) ====================
  loading$ = this.service.loading$;
  formName$ = this.service.formName$;
  fields$ = this.service.fields$;
  error$ = this.service.error$;

  // ==================== LOCAL STATE (opcional - para suscripción manual) ====================
  // Descomentarlos si prefieres trabajar con valores síncronos
  // formName: string | null = null;
  // fields: FormlyFieldConfig[] = [];
  // loading = false;

  // ==================== LIFECYCLE HOOKS ====================

  ngOnInit(): void {
    this.loadFormData();
  }

  ngOnDestroy(): void {
    this.cleanupSubscriptions();
  }

  // ==================== PUBLIC METHODS ====================

  /**
   * Maneja el envío del formulario
   * Valida los campos y envía los datos al servidor si son válidos
   */
  submit(): void {
    if (this.form.invalid) {
      this.markFormAsTouched();
      this.logValidationErrors();
    } else {
      this.submitFormData();
    }
  }

  // ==================== PRIVATE METHODS ====================

  /**
   * Carga los datos del formulario desde el servidor
   */
  private loadFormData(): void {
    // Opción 1: Cargar desde el servidor real
    this.service.loadFormDefinition();

    // Opción 2: Cargar datos mock para desarrollo
    // this.service.loadFormDefinitionMock();

    // Opción 3: Suscribirse manualmente si necesitas procesar los datos
    // this.subscribeToFormState();
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
    console.log('❌ Formulario inválido');
    console.log('Errores del formulario:', this.form.errors);

    // Mostrar errores de cada campo
    Object.keys(this.form.controls).forEach((key) => {
      const control = this.form.get(key);
      if (control?.errors) {
        console.log(`Campo "${key}":`, control.errors);
      }
    });
  }

  /**
   * Envía los datos del formulario al servidor
   */
  private submitFormData(): void {
    console.log('✅ Datos válidos', this.model);

    this.service
      .submitFormData(this.model)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => this.handleSubmitSuccess(response),
        error: (err) => this.handleSubmitError(err),
      });
  }

  /**
   * Maneja la respuesta exitosa del servidor
   */
  private handleSubmitSuccess(response: any): void {
    console.log('✅ Respuesta del servidor:', response);
    // TODO: Mostrar mensaje de éxito al usuario
    // TODO: Resetear formulario si es necesario
    // this.form.reset();
    // this.model = {};
  }

  /**
   * Maneja los errores al enviar el formulario
   */
  private handleSubmitError(err: any): void {
    console.error('❌ Error al enviar formulario:', err);
    // TODO: Mostrar mensaje de error al usuario
  }

  /**
   * Limpia todas las suscripciones activas
   * Previene memory leaks
   */
  private cleanupSubscriptions(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==================== OPTIONAL: MANUAL SUBSCRIPTION ====================

  /**
   * Ejemplo de suscripción manual a los observables
   * Útil si necesitas transformar o procesar los datos antes de usarlos
   *
   * ⚠️ Solo usar si realmente lo necesitas - el async pipe es mejor
   */
  private subscribeToFormState(): void {
    // Suscribirse al nombre del formulario
    this.service.formName$
      .pipe(takeUntil(this.destroy$))
      .subscribe((name) => {
        console.log('📝 FormName changed:', name);
      });

    // Suscribirse a los campos
    this.service.fields$
      .pipe(takeUntil(this.destroy$))
      .subscribe((fields) => {
        console.log('📋 Fields changed:', fields.length, 'campos');
      });

    // Suscribirse al estado de carga
    this.service.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading) => {
        console.log('⏳ Loading:', loading);
      });

    // Suscribirse a errores
    this.service.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe((error) => {
        if (error) {
          console.error('❌ Error:', error);
        }
      });
  }
}
