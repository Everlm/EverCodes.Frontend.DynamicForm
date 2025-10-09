import { Component, inject, OnInit, computed, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormlyModule, FormlyFieldConfig } from '@ngx-formly/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormDefinitionStore } from '../../services/form-definition.store';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { getValidationMessages } from '../../../../shared/formly/validation-messages';
import { createFormSubmission } from '../../models/form-submission.interface';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-dynamic-form',
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
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss'],
})
export class DynamicFormComponent implements OnInit, OnDestroy {
  store = inject(FormDefinitionStore);

  form = new FormGroup({});
  model: any = {};

  // Subject para limpiar suscripciones
  private destroy$ = new Subject<void>();

  // Signal para controlar el delay mínimo de visualización del loading
  private minimumLoadingTime = 800;
  showLoading = signal(true);

  // Temporizador para calcular tiempo de completación
  private formStartTime: number = Date.now();

  // Usa campos del servidor si están disponibles
  fields = computed<FormlyFieldConfig[]>(() => {
    const serverFields = this.store.fields();
    return serverFields.length > 0 ? serverFields : [];
  });

  // Computed que combina el loading real con el delay mínimo
  isLoading = computed(() => {
    return this.store.loading() || this.showLoading();
  });

  // Hooks
  ngOnInit() {
    this.loadFormData();
    this.initializeLoadingDelay();
    this.initializeFormTimer();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Metodos

  // Carga los datos del formulario desde el servidor
  private loadFormData(): void {
    this.store
      .loadFormDefinition$()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          if (result) {
            console.log('Formulario cargado:', result.formName);
          }
        },
        error: (err) => {
          console.error('Error al cargar formulario:', err);
        },
      });
  }

  // Inicializa el delay mínimo del loading para evitar flash visual
  private initializeLoadingDelay(): void {
    setTimeout(() => {
      this.showLoading.set(false);
    }, this.minimumLoadingTime);
  }

  // Inicializa el temporizador para calcular el tiempo de completación
  private initializeFormTimer(): void {
    this.formStartTime = Date.now();
  }

  // Reintentar carga del formulario después de un error
  retry(): void {
    this.store
      .retry$()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          if (result) {
            console.log('Reintento exitoso:', result.formName);
          }
        },
        error: (err) => {
          console.error('Error en reintento:', err);
        },
      });
  }

  // Enviar formulario
  submit() {
    if (this.form.invalid) {
      this.handleInvalidForm();
    } else {
      this.handleValidForm();
    }
  }

  // Maneja el formulario inválido
  private handleInvalidForm(): void {
    this.markAllFieldsAsTouched();
    this.logFormErrors();
  }

  // Marca todos los campos como tocados para mostrar errores
  private markAllFieldsAsTouched(): void {
    Object.keys(this.form.controls).forEach((key) => {
      const control = this.form.get(key);
      control?.markAsTouched();
      control?.updateValueAndValidity();
    });
  }

  // Loguea los errores del formulario para debugging
  private logFormErrors(): void {
    console.log('Formulario inválido', {
      formErrors: this.form.errors,
      fieldErrors: this.getFieldErrors(),
    });
  }

  // Extrae los errores de cada campo
  private getFieldErrors(): Record<string, any> {
    return Object.keys(this.form.controls).reduce((acc, key) => {
      const control = this.form.get(key);
      if (control?.errors) {
        acc[key] = control.errors;
      }
      return acc;
    }, {} as Record<string, any>);
  }

  // Maneja el formulario válido
  private handleValidForm(): void {
    const completionTime = this.calculateCompletionTime();
    const submission = this.createSubmission(completionTime);

    this.logFormSubmission(submission, completionTime);
  }

  // Calcula el tiempo de completación en segundos
  private calculateCompletionTime(): number {
    return Math.floor((Date.now() - this.formStartTime) / 1000);
  }

  // Crea el objeto de submission listo para enviar
  private createSubmission(completionTime: number) {
    return createFormSubmission(
      this.store.formDefinitionId() || 'local-form',
      this.store.version() || 1,
      this.model,
      true,
      completionTime
    );
  }

  // Loguea el submission para debugging
  private logFormSubmission(submission: any, completionTime: number): void {
    console.log('Formulario valido');
    console.log('Nombre del formulario:', this.store.formName());
    console.log('Tiempo de completación:', `${completionTime}s`);
    console.log('');
    console.log('Datos del usuario (para persistencia):');
    console.log(JSON.stringify(this.model, null, 2));
    console.log('');
    console.log('JSON completo para enviar al backend:');
    console.log(JSON.stringify(submission, null, 2));
    console.log('');
    console.log('Estadísticas del formulario:', this.store.formStats());
    console.table(this.model);
  }
}
