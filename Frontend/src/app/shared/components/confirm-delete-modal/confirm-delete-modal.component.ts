import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../modal/modal.component';
import { ButtonComponent } from '../button/button.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-confirm-delete-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, ButtonComponent],
  templateUrl: './confirm-delete-modal.component.html',
  styleUrls: ['./confirm-delete-modal.component.scss'],
})
export class ConfirmDeleteModalComponent {
  @Input() endTitle: string = '?';
  @Input() userRole: string = '';
  @Input() isRestricted: boolean = false;
  @Output() refreshUsers = new EventEmitter<string>();

  showConfirmModal = false;
  userId: string | null = null;

  constructor(private authService: AuthService) {}

  toggleConfirmDelete(userId?: string): void {
    this.showConfirmModal = !this.showConfirmModal;
    if (userId) {
      this.userId = userId;
    } else {
      this.userId = null;
    }
  }

  deleteUser(): void {
    if (this.userId) {
      this.authService.deleteUser(this.userId).subscribe({
        next: () => {
          if (this.userId) this.refreshUsers.emit(this.userId);
          this.toggleConfirmDelete();
        },
        error: (err) => console.error('Erreur lors de la suppression:', err),
      });
    }
  }
}
