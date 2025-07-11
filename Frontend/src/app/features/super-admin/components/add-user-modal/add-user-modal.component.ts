import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../../../../core/models/user.interface';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-add-user-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, ButtonComponent],
  templateUrl: './add-user-modal.component.html',
  styleUrls: ['./add-user-modal.component.scss'],
})
export class AddUserModalComponent {
  @Input() availableRoles: string[] = [];
  @Input() availableStores: string[] = [];
  @Output() refreshUsers = new EventEmitter<User>();

  showAddUserModal = false;

  newUser: User = {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'USER',
  };

  constructor(private authService: AuthService) {}

  addUser(): void {
    if (this.validateNewUser()) {
      this.authService.register(this.newUser).subscribe({
        next: () => {
          this.refreshUsers.emit();
          this.toggleAddUser();
        },
        error: (err) => console.error("Erreur lors de l'ajout:", err),
      });
    }
  }

  toggleAddUser(): void {
    this.showAddUserModal = !this.showAddUserModal;
    if (!this.showAddUserModal) {
      this.newUser = {
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'USER',
      };
    }
  }

  validateNewUser(): boolean {
    return this.newUser.email &&
      this.newUser.password &&
      this.newUser.firstName &&
      this.newUser.lastName &&
      this.newUser.role
      ? true
      : false;
  }

  onRoleChange(): void {
    if (this.newUser.role === 'ADMIN_STORE') {
      this.newUser.store = '';
    }
  }
}
