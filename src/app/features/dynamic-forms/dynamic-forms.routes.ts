import { Routes } from '@angular/router';

export const DYNAMIC_FORM_ROUTES: Routes = [
  {
    path: 'signals',
    loadComponent: () =>
      import('./components/dynamic-form-signals/dynamic-form.component').then(
        (m) => m.DynamicFormComponent
      ),
  },
  {
    path: 'rxjs',
    loadComponent: () =>
      import('./components/dynamic-form-rxjs/dynamic-form-rxjs.component').then(
        (m) => m.DynamicFormRxjsComponent
      ),
  },
];
