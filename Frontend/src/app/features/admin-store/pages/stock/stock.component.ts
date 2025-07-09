import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryItem } from '../../../../core/models/inventory.interface';
import { Product } from '../../../../core/models/product.interface';
import { InventoryService } from '../../../../core/services/inventory.service';
import { ProductService } from '../../../../core/services/product.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { TableColumn } from '../../../../core/models/table.interface';
import { GenericConfirmDeleteModalComponent } from '../../../../shared/components/generic-confirm-delete-modal/generic-confirm-delete-modal.component';
import { UserService } from '../../../../core/services/user.service';

interface StockDisplay extends InventoryItem {
  totalQuantity?: number;
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

  tableColumns: TableColumn[] = [
    {
      key: 'productName',
      header: 'Nom du produit',
      type: 'text',
      editable: false,
    },
    {
      key: 'quantity',
      header: 'Quantité locale',
      type: 'text',
      editable: true,
    },
    {
      key: 'totalQuantity',
      header: 'Quantité totale',
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
    private productService: ProductService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.userStoreId = this.userService.getUserStore();
    this.getAllStocks();
  }

  getAllStocks(): void {
    if (!this.userStoreId) return;
    this.inventoryService.getInventoryByStore(this.userStoreId).subscribe({
      next: (stocks) => {
        this.stocks = stocks.map((stock) => this.convertStockToDisplay(stock));
        this.loadTotalQuantities();
      },
      error: (err) =>
        console.error('Erreur lors de la récupération des stocks:', err),
    });
  }

  convertStockToDisplay(stock: InventoryItem): StockDisplay {
    return {
      ...stock,
      totalQuantity: 0, // Sera mis à jour par loadTotalQuantities
    };
  }

  loadTotalQuantities(): void {
    // Récupérer les informations de quantité totale pour chaque produit
    this.stocks.forEach((stock) => {
      this.productService.getProductById(stock.productId).subscribe({
        next: (product: Product) => {
          stock.totalQuantity = product.totalInventory || 0;
        },
        error: (err) => {
          console.error(
            `Erreur lors de la récupération du produit ${stock.productId}:`,
            err
          );
          stock.totalQuantity = 0;
        },
      });
    });
  }

  // Éléments pour la mise à jour d'un stock
  editingStock: StockDisplay | null = null;

  updateStock(): void {
    if (this.editingStock && this.editingStock.productId) {
      const updateData = {
        quantity: this.editingStock.quantity,
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
              // Conserver la quantité totale
              this.stocks[index].totalQuantity =
                this.editingStock!.totalQuantity;
            }
            this.editingStock = null;
          },
          error: (err) =>
            console.error('Erreur lors de la mise à jour du stock:', err),
        });
    }
  }

  onEditChange(event: { item: StockDisplay; key: string; value: any }): void {
    if (this.editingStock && event.key === 'quantity') {
      this.editingStock = {
        ...this.editingStock,
        quantity: parseInt(event.value) || 0,
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
