import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../../../core/models/product.interface';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { ProductService } from '../../../../core/services/product.service';

@Component({
  selector: 'app-add-product-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, ButtonComponent],
  templateUrl: './add-product-modal.component.html',
  styleUrls: ['./add-product-modal.component.scss'],
})
export class AddProductModalComponent {
  @Input() categories: string[] = [];
  @Output() refreshProducts = new EventEmitter<void>();

  showAddProductModal = false;
  selectedCategories: string[] = [];

  newProduct: Partial<Product> = {
    name: '',
    description: '',
    price: 0,
    categories: [],
    totalInventory: 0,
  };

  constructor(private productService: ProductService) {}

  addProduct(): void {
    if (this.validateNewProduct()) {
      // Ajouter les catégories sélectionnées
      this.newProduct.categories = [...this.selectedCategories];

      this.productService.createProduct(this.newProduct).subscribe({
        next: () => {
          this.refreshProducts.emit();
          this.toggleAddProduct();
        },
        error: (err) =>
          console.error("Erreur lors de l'ajout du produit:", err),
      });
    }
  }

  toggleAddProduct(): void {
    this.showAddProductModal = !this.showAddProductModal;
    if (!this.showAddProductModal) {
      this.newProduct = {
        name: '',
        description: '',
        price: 0,
        categories: [],
        totalInventory: 0,
      };
      this.selectedCategories = [];
    }
  }

  onCategoryChange(category: string, isChecked: boolean): void {
    if (isChecked) {
      this.selectedCategories.push(category);
    } else {
      this.selectedCategories = this.selectedCategories.filter(
        (c) => c !== category
      );
    }
  }

  onCategoryChangeEvent(category: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.onCategoryChange(category, target.checked);
  }

  isCategorySelected(category: string): boolean {
    return this.selectedCategories.includes(category);
  }

  validateNewProduct(): boolean {
    return !!(
      this.newProduct.name?.trim() &&
      this.newProduct.price !== undefined &&
      this.newProduct.price > 0 &&
      this.newProduct.totalInventory !== undefined &&
      this.newProduct.totalInventory >= 0
    );
  }
}
