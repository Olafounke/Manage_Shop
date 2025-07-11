import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EnrichedUser } from '../../../../core/models/user.interface';
import { Store } from '../../../../core/models';
import { AuthService } from '../../../../core/services/auth.service';
import { StoreService } from '../../../../core/services/store.service';
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

  users: EnrichedUser[] = [];
  stores: Store[] = [];
  availableStores: string[] = [];
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
      key: 'storeName',
      header: 'Magasin',
      type: 'text',
    },
    {
      key: 'actions',
      header: 'Actions',
      type: 'actions',
      template: 'actionsTemplate',
    },
  ];

  constructor(
    private authService: AuthService,
    private storeService: StoreService
  ) {
    window.addEventListener('resize', () => {
      this.isResponsive = window.innerWidth <= 1024;
    });
  }

  ngOnInit(): void {
    this.getAllUsers();
    this.getAllStores(); // Encore nécessaire pour les modals d'ajout/édition
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

  getAllStores(): void {
    this.storeService.getAllStores().subscribe({
      next: (stores) => {
        this.stores = stores;
        this.availableStores = ['-', ...stores.map((store) => store.name)];
      },
      error: (err) =>
        console.error('Erreur lors de la récupération des stores:', err),
    });
  }

  getStoreId(storeName: string): string | undefined {
    if (storeName === '-') return undefined;
    const store = this.stores.find((s) => s.name === storeName);
    return store?.storeId;
  }

  getAvailableStoresForUser(currentUser: EnrichedUser): string[] {
    const usedStores = this.users
      .filter(
        (user) =>
          user.role === 'ADMIN_STORE' &&
          user.store !== '-' &&
          user._id !== currentUser._id
      )
      .map((user) => user.store);

    const availableStores = this.stores
      .filter((store) => !usedStores.includes(store.storeId))
      .map((store) => store.name);

    return ['-', ...availableStores];
  }

  // Différents éléments pour l'update d'un utilisateur
  editingUser: EnrichedUser | null = null;

  updateUser(newPassword?: boolean): void {
    let _id: string;
    let updateData: Partial<EnrichedUser>;
    const userToUpdate =
      this.editingUser || this.editUserModal.editingModalUser;

    if (this.editPasswordModal.passwordChange.userId && newPassword) {
      _id = this.editPasswordModal.passwordChange.userId;
      updateData = {
        password: this.editPasswordModal.passwordChange.newPassword,
      };
    } else if (userToUpdate && userToUpdate._id) {
      _id = userToUpdate._id;

      // Prendre seulement les champs nécessaires pour l'update
      updateData = {
        email: userToUpdate.email,
        firstName: userToUpdate.firstName,
        lastName: userToUpdate.lastName,
        role: userToUpdate.role,
        store: userToUpdate.store, // C'est toujours le storeId original
      };

      // Si storeName a été modifié en mode édition, convertir en storeId
      const enrichedUser = userToUpdate as EnrichedUser;
      if (enrichedUser.storeName && enrichedUser.storeName !== '-') {
        updateData.store = this.getStoreId(enrichedUser.storeName);
      } else if (enrichedUser.storeName === '-') {
        updateData.store = '-';
      }
    } else {
      return;
    }

    this.authService.updateUser(_id, updateData).subscribe({
      next: () => {
        this.getAllUsers();
        this.editingUser = null;
        this.editUserModal.editingModalUser = null;
        this.editUserModal.showEditModal = false;
      },
      error: (err) => console.error('Erreur lors de la mise à jour:', err),
    });
  }

  onEditChange(event: { item: EnrichedUser; key: string; value: any }): void {
    if (this.editingUser) {
      if (event.key === 'role') {
        // Si le rôle change, mettre à jour la colonne storeName
        this.editingUser = {
          ...this.editingUser,
          [event.key]: event.value,
        };
        this.onStartEdit(this.editingUser);
      } else if (
        event.key === 'storeName' &&
        this.editingUser.role !== 'ADMIN_STORE'
      ) {
        // Empêcher la modification du store si pas ADMIN_STORE
        return;
      } else {
        this.editingUser = {
          ...this.editingUser,
          [event.key]: event.value,
        };
      }
    }
  }

  onStartEdit(user: EnrichedUser): void {
    const storeColumn = this.tableColumns.find(
      (col) => col.key === 'storeName'
    );
    if (storeColumn) {
      if (user.role === 'ADMIN_STORE') {
        storeColumn.editable = true;
        storeColumn.type = 'select';
        storeColumn.options = this.getAvailableStoresForUser(user);
      } else {
        storeColumn.editable = false;
        storeColumn.type = 'text';
        if (this.editingUser) {
          this.editingUser.storeName = '-';
        }
      }
    }
  }

  toggleEditUser(user?: EnrichedUser): void {
    if (this.isResponsive && !this.editingUser) {
      this.editUserModal.toggleEditUser(user);
    } else {
      if (user) {
        this.onStartEdit(user);
        this.editingUser = { ...user };
      } else {
        this.editingUser = null;
        this.editUserModal.showEditModal = false;
        this.editUserModal.editingModalUser = null;

        // Remettre la colonne storeName en mode text
        const storeColumn = this.tableColumns.find(
          (col) => col.key === 'storeName'
        );
        if (storeColumn) {
          storeColumn.type = 'text';
          storeColumn.editable = false;
        }
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
