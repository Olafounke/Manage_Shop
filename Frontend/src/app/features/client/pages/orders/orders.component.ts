import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../../../core/services/order.service';
import { OrderGroup, Order } from '../../../../core/models/order.interface';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

interface OrderGroupDisplay extends OrderGroup {
  createdAtText: string;
  updatedAtText: string;
  statusText: string;
  isExpanded: boolean;
  orderDetails?: Order[];
  loadingDetails?: boolean;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss',
})
export class OrdersComponent implements OnInit {
  orderGroups: OrderGroupDisplay[] = [];
  loading = false;
  error: string | null = null;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadUserOrders();
  }

  loadUserOrders(): void {
    this.loading = true;
    this.error = null;

    this.orderService.getUserOrders().subscribe({
      next: (orderGroups) => {
        // Filtrer les commandes PENDING
        const filteredOrderGroups = orderGroups.filter(
          (orderGroup) => orderGroup.status !== 'PENDING'
        );
        console.log('filteredOrderGroups', filteredOrderGroups);

        this.orderGroups = filteredOrderGroups.map((orderGroup) =>
          this.convertOrderGroupToDisplay(orderGroup)
        );
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des commandes';
        this.loading = false;
        console.error('Erreur chargement commandes:', error);
      },
    });
  }

  convertOrderGroupToDisplay(orderGroup: OrderGroup): OrderGroupDisplay {
    return {
      ...orderGroup,
      createdAtText: this.formatDate(orderGroup.createdAt),
      updatedAtText: this.formatDate(orderGroup.updatedAt),
      statusText: this.getStatusText(orderGroup.status),
      isExpanded: false,
    };
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'En attente';
      case 'VALIDATED':
        return 'Validée';
      case 'PARTIALLY_SHIPPED':
        return 'Partiellement expédiée';
      case 'COMPLETED':
        return 'Terminée';
      case 'CANCELLED':
        return 'Annulée';
      default:
        return status;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'status-pending';
      case 'VALIDATED':
        return 'status-validated';
      case 'PARTIALLY_SHIPPED':
        return 'status-partial';
      case 'COMPLETED':
        return 'status-completed';
      case 'CANCELLED':
        return 'status-cancelled';
      default:
        return 'status-default';
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  }

  toggleOrderGroup(orderGroup: OrderGroupDisplay): void {
    console.log('loadOrderDetails', orderGroup);

    if (orderGroup.isExpanded) {
      orderGroup.isExpanded = false;
      return;
    }

    orderGroup.isExpanded = true;

    // Si les données sont déjà populées, on les utilise directement
    if (
      !orderGroup.orderDetails &&
      orderGroup.orders &&
      orderGroup.orders.length > 0
    ) {
      // Vérifier si les orders sont déjà des objets Order complets ou juste des IDs
      const firstOrder = orderGroup.orders[0];
      if (
        typeof firstOrder === 'object' &&
        firstOrder !== null &&
        '_id' in firstOrder
      ) {
        // Les orders sont déjà des objets Order complets
        orderGroup.orderDetails = orderGroup.orders as any;
        console.log('orderDetails', orderGroup.orderDetails);
      } else {
        // Les orders sont des IDs, mais d'après vous ils devraient être populés
        console.warn(
          'Orders ne sont pas populés comme attendu:',
          orderGroup.orders
        );
      }
    }
  }

  getOrderStatusText(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'En attente';
      case 'VALIDATED':
        return 'Validée';
      case 'PREPARED':
        return 'Préparée';
      case 'SHIPPED':
        return 'Expédiée';
      case 'CANCELLED':
        return 'Annulée';
      default:
        return status;
    }
  }

  getOrderStatusClass(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'order-status-pending';
      case 'VALIDATED':
        return 'order-status-validated';
      case 'PREPARED':
        return 'order-status-prepared';
      case 'SHIPPED':
        return 'order-status-shipped';
      case 'CANCELLED':
        return 'order-status-cancelled';
      default:
        return 'order-status-default';
    }
  }

  hasOrders(): boolean {
    return this.orderGroups.length > 0;
  }
}
