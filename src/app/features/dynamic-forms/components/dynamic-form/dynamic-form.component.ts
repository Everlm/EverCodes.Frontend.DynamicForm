import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormlyForm, FormlyModule } from '@ngx-formly/core';
import { MatButtonModule } from '@angular/material/button';
import { FormDefinitionStore } from '../../services/form-definition.store';

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormlyForm, MatButtonModule],
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss'],
})
export class DynamicFormComponent implements OnInit {
  form = new FormGroup({});
  model: any = {};

  constructor(public store: FormDefinitionStore) {}

  ngOnInit() {
    this.store.loadFormDefinition();
  }

  submit() {
    if (this.form.valid) {
      console.log('✅ Datos enviados:', this.model);
    } else {
      console.log('❌ Formulario inválido');
    }
  }
}
