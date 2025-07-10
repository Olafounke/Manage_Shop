import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { OrderDetailsModalComponent } from '../../components/order-details-modal/order-details-modal.component';
import { OrderService } from '../../../../core/services/order.service';
import { UserService } from '../../../../core/services/user.service';
import { Order } from '../../../../core/models/order.interface';
import { TableColumn } from '../../../../core/models/table.interface';

interface OrderDisplay extends Order {
  orderIdText: string;
  userNameText: string;
  statusText: string;
  createdAtText: string;
  subtotalText: string;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableComponent,
    ButtonComponent,
    OrderDetailsModalComponent,
  ],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss',
})
export class OrdersComponent implements OnInit {
  userStoreId: string = '';
  loading: boolean = false;
  error: string | null = null;
  selectedOrder: Order | null = null;
  isDetailsModalOpen: boolean = false;

  // Commandes organisées par statut
  validatedOrders: OrderDisplay[] = [];
  preparedOrders: OrderDisplay[] = [];
  shippedOrders: OrderDisplay[] = [];

  // Configuration des colonnes communes
  commonColumns: TableColumn[] = [
    {
      key: 'orderIdText',
      header: 'ID Commande',
      type: 'text',
      editable: false,
    },
    {
      key: 'userNameText',
      header: 'Nom du client',
      type: 'text',
      editable: false,
    },
    { key: 'subtotalText', header: 'Montant', type: 'text', editable: false },
    { key: 'createdAtText', header: 'Date', type: 'text', editable: false },
    {
      key: 'actions',
      header: 'Actions',
      type: 'actions',
      template: 'actionsTemplate',
    },
  ];

  constructor(
    private orderService: OrderService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadUserStoreId();
  }

  loadUserStoreId(): void {
    this.userStoreId = this.userService.getUserStore();
    if (this.userStoreId) {
      this.loadStoreOrders();
    } else {
      this.error = "Aucun magasin associé à l'utilisateur";
    }
  }

  loadStoreOrders(): void {
    this.loading = true;
    this.error = null;

    this.orderService.getStoreOrders().subscribe({
      next: (orders) => {
        this.organizeOrdersByStatus(orders);
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des commandes:', err);
        this.error = 'Erreur lors de la récupération des commandes du magasin';
        this.loading = false;
      },
    });
  }

  organizeOrdersByStatus(orders: Order[]): void {
    // Convertir les commandes en OrderDisplay et les organiser par statut
    const orderDisplays = orders.map((order) =>
      this.convertOrderToDisplay(order)
    );

    this.validatedOrders = orderDisplays.filter(
      (order) => order.status === 'VALIDATED'
    );
    this.preparedOrders = orderDisplays.filter(
      (order) => order.status === 'PREPARED'
    );
    this.shippedOrders = orderDisplays.filter(
      (order) => order.status === 'SHIPPED'
    );
  }

  convertOrderToDisplay(order: Order): OrderDisplay {
    return {
      ...order,
      orderIdText: this.getOrderId(order),
      userNameText: order.orderGroup.userName,
      statusText: this.getStatusText(order.status),
      createdAtText: new Date(order.createdAt).toLocaleDateString('fr-FR'),
      subtotalText: this.formatPrice(order.subtotal),
    };
  }

  getOrderId(order: Order): string {
    return order.orderGroup._id.slice(-8);
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      PENDING: 'En attente',
      VALIDATED: 'Validée',
      PREPARED: 'Préparée',
      SHIPPED: 'Expédiée',
      CANCELLED: 'Annulée',
    };
    return statusMap[status] || status;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  }

  updateOrderStatus(orderId: string, newStatus: string): void {
    this.orderService.updateOrderStatus(orderId, newStatus).subscribe({
      next: (updatedOrder) => {
        // Recharger les commandes pour mettre à jour l'affichage
        this.loadStoreOrders();
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour du statut:', err);
        // Recharger les commandes en cas d'erreur pour remettre l'ancien statut
        this.loadStoreOrders();
      },
    });
  }

  // Actions pour les commandes validées (à préparer)
  prepareOrder(orderId: string): void {
    this.updateOrderStatus(orderId, 'PREPARED');
  }

  // Actions pour les commandes préparées (à envoyer)
  shipOrder(orderId: string): void {
    this.updateOrderStatus(orderId, 'SHIPPED');
  }

  // Actions pour voir les détails d'une commande
  viewOrderDetails(order: Order): void {
    this.selectedOrder = order;
    this.isDetailsModalOpen = true;
  }

  closeDetailsModal(): void {
    this.isDetailsModalOpen = false;
    this.selectedOrder = null;
  }

  getOrderItemsText(order: Order): string {
    return order.items
      .map((item) => `${item.productName} (${item.quantity}x)`)
      .join(', ');
  }
}
