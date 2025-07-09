import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Product } from '../../../../core/models/product.interface';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { ButtonConfig } from '../../../../core/models/button.interface';
import { ProductService } from '../../../../core/services/product.service';
import { ImageService } from '../../../../core/services/image.service';

@Component({
  selector: 'app-add-product-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    ModalComponent,
    ButtonComponent,
  ],
  templateUrl: './add-product-modal.component.html',
  styleUrls: ['./add-product-modal.component.scss'],
})
export class AddProductModalComponent {
  @Input() categories: string[] = [];
  @Output() refreshProducts = new EventEmitter<void>();

  showAddProductModal = false;
  selectedCategories: string[] = [];
  selectedFiles: File[] = [];
  uploadedImages: string[] = [];
  isUploading = false;

  // Configuration du bouton d'upload
  uploadButtonConfig: ButtonConfig = {
    style: 'save',
    type: 'button',
    size: 'medium',
    display: 'icon+text',
    text: 'Enregistrer les images',
    icon: 'cloud_upload',
    disabled: false,
  };

  newProduct: Partial<Product> = {
    name: '',
    description: '',
    price: 0,
    categories: [],
    totalInventory: 0,
    images: [],
  };

  constructor(
    private productService: ProductService,
    private imageService: ImageService
  ) {}

  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files) {
      this.selectedFiles = Array.from(files);
      this.updateUploadButtonConfig();
    }
  }

  async uploadImages(): Promise<void> {
    if (this.selectedFiles.length === 0) return;

    this.isUploading = true;
    this.updateUploadButtonConfig();

    try {
      const response = await this.imageService
        .uploadMultipleImages(this.selectedFiles)
        .toPromise();
      this.uploadedImages = response?.urls || [];
      this.newProduct.images = this.uploadedImages;
      this.selectedFiles = []; // Vider les fichiers sélectionnés après upload
      this.updateUploadButtonConfig();
    } catch (error) {
      console.error("Erreur lors de l'upload des images:", error);
    } finally {
      this.isUploading = false;
      this.updateUploadButtonConfig();
    }
  }

  removeImage(index: number): void {
    const imageUrl = this.uploadedImages[index];
    this.imageService.deleteImage(imageUrl).subscribe({
      next: () => {
        this.uploadedImages.splice(index, 1);
        this.newProduct.images = this.uploadedImages;
      },
      error: (err) =>
        console.error("Erreur lors de la suppression de l'image:", err),
    });
  }

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
        images: [],
      };
      this.selectedCategories = [];
      this.selectedFiles = [];
      this.uploadedImages = [];
      this.updateUploadButtonConfig();
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

  private updateUploadButtonConfig(): void {
    this.uploadButtonConfig = {
      ...this.uploadButtonConfig,
      text: this.isUploading
        ? 'Enregistrement en cours...'
        : this.selectedFiles.length > 0
        ? `Enregistrer ${this.selectedFiles.length} image(s)`
        : 'Enregistrer les images',
      disabled: this.selectedFiles.length === 0 || this.isUploading,
    };
  }

  onUploadClick(): void {
    this.uploadImages();
  }
}
