import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store, StoreStatus } from '../../../../core/models/store.interface';
import { User } from '../../../../core/models/user.interface';

interface StoreDisplay {
  id: number;
  storeId: string;
  storeName: string;
  storeNameSlug: string;
  storeAddress: string;
  longitude?: string;
  latitude?: string;
  userId?: string;
  userEmail: string;
  status: StoreStatus;
  createdAt: string;
  updatedAt: Date;
}
import { StoreService } from '../../../../core/services/store.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { TableColumn } from '../../../../core/models/table.interface';
import { AddStoreModalComponent } from '../../components/add-store-modal/add-store-modal.component';
import { EditStoreModalComponent } from '../../components/edit-store-modal/edit-store-modal.component';
import { GenericConfirmDeleteModalComponent } from '../../../../shared/components/generic-confirm-delete-modal/generic-confirm-delete-modal.component';

@Component({
  selector: 'app-stores-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableComponent,
    ButtonComponent,
    AddStoreModalComponent,
    EditStoreModalComponent,
    GenericConfirmDeleteModalComponent,
  ],
  templateUrl: './stores-management.component.html',
  styleUrls: ['./stores-management.component.scss'],
})
export class StoresManagementComponent implements OnInit {
  @ViewChild(AddStoreModalComponent) addStoreModal!: AddStoreModalComponent;
  @ViewChild(EditStoreModalComponent) editStoreModal!: EditStoreModalComponent;
  @ViewChild(GenericConfirmDeleteModalComponent)
  confirmDeleteModal!: GenericConfirmDeleteModalComponent;

  stores: StoreDisplay[] = [];
  users: User[] = [];
  availableEmails: string[] = [];
  isResponsive = window.innerWidth <= 1024;

  tableColumns: TableColumn[] = [
    {
      key: 'storeName',
      header: 'Nom du magasin',
      type: 'text',
      editable: true,
    },
    { key: 'storeAddress', header: 'Adresse', type: 'text', editable: true },
    {
      key: 'userEmail',
      header: 'Email utilisateur',
      type: 'select',
      editable: true,
      options: this.availableEmails,
    },
    {
      key: 'status',
      header: 'Statut',
      type: 'status',
      editable: false,
    },
    {
      key: 'actions',
      header: 'Actions',
      type: 'actions',
      template: 'actionsTemplate',
    },
  ];

