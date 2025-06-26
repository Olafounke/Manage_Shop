import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { UsersManagementComponent } from './pages/users-management/users-management.component';
import { StoresManagementComponent } from './pages/stores-management/stores-management.component';
import { ReportsGlobalComponent } from './pages/reports-global/reports-global.component';

export const SUPER_ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      { path: '', redirectTo: 'users', pathMatch: 'full' },
      { path: 'users', component: UsersManagementComponent },
      { path: 'stores', component: StoresManagementComponent },
      { path: 'reports', component: ReportsGlobalComponent },
    ],
  },
];
