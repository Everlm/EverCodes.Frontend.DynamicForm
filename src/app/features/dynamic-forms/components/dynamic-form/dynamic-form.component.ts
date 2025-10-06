import { ChangeDetectorRef, Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormlyModule, FormlyFieldConfig } from '@ngx-formly/core';
import { MatButtonModule } from '@angular/material/button';
import { FormDefinitionStore } from '../../services/form-definition.store';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { MatFormField, MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { getValidationMessages } from '../../../../shared/formly/validation-messages';

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
  public store = inject(FormDefinitionStore);

  form = new FormGroup({});
  model: any = {};

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

  constructor() {}

  ngOnInit() {
    this.store.loadFormDefinition();
  }

  submit() {
    if (this.form.invalid) {
      // Marcar todos los campos como tocados para mostrar los errores
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        control?.markAsTouched();
        control?.updateValueAndValidity();
      });
      console.log('❌ Formulario inválido', this.form.errors, this.form.get('username')?.errors);
    } else {
      console.log('✅ Datos válidos', this.model);
    }
  }
}
