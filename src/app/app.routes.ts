import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'dynamic-form',
    loadChildren: () =>
      import('./features/dynamic-forms/dynamic-forms.routes').then((m) => m.DYNAMIC_FORM_ROUTES),
  },
];
