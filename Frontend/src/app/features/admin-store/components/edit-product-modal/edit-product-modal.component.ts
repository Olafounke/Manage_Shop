import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../../../core/models/product.interface';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

@Component({
  selector: 'app-edit-product-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, ButtonComponent],
  templateUrl: './edit-product-modal.component.html',
  styleUrls: ['./edit-product-modal.component.scss'],
})
export class EditProductModalComponent {
  @Input() categories: string[] = [];
  @Output() updateProduct = new EventEmitter<Product>();

  editingModalProduct: Product | null = null;
  showEditModal = false;
  selectedCategories: string[] = [];

  updateProductHandler(): void {
    if (this.editingModalProduct) {
      // Ajouter les catégories sélectionnées
      this.editingModalProduct.categories = [...this.selectedCategories];
    }
    this.updateProduct.emit(this.editingModalProduct!);
  }

  toggleEditProduct(product?: Product): void {
    this.showEditModal = !this.showEditModal;
    if (this.showEditModal && product) {
      this.editingModalProduct = { ...product };
      // Initialiser les catégories sélectionnées
      this.selectedCategories = product.categories
        ? [...product.categories]
        : [];
    } else {
      this.editingModalProduct = null;
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
}
