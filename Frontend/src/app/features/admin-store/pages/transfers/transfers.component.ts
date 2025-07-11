import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Transfert,
  CreateTransfertRequest,
} from '../../../../core/models/transfert.interface';
import { Store } from '../../../../core/models/store.interface';
import { InventoryItem } from '../../../../core/models/inventory.interface';
import { TransfertService } from '../../../../core/services/transfert.service';
import { StoreService } from '../../../../core/services/store.service';
import { InventoryService } from '../../../../core/services/inventory.service';
import { UserService } from '../../../../core/services/user.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { TableColumn } from '../../../../core/models/table.interface';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { GenericConfirmDeleteModalComponent } from '../../../../shared/components/generic-confirm-delete-modal/generic-confirm-delete-modal.component';

interface TransfertDisplay extends Transfert {
  transfertDateText: string;
  responseDateText: string;
  statusText: string;
}

@Component({
  selector: 'app-transfers',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableComponent,
    ButtonComponent,
    ModalComponent,
  ],
  templateUrl: './transfers.component.html',
  styleUrl: './transfers.component.scss',
})
export class TransfersComponent implements OnInit {
  @ViewChild(GenericConfirmDeleteModalComponent)
  confirmActionModal!: GenericConfirmDeleteModalComponent;

  outgoingTransferts: TransfertDisplay[] = [];
  incomingTransferts: TransfertDisplay[] = [];
  historyTransferts: TransfertDisplay[] = [];

  stores: Store[] = [];
  availableStores: Store[] = [];
  myStocks: InventoryItem[] = [];

  userStoreId: string = '';
  isResponsive = window.innerWidth <= 1024;

  // Modal de création de transfert
  showCreateTransfertModal = false;
  pendingAction: { action: 'accept' | 'reject'; transfertId: string } | null =
    null;

  newTransfert: CreateTransfertRequest = {
    productId: '',
    productName: '',
    quantity: 1,
    fromStoreId: '',
    fromStoreName: '',
    toStoreId: '',
    toStoreName: '',
  };

  // Colonnes pour les transferts sortants
  outgoingColumns: TableColumn[] = [
    { key: 'productName', header: 'Produit', type: 'text', editable: false },
    { key: 'quantity', header: 'Quantité', type: 'text', editable: false },
    {
      key: 'toStoreName',
      header: 'Magasin destinataire',
      type: 'text',
      editable: false,
    },
    { key: 'statusText', header: 'Statut', type: 'text', editable: false },
    {
      key: 'transfertDateText',
      header: 'Date de demande',
      type: 'text',
      editable: false,
    },
  ];

  // Colonnes pour les transferts entrants
  incomingColumns: TableColumn[] = [
    { key: 'productName', header: 'Produit', type: 'text', editable: false },
    { key: 'quantity', header: 'Quantité', type: 'text', editable: false },
    {
      key: 'fromStoreName',
      header: 'Magasin demandeur',
      type: 'text',
      editable: false,
    },
    {
      key: 'transfertDateText',
      header: 'Date de demande',
      type: 'text',
      editable: false,
    },
    {
      key: 'actions',
      header: 'Actions',
      type: 'actions',
      template: 'actionsTemplate',
    },
  ];

  // Colonnes pour l'historique
  historyColumns: TableColumn[] = [
    { key: 'productName', header: 'Produit', type: 'text', editable: false },
    { key: 'quantity', header: 'Quantité', type: 'text', editable: false },
    {
      key: 'fromStoreName',
      header: 'Magasin source',
      type: 'text',
      editable: false,
    },
    {
      key: 'toStoreName',
      header: 'Magasin destination',
      type: 'text',
      editable: false,
    },
    { key: 'statusText', header: 'Statut', type: 'text', editable: false },
    {
      key: 'transfertDateText',
      header: 'Date de demande',
      type: 'text',
      editable: false,
    },
    {
      key: 'responseDateText',
      header: 'Date de réponse',
      type: 'text',
      editable: false,
    },
  ];

  constructor(
    private transfertService: TransfertService,
    private storeService: StoreService,
    private inventoryService: InventoryService,
    private userService: UserService
  ) {
    window.addEventListener('resize', () => {
      this.isResponsive = window.innerWidth <= 1024;
    });
  }

  ngOnInit(): void {
    this.userStoreId = this.userService.getUserStore();
    this.loadAllStores();
    this.loadMyStocks();
    this.loadTransferts();
  }

  loadAllStores(): void {
    this.storeService.getAllStores().subscribe({
      next: (stores) => {
        this.stores = stores;
        // Exclure son propre magasin des magasins disponibles
        this.availableStores = stores.filter(
          (store) => store.storeId !== this.userStoreId
        );
      },
      error: (err) =>
        console.error('Erreur lors de la récupération des magasins:', err),
    });
  }

  loadMyStocks(): void {
    if (!this.userStoreId) return;

    this.inventoryService.getInventoryByStore(this.userStoreId).subscribe({
      next: (stocks) => {
        this.myStocks = stocks.filter((stock) => stock.quantity > 0);
      },
      error: (err) =>
        console.error('Erreur lors de la récupération des stocks:', err),
    });
  }

