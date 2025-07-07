import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../../../../core/models/user.interface';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

@Component({
  selector: 'app-edit-user-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, ButtonComponent],
  templateUrl: './edit-user-modal.component.html',
  styleUrls: ['./edit-user-modal.component.scss'],
})
export class EditUserModalComponent {
  @Input() availableRoles: string[] = [];
  @Output() updateUser = new EventEmitter<User>();
  @Output() toggleEditPassword = new EventEmitter<string>();

  editingModalUser: User | null = null;
  showEditModal = false;

  updateUserHandler(): void {
    this.updateUser.emit();
  }

  toggleEditUser(user?: User): void {
    this.showEditModal = !this.showEditModal;
    if (this.showEditModal && user) {
      this.editingModalUser = { ...user };
    } else {
      this.editingModalUser = null;
    }
  }

  toggleEditPasswordHandler(userId?: string): void {
    this.toggleEditPassword.emit(userId);
  }

  onRoleChange(): void {
    if (this.editingModalUser) {
      // Si le rôle change et n'est plus ADMIN_STORE, on retire le store
      if (this.editingModalUser.role !== 'ADMIN_STORE') {
        this.editingModalUser.store = undefined;
      }
    }
  }
}
