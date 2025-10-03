import { Routes } from '@angular/router';

export const DYNAMIC_FORM_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/dynamic-form/dynamic-form.component').then(
        (m) => m.DynamicFormComponent
      ),
  },
];
