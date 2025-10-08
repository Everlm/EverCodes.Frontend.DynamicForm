import { Component, inject, OnInit, computed, signal } from '@angular/core';
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
    MatFormFieldModule
  ],
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss'],
})
export class DynamicFormComponent implements OnInit {
  store = inject(FormDefinitionStore);

  form = new FormGroup({});
  model: any = {};

  // 🎯 Signal para controlar el delay mínimo de visualización del loading
  private minimumLoadingTime = 800; // ms
  showLoading = signal(true);

  // ⏱️ Temporizador para calcular tiempo de completación
  private formStartTime: number = Date.now();

  // 🔹 Campos locales de ejemplo/prueba con mensajes automáticos
  private localFields: FormlyFieldConfig[] = [
    {
      key: 'username',
      type: 'input',
      props: {
        label: 'Username (Required)',
        placeholder: 'Ingrese su usuario',
        required: true,
        minLength: 3,
        maxLength: 20,
      },
      validation: {
        messages: getValidationMessages(
          ['required', 'minlength', 'maxlength'],
          { minLength: 3, maxLength: 20 }
        ),
      },
    },
  ];

  // 🔹 Usa campos del servidor si están disponibles, sino usa los locales
  fields = computed<FormlyFieldConfig[]>(() => {
    const serverFields = this.store.fields();
    return serverFields.length > 0 ? serverFields : this.localFields;
  });

  // 🔹 Computed que combina el loading real con el delay mínimo
  isLoading = computed(() => {
    return this.store.loading() || this.showLoading();
  });

  ngOnInit() {
    // Intenta cargar desde el servidor, fallback automático a campos locales
    this.store.loadFormDefinition();

    // ⏱️ Mantener el loading visible por un tiempo mínimo para evitar el flash
    setTimeout(() => {
      this.showLoading.set(false);
    }, this.minimumLoadingTime);

    // 🕐 Registrar tiempo de inicio para cálculo de completación
    this.formStartTime = Date.now();
  }

  submit() {
    if (this.form.invalid) {
      // Marcar todos los campos como tocados para mostrar los errores
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        control?.markAsTouched();
        control?.updateValueAndValidity();
      });
      console.log('❌ Formulario inválido', {
        formErrors: this.form.errors,
        fieldErrors: Object.keys(this.form.controls).reduce((acc, key) => {
          const control = this.form.get(key);
          if (control?.errors) {
            acc[key] = control.errors;
          }
          return acc;
        }, {} as any)
      });
    } else {
      // ⏱️ Calcular tiempo de completación en segundos
      const completionTime = Math.floor((Date.now() - this.formStartTime) / 1000);

      // 📦 Crear objeto de submission listo para persistencia
      const submission = createFormSubmission(
        this.store.formDefinitionId() || 'local-form',
        this.store.version() || 1,
        this.model,
        true, // isComplete
        completionTime
      );

      // ✅ Formulario válido - Imprimir JSON formateado
      console.log('✅ ========== FORMULARIO ENVIADO EXITOSAMENTE ==========');
      console.log('📝 Nombre del formulario:', this.store.formName());
      console.log('🆔 Form Definition ID:', submission.formDefinitionId);
      console.log('📌 Versión del formulario:', submission.formVersion);
      console.log('⏱️ Tiempo de completación:', `${completionTime}s`);
      console.log('');
      console.log('📋 Datos del usuario (para persistencia):');
      console.log(JSON.stringify(this.model, null, 2));
      console.log('');
      console.log('� JSON completo para enviar al backend:');
      console.log(JSON.stringify(submission, null, 2));
      console.log('');
      console.log('�📊 Estadísticas del formulario:', this.store.formStats());
      console.log('✅ ====================================================');

      // También mostrar en formato de tabla para mejor visualización
      console.table(this.model);

      // 🚀 TODO: Aquí enviarías al backend con HttpClient
      // this.http.post(`/api/forms/${submission.formDefinitionId}/submissions`, submission)
      //   .subscribe({
      //     next: (response) => console.log('✅ Guardado exitoso:', response),
      //     error: (error) => console.error('❌ Error al guardar:', error)
      //   });
    }
  }
}