  constructor(
    private storeService: StoreService,
    private authService: AuthService
  ) {
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
        this.availableEmails = ['', ...users.map((user) => user.email)];

        const userEmailColumn = this.tableColumns.find(
          (col) => col.key === 'userEmail'
        );
        if (userEmailColumn) {
          userEmailColumn.options = this.availableEmails;
        }

        this.getAllStores();
      },
      error: (err) =>
        console.error('Erreur lors de la récupération des utilisateurs:', err),
    });
  }

  getAllStores(): void {
    this.storeService.getAllStores().subscribe({
      next: (stores) => {
        this.stores = stores.map((store) => ({
          ...store,
          userEmail: this.getUserEmail(store.userId),
          createdAt: this.formatDate(store.createdAt),
          storeAddress: store.storeAddress,
          status: store.status || ('deployed' as StoreStatus),
        }));
      },
      error: (err) =>
        console.error('Erreur lors de la récupération des magasins:', err),
    });
  }

  getUserEmail(userId: string | undefined): string {
    if (!userId) return '';
    const user = this.users.find((u) => u._id === userId);
    return user ? user.email : '';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  convertStoreToDisplay(store: Store): StoreDisplay {
    return {
      ...store,
      userEmail: this.getUserEmail(store.userId),
      createdAt: this.formatDate(store.createdAt),
      storeAddress: store.storeAddress,
      status: store.status || ('deployed' as StoreStatus),
    };
  }

  hasStoreDisplayProperties(
    store: Store | StoreDisplay
  ): store is StoreDisplay {
    return 'storeAddress' in store && 'userEmail' in store;
  }

  // Différents éléments pour l'update d'un magasin
  editingStore: StoreDisplay | null = null;

  updateStore(store?: Store | StoreDisplay): void {
    let storeToUpdate: StoreDisplay | null = null;

    if (store) {
      // Si c'est un Store, le convertir en StoreDisplay
      storeToUpdate = this.hasStoreDisplayProperties(store)
        ? (store as StoreDisplay)
        : this.convertStoreToDisplay(store as Store);
    } else {
      storeToUpdate =
        this.editingStore ||
        (this.editStoreModal.editingModalStore
          ? this.convertStoreToDisplay(this.editStoreModal.editingModalStore)
          : null);
    }

    if (storeToUpdate && storeToUpdate.storeId) {
      const updateData = {
        storeName: storeToUpdate.storeName,
        storeAddress: storeToUpdate.storeAddress,
        userId: storeToUpdate.userId,
      };

      this.storeService
        .updateStore(storeToUpdate.storeId, updateData)
        .subscribe({
          next: (updatedStore) => {
            const index = this.stores.findIndex(
              (s) => s.storeId === storeToUpdate.storeId
            );
            if (index !== -1) {
              this.stores[index] = this.convertStoreToDisplay(updatedStore);
            }
            this.editingStore = null;
            this.editStoreModal.editingModalStore = null;
            this.editStoreModal.showEditModal = false;
          },
          error: (err) =>
            console.error('Erreur lors de la mise à jour du magasin:', err),
        });
    }
  }

  onEditChange(event: { item: StoreDisplay; key: string; value: any }): void {
    if (this.editingStore) {
      if (event.key === 'userEmail') {
        // Si l'email change, mettre à jour aussi l'userId
        const selectedUser = this.users.find(
          (user) => user.email === event.value
        );
        this.editingStore = {
          ...this.editingStore,
          [event.key]: event.value,
          userId: selectedUser ? selectedUser._id : undefined,
        };
      } else {
        this.editingStore = {
          ...this.editingStore,
          [event.key]: event.value,
        };
      }
    }
  }

  toggleEditStore(store?: StoreDisplay): void {
    if (this.isResponsive && !this.editingStore) {
      const storeForModal: Store = {
        id: store?.id || 0,
        storeId: store?.storeId || '',
        storeName: store?.storeName || '',
        storeNameSlug: store?.storeNameSlug || '',
        storeAddress: store?.storeAddress || '',
        longitude: store?.longitude,
        latitude: store?.latitude,
        userId: store?.userId,
        createdAt: new Date(store?.createdAt || ''),
        updatedAt: store?.updatedAt || new Date(),
      };
      this.editStoreModal.toggleEditStore(storeForModal);
    } else {
      if (store) {
        this.editingStore = { ...store };
      } else {
        this.editingStore = null;
        this.editStoreModal.showEditModal = false;
        this.editStoreModal.editingModalStore = null;
      }
    }
  }

  toggleAddStore(): void {
    this.addStoreModal.toggleAddStore();
  }

  onStoreCreationStart(storeName: string): void {
    // Ajouter un magasin temporaire avec le statut "pending"
    const pendingStore: StoreDisplay = {
      id: 0,
      storeId: `temp-${Date.now()}`,
      storeName: storeName,
      storeNameSlug: '',
      storeAddress: 'En cours de création...',
      userId: undefined,
      userEmail: '',
      status: 'pending',
      createdAt: this.formatDate(new Date()),
      updatedAt: new Date(),
    };
    this.stores.unshift(pendingStore);
  }

  onStoreCreated(): void {
    // Supprimer les magasins temporaires et rafraîchir la liste
    this.stores = this.stores.filter(
      (store) => !store.storeId.startsWith('temp-')
    );
    this.getAllStores();
  }

  toggleConfirmDelete(storeId: string): void {
    this.confirmDeleteModal.toggleConfirmDelete(storeId);
  }

  onConfirmDelete(storeId: string): void {
    // Mettre le statut en "deleting" avant la suppression
    const storeIndex = this.stores.findIndex((s) => s.storeId === storeId);
    if (storeIndex !== -1) {
      this.stores[storeIndex].status = 'deleting';
    }

    // Supprimer le magasin via l'API
    this.storeService.deleteStore(storeId).subscribe({
      next: () => {
        // Mettre à jour la liste locale après suppression
        this.stores = this.stores.filter((s) => s.storeId !== storeId);
      },
      error: (err) => {
        console.error('Erreur lors de la suppression du magasin:', err);
        // En cas d'erreur, remettre le statut à "deployed"
        if (storeIndex !== -1) {
          this.stores[storeIndex].status = 'deployed';
        }
      },
    });
  }
}
