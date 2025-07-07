import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '../../../../core/models/store.interface';
import { User } from '../../../../core/models/user.interface';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

@Component({
  selector: 'app-edit-store-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, ButtonComponent],
  templateUrl: './edit-store-modal.component.html',
  styleUrls: ['./edit-store-modal.component.scss'],
})
export class EditStoreModalComponent {
  @Input() users: User[] = [];
  @Output() updateStore = new EventEmitter<Store>();

  editingModalStore: Store | null = null;
  showEditModal = false;
  availableEmails: string[] = [];
  selectedEmail: string = '';

  updateStoreHandler(): void {
    if (this.editingModalStore) {
      // Convertir l'email en userId si un email est sélectionné
      if (this.selectedEmail && this.selectedEmail !== '') {
        const selectedUser = this.users.find(
          (user) => user.email === this.selectedEmail
        );
        this.editingModalStore.userId = selectedUser
          ? selectedUser._id
          : undefined;
      } else {
        this.editingModalStore.userId = undefined;
      }
    }
    this.updateStore.emit(this.editingModalStore!);
  }

  toggleEditStore(store?: Store): void {
    this.showEditModal = !this.showEditModal;
    if (this.showEditModal && store) {
      this.editingModalStore = { ...store };
      // Préparer la liste des emails et sélectionner l'email actuel
      this.availableEmails = ['', ...this.users.map((user) => user.email)];

      // Trouver l'email de l'utilisateur actuel
      if (store.userId) {
        const currentUser = this.users.find(
          (user) => user._id === store.userId
        );
        this.selectedEmail = currentUser ? currentUser.email : '';
      } else {
        this.selectedEmail = '';
      }
    } else {
      this.editingModalStore = null;
      this.selectedEmail = '';
    }
  }
}
