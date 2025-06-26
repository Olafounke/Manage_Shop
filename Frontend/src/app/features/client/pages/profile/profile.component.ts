import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { TokenService } from '../../../../core/services/token.service';
import { User } from '../../../../core/models/user.interface';
import { EditPasswordModalComponent } from '../../../../shared/components/edit-password-modal/edit-password-modal.component';
import { ConfirmDeleteModalComponent } from '../../../../shared/components/confirm-delete-modal/confirm-delete-modal.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    MatDividerModule,
    ConfirmDeleteModalComponent,
    EditPasswordModalComponent,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  @ViewChild(EditPasswordModalComponent)
  editPasswordModal!: EditPasswordModalComponent;
  @ViewChild(ConfirmDeleteModalComponent)
  confirmDeleteModal!: ConfirmDeleteModalComponent;

  isEditMode = false;

  user: User = {
    email: '',
    firstName: '',
    lastName: '',
    _id: '',
  };

  editForm = {
    firstName: '',
    lastName: '',
    email: '',
  };

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private tokenService: TokenService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUserProfile();
  }

  loadUserProfile() {
    this.user = {
      email: this.userService.getUserEmail(),
      firstName: this.userService.getUserFirstName(),
      lastName: this.userService.getUserLastName(),
      role: this.userService.getUserRole(),
      _id: this.userService.getUserID(),
    };
    this.editForm = {
      firstName: this.user.firstName || '',
      lastName: this.user.lastName || '',
      email: this.user.email,
    };
  }

  navigateToCart() {
    this.router.navigate(['/user/cart']);
  }

  navigateToOrders() {
    this.router.navigate(['/user/orders']);
  }

  updateProfile() {
    this.authService.updateUser(this.user._id!, this.editForm).subscribe({
      next: () => {
        this.userService.setUserFirstName(this.editForm.firstName);
        this.userService.setUserLastName(this.editForm.lastName);
        this.userService.setUserEmail(this.editForm.email);
        this.loadUserProfile();
        this.isEditMode = false;
      },
      error: (error: Error) => {
        console.error('Erreur lors de la mise à jour du profil:', error);
      },
    });
  }

  updatePassword(newPassword?: boolean): void {
    if (this.editPasswordModal.passwordChange.userId && newPassword) {
      const _id = this.editPasswordModal.passwordChange.userId;
      const updateData: Partial<User> = {
        password: this.editPasswordModal.passwordChange.newPassword,
      };

      this.authService.updateUser(_id, updateData).subscribe({
        next: () => {},
        error: (err) => console.error('Erreur lors de la mise à jour:', err),
      });
    }
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
  }

  toggleEditPassword(userId?: string): void {
    this.editPasswordModal.toggleEditPassword(userId);
  }

  toggleConfirmDelete(userId: string) {
    this.confirmDeleteModal.toggleConfirmDelete(userId);
  }

  refreshAfterDelete() {
    this.tokenService.removeToken();
    this.router.navigate(['/']).then(() => {
      window.location.reload();
    });
  }
}
