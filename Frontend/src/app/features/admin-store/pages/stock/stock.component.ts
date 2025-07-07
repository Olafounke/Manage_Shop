import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryItem } from '../../../../core/models/inventory.interface';
import { InventoryService } from '../../../../core/services/inventory.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { TableColumn } from '../../../../core/models/table.interface';
import { GenericConfirmDeleteModalComponent } from '../../../../shared/components/generic-confirm-delete-modal/generic-confirm-delete-modal.component';
import { UserService } from '../../../../core/services/user.service';

interface StockDisplay extends InventoryItem {
  createdAtText: string;
  updatedAtText: string;
}

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableComponent,
    ButtonComponent,
    GenericConfirmDeleteModalComponent,
  ],
  templateUrl: './stock.component.html',
  styleUrl: './stock.component.scss',
})
export class StockComponent implements OnInit {
  @ViewChild(GenericConfirmDeleteModalComponent)
  confirmDeleteModal!: GenericConfirmDeleteModalComponent;

  stocks: StockDisplay[] = [];
  userStoreId: string = '';
  isResponsive = window.innerWidth <= 1024;

  tableColumns: TableColumn[] = [
    { key: 'productId', header: 'ID Produit', type: 'text', editable: false },
    {
      key: 'productName',
      header: 'Nom du produit',
      type: 'text',
      editable: true,
    },
    { key: 'quantity', header: 'Quantité', type: 'text', editable: true },
    {
      key: 'createdAtText',
      header: 'Date de création',
      type: 'text',
      editable: false,
    },
    {
      key: 'updatedAtText',
      header: 'Dernière modification',
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

  constructor(
    private inventoryService: InventoryService,
    private userService: UserService
  ) {
    window.addEventListener('resize', () => {
      this.isResponsive = window.innerWidth <= 1024;
    });
  }

  ngOnInit(): void {
    this.userStoreId = this.userService.getUserStore();
    this.getAllStocks();
  }

  getAllStocks(): void {
    console.log('getAllStocks', this.userStoreId);
    if (!this.userStoreId) return;
    this.inventoryService.getInventoryByStore(this.userStoreId).subscribe({
      next: (stocks) => {
        console.log('stocks', stocks);
        this.stocks = stocks.map((stock) => this.convertStockToDisplay(stock));
      },
      error: (err) =>
        console.error('Erreur lors de la récupération des stocks:', err),
    });
  }

  convertStockToDisplay(stock: InventoryItem): StockDisplay {
    return {
      ...stock,
      createdAtText: this.formatDate(stock.createdAt),
      updatedAtText: this.formatDate(stock.updatedAt),
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

  // Éléments pour la mise à jour d'un stock
  editingStock: StockDisplay | null = null;

  updateStock(): void {
    if (this.editingStock && this.editingStock.productId) {
      const updateData = {
        quantity: this.editingStock.quantity,
        productName: this.editingStock.productName,
      };

      this.inventoryService
        .updateInventoryItem(
          this.userStoreId,
          this.editingStock.productId,
          updateData
        )
        .subscribe({
          next: (updatedStock) => {
            const index = this.stocks.findIndex(
              (s) => s.id === this.editingStock!.id
            );
            if (index !== -1) {
              this.stocks[index] = this.convertStockToDisplay(updatedStock);
            }
            this.editingStock = null;
          },
          error: (err) =>
            console.error('Erreur lors de la mise à jour du stock:', err),
        });
    }
  }

  onEditChange(event: { item: StockDisplay; key: string; value: any }): void {
    if (this.editingStock) {
      this.editingStock = {
        ...this.editingStock,
        [event.key]: event.value,
      };
    }
  }

  toggleEditStock(stock?: StockDisplay): void {
    if (stock) {
      this.editingStock = { ...stock };
    } else {
      this.editingStock = null;
    }
  }

  toggleConfirmDelete(productId: string): void {
    this.confirmDeleteModal.toggleConfirmDelete(productId);
  }

  onConfirmDelete(productId: string): void {
    this.inventoryService
      .deleteInventoryItem(this.userStoreId, productId)
      .subscribe({
        next: () => {
          this.stocks = this.stocks.filter((s) => s.productId !== productId);
        },
        error: (err) =>
          console.error('Erreur lors de la suppression du stock:', err),
      });
  }
}
