import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../modal/modal.component';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-edit-password-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, ButtonComponent],
  templateUrl: './edit-password-modal.component.html',
  styleUrls: ['./edit-password-modal.component.scss'],
})
export class EditPasswordModalComponent {
  @Output() updateUser = new EventEmitter<boolean>();

  passwordChange = {
    userId: '',
    newPassword: '',
    confirmPassword: '',
  };
  showEditPasswordModal = false;
  passwordError: string | null = null;

  updatePassword(): void {
    if (
      this.passwordChange.newPassword !== this.passwordChange.confirmPassword
    ) {
      this.passwordError = 'Les mots de passe ne correspondent pas';
      return;
    }
    this.passwordError = null;
    this.updateUser.emit(true);
    this.toggleEditPassword();
  }

  toggleEditPassword(userId?: string): void {
    this.showEditPasswordModal = !this.showEditPasswordModal;
    if (this.showEditPasswordModal) {
      if (userId) {
        this.passwordChange.userId = userId;
      } else {
        this.passwordChange = {
          userId: '',
          newPassword: '',
          confirmPassword: '',
        };
        this.showEditPasswordModal = false;
      }
    } else {
      this.passwordChange = {
        userId: '',
        newPassword: '',
        confirmPassword: '',
      };
      this.passwordError = null;
    }
  }
}
