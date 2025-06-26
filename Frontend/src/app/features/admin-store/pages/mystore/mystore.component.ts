import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminHeaderComponent } from '../../../../shared/components/admin-header/admin-header.component';

@Component({
  selector: 'app-mystore',
  standalone: true,
  imports: [RouterOutlet, AdminHeaderComponent],
  templateUrl: './mystore.component.html',
  styleUrl: './mystore.component.scss',
})
export class MystoreComponent {
  navLinks = [
    { path: 'products', label: 'Produits' },
    { path: 'stock', label: 'Stock' },
    { path: 'transfers', label: 'Transferts' },
    { path: 'orders', label: 'Commandes' },
    { path: 'report', label: 'Rapport' },
  ];
}
