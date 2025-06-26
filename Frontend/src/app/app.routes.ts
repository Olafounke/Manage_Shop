import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

export const APP_ROUTES: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./features/super-admin/super-admin.routes').then(
        (m) => m.SUPER_ADMIN_ROUTES
      ),
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'SUPER_ADMIN' },
  },
  {
    path: 'my-store',
    loadChildren: () =>
      import('./features/admin-store/admin-store.routes').then(
        (m) => m.ADMIN_STORE_ROUTES
      ),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN_STORE', 'SUPER_ADMIN'] },
  },
  {
    path: 'user',
    loadChildren: () =>
      import('./features/client/client.routes').then((m) => m.CLIENT_ROUTES),
    canActivate: [AuthGuard],
  },
  {
    path: '',
    loadChildren: () =>
      import('./public/public.routes').then((m) => m.PUBLIC_ROUTES),
  },
];