  loadTransferts(): void {
    if (!this.userStoreId) return;

    // Transferts sortants
    this.transfertService
      .getTransfertsByStore(this.userStoreId, 'outgoing')
      .subscribe({
        next: (transferts) => {
          this.outgoingTransferts = transferts.map((t) =>
            this.convertTransfertToDisplay(t)
          );
        },
        error: (err) =>
          console.error(
            'Erreur lors de la récupération des transferts sortants:',
            err
          ),
      });

    // Transferts entrants
    this.transfertService
      .getTransfertsByStore(this.userStoreId, 'incoming')
      .subscribe({
        next: (transferts) => {
          this.incomingTransferts = transferts
            .filter((t) => t.status === 'PENDING')
            .map((t) => this.convertTransfertToDisplay(t));
        },
        error: (err) =>
          console.error(
            'Erreur lors de la récupération des transferts entrants:',
            err
          ),
      });

    // Historique
    this.transfertService
      .getTransfertsByStore(this.userStoreId, 'all')
      .subscribe({
        next: (transferts) => {
          this.historyTransferts = transferts
            .filter((t) => t.status !== 'PENDING')
            .map((t) => this.convertTransfertToDisplay(t));
        },
        error: (err) =>
          console.error("Erreur lors de la récupération de l'historique:", err),
      });
  }

  convertTransfertToDisplay(transfert: Transfert): TransfertDisplay {
    return {
      ...transfert,
      transfertDateText: this.formatDate(transfert.transfertDate),
      responseDateText: transfert.responseDate
        ? this.formatDate(transfert.responseDate)
        : '-',
      statusText: this.getStatusText(transfert.status),
    };
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

  getStatusText(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'En attente';
      case 'ACCEPTED':
        return 'Accepté';
      case 'REJECTED':
        return 'Refusé';
      default:
        return status;
    }
  }

  // Modal de création de transfert
  toggleCreateTransfertModal(): void {
    this.showCreateTransfertModal = !this.showCreateTransfertModal;
    if (!this.showCreateTransfertModal) {
      this.resetNewTransfert();
    }
  }

  resetNewTransfert(): void {
    this.newTransfert = {
      productId: '',
      productName: '',
      quantity: 1,
      fromStoreId: '',
      fromStoreName: '',
      toStoreId: '',
      toStoreName: '',
    };
  }

  onProductChange(): void {
    const selectedStock = this.myStocks.find(
      (stock) => stock.productId === this.newTransfert.productId
    );
    if (selectedStock) {
      this.newTransfert.productName = selectedStock.productName || '';
    }
  }

  onStoreChange(): void {
    const selectedStore = this.availableStores.find(
      (store) => store.storeId === this.newTransfert.toStoreId
    );
    if (selectedStore) {
      this.newTransfert.toStoreName = selectedStore.name;
    }
  }

  createTransfert(): void {
    if (this.validateNewTransfert()) {
      // Compléter les données manquantes
      const userStore = this.stores.find(
        (store) => store.storeId === this.userStoreId
      );
      if (userStore) {
        this.newTransfert.fromStoreId = this.userStoreId;
        this.newTransfert.fromStoreName = userStore.name;
      }

      this.transfertService.createTransfert(this.newTransfert).subscribe({
        next: () => {
          this.loadTransferts();
          this.toggleCreateTransfertModal();
          // Optionnel : ajouter un message de succès
          console.log('Demande de transfert créée avec succès');
        },
        error: (err) => {
          console.error('Erreur lors de la création du transfert:', err);
          // Optionnel : afficher un message d'erreur à l'utilisateur
          alert(
            'Erreur lors de la création de la demande de transfert. Veuillez réessayer.'
          );
        },
      });
    }
  }

  validateNewTransfert(): boolean {
    const isValid = !!(
      this.newTransfert.productId &&
      this.newTransfert.toStoreId &&
      this.newTransfert.quantity > 0
    );

    // Validation supplémentaire : vérifier que la quantité ne dépasse pas le stock disponible
    if (isValid && this.newTransfert.productId) {
      const selectedStock = this.myStocks.find(
        (stock) => stock.productId === this.newTransfert.productId
      );
      if (
        selectedStock &&
        this.newTransfert.quantity > selectedStock.quantity
      ) {
        alert(
          `La quantité demandée (${this.newTransfert.quantity}) dépasse le stock disponible (${selectedStock.quantity})`
        );
        return false;
      }
    }

    return isValid;
  }

  onConfirm(action: 'accept' | 'reject', transfertId: string): void {
    const serviceCall =
      action === 'accept'
        ? this.transfertService.acceptTransfert(transfertId)
        : this.transfertService.rejectTransfert(transfertId);

    serviceCall.subscribe({
      next: () => {
        this.loadTransferts();
        this.pendingAction = null;
      },
      error: (err) =>
        console.error(
          `Erreur lors de l'${
            action === 'accept' ? 'acceptation' : 'refus'
          } du transfert:`,
          err
        ),
    });
  }
}
