import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../../../../core/models/user.interface';
import { AuthService } from '../../../../core/services/auth.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { TableColumn } from '../../../../core/models/table.interface';
import { AddUserModalComponent } from '../../components/add-user-modal/add-user-modal.component';
import { EditPasswordModalComponent } from '../../../../shared/components/edit-password-modal/edit-password-modal.component';
import { EditUserModalComponent } from '../../components/edit-user-modal/edit-user-modal.component';
import { ConfirmDeleteModalComponent } from '../../../../shared/components/confirm-delete-modal/confirm-delete-modal.component';

@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableComponent,
    ButtonComponent,
    AddUserModalComponent,
    EditUserModalComponent,
    EditPasswordModalComponent,
    ConfirmDeleteModalComponent,
  ],
  templateUrl: './users-management.component.html',
  styleUrls: ['./users-management.component.scss'],
})
export class UsersManagementComponent implements OnInit {
  @ViewChild(AddUserModalComponent) addUserModal!: AddUserModalComponent;
  @ViewChild(EditUserModalComponent) editUserModal!: EditUserModalComponent;
  @ViewChild(EditPasswordModalComponent)
  editPasswordModal!: EditPasswordModalComponent;
  @ViewChild(ConfirmDeleteModalComponent)
  confirmDeleteModal!: ConfirmDeleteModalComponent;

  users: User[] = [];
  isResponsive = window.innerWidth <= 1024;

  // Différentes colonnes du tableau
  availableRoles = ['USER', 'ADMIN_STORE', 'SUPER_ADMIN'];
  tableColumns: TableColumn[] = [
    { key: 'email', header: 'Email', type: 'text' },
    { key: 'firstName', header: 'Prénom', type: 'text' },
    { key: 'lastName', header: 'Nom', type: 'text' },
    {
      key: 'password',
      header: 'Mot de passe',
      type: 'actions',
      template: 'passwordTemplate',
    },
    {
      key: 'role',
      header: 'Rôle',
      type: 'select',
      options: this.availableRoles,
    },
    {
      key: 'actions',
      header: 'Actions',
      type: 'actions',
      template: 'actionsTemplate',
    },
  ];

  constructor(private authService: AuthService) {
    window.addEventListener('resize', () => {
      this.isResponsive = window.innerWidth <= 1024;
    });
  }

  ngOnInit(): void {
    this.getAllUsers();
  }

  getAllUsers(): void {
    this.authService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (err) =>
        console.error('Erreur lors de la récupération des utilisateurs:', err),
    });
  }

  // Différents éléments pour l'update d'un utilisateur
  editingUser: User | null = null;

  updateUser(newPassword?: boolean): void {
    let _id: string;
    let updateData: Partial<User>;
    const userToUpdate =
      this.editingUser || this.editUserModal.editingModalUser;

    if (this.editPasswordModal.passwordChange.userId && newPassword) {
      _id = this.editPasswordModal.passwordChange.userId;
      updateData = {
        password: this.editPasswordModal.passwordChange.newPassword,
      };
    } else if (userToUpdate && userToUpdate._id) {
      _id = userToUpdate._id;
      updateData = { ...userToUpdate };
      delete updateData._id;
      delete updateData.password;
    } else {
      return;
    }

    this.authService.updateUser(_id, updateData).subscribe({
      next: () => {
        const index = this.users.findIndex((u) => u._id === _id);
        if (index !== -1) {
          this.users[index] = { ...this.users[index], ...updateData };
        }
        this.editingUser = null;
        this.editUserModal.editingModalUser = null;
        this.editUserModal.showEditModal = false;
      },
      error: (err) => console.error('Erreur lors de la mise à jour:', err),
    });
  }

  onEditChange(event: { item: User; key: string; value: any }): void {
    if (this.editingUser) {
      this.editingUser = {
        ...this.editingUser,
        [event.key]: event.value,
      };
    }
  }

  toggleEditUser(user?: User): void {
    if (this.isResponsive && !this.editingUser) {
      this.editUserModal.toggleEditUser(user);
    } else {
      if (user) {
        this.editingUser = { ...user };
      } else {
        this.editingUser = null;
        this.editUserModal.showEditModal = false;
        this.editUserModal.editingModalUser = null;
      }
    }
  }

  toggleEditPassword(userId?: string): void {
    this.editPasswordModal.toggleEditPassword(userId);
  }

  toggleAddUser(): void {
    this.addUserModal.toggleAddUser();
  }

  toggleConfirmDelete(userId: string): void {
    this.confirmDeleteModal.toggleConfirmDelete(userId);
  }

  refreshAfterDelete(userId: string): void {
    this.users = this.users.filter((u) => u._id !== userId);
  }
}
