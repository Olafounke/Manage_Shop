import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../modal/modal.component';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-generic-confirm-delete-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, ButtonComponent],
  templateUrl: './generic-confirm-delete-modal.component.html',
  styleUrls: ['./generic-confirm-delete-modal.component.scss'],
})
export class GenericConfirmDeleteModalComponent {
  @Input() title: string = 'Confirmation de suppression';
  @Input() itemType: string = 'cet élément'; // 'ce produit', 'ce magasin', etc.
  @Input() itemName: string = '';
  @Output() confirmDelete = new EventEmitter<string>();

  showConfirmModal = false;
  itemId: string | null = null;

  toggleConfirmDelete(itemId?: string): void {
    this.showConfirmModal = !this.showConfirmModal;
    if (itemId) {
      this.itemId = itemId;
    } else {
      this.itemId = null;
    }
  }

  onConfirmDelete(): void {
    if (this.itemId) {
      this.confirmDelete.emit(this.itemId);
      this.toggleConfirmDelete();
    }
  }
}
