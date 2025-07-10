import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { Order } from '../../../../core/models/order.interface';

@Component({
  selector: 'app-order-details-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  templateUrl: './order-details-modal.component.html',
  styleUrls: ['./order-details-modal.component.scss'],
})
export class OrderDetailsModalComponent {
  @Input() isOpen = false;
  @Input() order: Order | null = null;
  @Output() closeModal = new EventEmitter<void>();

  getOrderId(): string {
    if (!this.order?.orderGroup?._id) return '';
    return this.order.orderGroup._id.slice(-8);
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      PENDING: 'En attente',
      VALIDATED: 'Validée',
      PREPARED: 'Préparée',
      SHIPPED: 'Expédiée',
      CANCELLED: 'Annulée',
      PARTIALLY_SHIPPED: 'Partiellement expédiée',
      COMPLETED: 'Terminée',
    };
    return statusMap[status] || status;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  close(): void {
    this.closeModal.emit();
  }
}
