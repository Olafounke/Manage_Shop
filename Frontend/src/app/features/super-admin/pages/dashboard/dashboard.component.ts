import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminHeaderComponent } from '../../../../shared/components/admin-header/admin-header.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterOutlet, AdminHeaderComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  navLinks = [
    { path: 'users', label: 'Utilisateurs' },
    { path: 'stores', label: 'Magasins' },
    { path: 'reports', label: 'Rapports' },
  ];
}
