import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateStoreRequest } from '../../../../core/models/store.interface';
import { User } from '../../../../core/models/user.interface';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { StoreService } from '../../../../core/services/store.service';

@Component({
  selector: 'app-add-store-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, ButtonComponent],
  templateUrl: './add-store-modal.component.html',
  styleUrls: ['./add-store-modal.component.scss'],
})
export class AddStoreModalComponent {
  @Input() users: User[] = [];
  @Output() refreshStores = new EventEmitter<void>();

  showAddStoreModal = false;
  availableEmails: string[] = [];
  selectedEmail: string = '';

  newStore: CreateStoreRequest = {
    storeName: '',
    storeAddress: '',
    userId: undefined,
  };

  constructor(private storeService: StoreService) {}

  addStore(): void {
    if (this.validateNewStore()) {
      // Convertir l'email en userId si un email est sélectionné
      if (this.selectedEmail && this.selectedEmail !== '') {
        const selectedUser = this.users.find(
          (user) => user.email === this.selectedEmail
        );
        this.newStore.userId = selectedUser ? selectedUser._id : undefined;
      } else {
        this.newStore.userId = undefined;
      }

      this.storeService.createStore(this.newStore).subscribe({
        next: () => {
          this.refreshStores.emit();
          this.toggleAddStore();
        },
        error: (err) =>
          console.error("Erreur lors de l'ajout du magasin:", err),
      });
    }
  }

  toggleAddStore(): void {
    this.showAddStoreModal = !this.showAddStoreModal;
    if (this.showAddStoreModal) {
      // Préparer la liste des emails quand la modal s'ouvre
      this.availableEmails = ['', ...this.users.map((user) => user.email)];
    } else {
      this.newStore = {
        storeName: '',
        storeAddress: '',
        userId: undefined,
      };
      this.selectedEmail = '';
    }
  }

  validateNewStore(): boolean {
    return (
      this.newStore.storeName.trim() !== '' &&
      this.newStore.storeAddress.trim() !== ''
    );
  }
}
