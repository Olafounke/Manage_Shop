import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../../../core/models/product.interface';
import { ProductService } from '../../../../core/services/product.service';
import { CategoryService } from '../../../../core/services/category.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { TableColumn } from '../../../../core/models/table.interface';
import { AddProductModalComponent } from '../../components/add-product-modal/add-product-modal.component';
import { EditProductModalComponent } from '../../components/edit-product-modal/edit-product-modal.component';
import { GenericConfirmDeleteModalComponent } from '../../../../shared/components/generic-confirm-delete-modal/generic-confirm-delete-modal.component';

interface ProductDisplay extends Omit<Product, 'createdAt'> {
  createdAt: string;
  categoriesText: string;
  priceText: string;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableComponent,
    ButtonComponent,
    AddProductModalComponent,
    EditProductModalComponent,
    GenericConfirmDeleteModalComponent,
  ],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
})
export class ProductsComponent implements OnInit {
  @ViewChild(AddProductModalComponent)
  addProductModal!: AddProductModalComponent;
  @ViewChild(EditProductModalComponent)
  editProductModal!: EditProductModalComponent;
  @ViewChild(GenericConfirmDeleteModalComponent)
  confirmDeleteModal!: GenericConfirmDeleteModalComponent;

  products: ProductDisplay[] = [];
  categories: string[] = [];
  isResponsive = window.innerWidth <= 1024;

  tableColumns: TableColumn[] = [
    { key: 'name', header: 'Nom du produit', type: 'text', editable: true },
    { key: 'description', header: 'Description', type: 'text', editable: true },
    { key: 'priceText', header: 'Prix', type: 'text', editable: true },
    {
      key: 'categoriesText',
      header: 'Catégories',
      type: 'text',
      editable: false,
    },
    { key: 'totalInventory', header: 'Stock', type: 'text', editable: true },
    { key: 'inStock', header: 'En stock', type: 'text', editable: false },
    {
      key: 'createdAt',
      header: 'Date de création',
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
    private productService: ProductService,
    private categoryService: CategoryService
  ) {
    window.addEventListener('resize', () => {
      this.isResponsive = window.innerWidth <= 1024;
    });
  }

  ngOnInit(): void {
    this.getCategories();
    this.getMyProducts();
  }

  getCategories(): void {
    this.categoryService.getCategoryNames().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (err) =>
        console.error('Erreur lors de la récupération des catégories:', err),
    });
  }

  getMyProducts(): void {
    this.productService.getMyProducts().subscribe({
      next: (products) => {
        this.products = products.map((product) =>
          this.convertProductToDisplay(product)
        );
      },
      error: (err) =>
        console.error('Erreur lors de la récupération des produits:', err),
    });
  }

  convertProductToDisplay(product: Product): ProductDisplay {
    return {
      ...product,
      createdAt: this.formatDate(product.createdAt),
      categoriesText: product.categories
        ? product.categories.join(', ')
        : 'Aucune',
      priceText: `${product.price.toFixed(2)} €`,
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

  // Différents éléments pour l'update d'un produit
  editingProduct: ProductDisplay | null = null;

  updateProduct(product?: ProductDisplay): void {
    const productToUpdate =
      product ||
      this.editingProduct ||
      (this.editProductModal.editingModalProduct
        ? this.convertProductToDisplay(
            this.editProductModal.editingModalProduct
          )
        : null);

    if (productToUpdate && productToUpdate._id) {
      // Convertir les données d'affichage en données API
      const updateData: Partial<Product> = {
        name: productToUpdate.name,
        description: productToUpdate.description,
        price: parseFloat(
          productToUpdate.priceText.replace(' €', '').replace(',', '.')
        ),
        totalInventory: productToUpdate.totalInventory,
      };

      this.productService
        .updateProduct(productToUpdate._id, updateData)
        .subscribe({
          next: (updatedProduct) => {
            const index = this.products.findIndex(
              (p) => p._id === productToUpdate._id
            );
            if (index !== -1) {
              this.products[index] =
                this.convertProductToDisplay(updatedProduct);
            }
            this.editingProduct = null;
            this.editProductModal.editingModalProduct = null;
            this.editProductModal.showEditModal = false;
          },
          error: (err) =>
            console.error('Erreur lors de la mise à jour du produit:', err),
        });
    }
  }

  onEditChange(event: { item: ProductDisplay; key: string; value: any }): void {
    if (this.editingProduct) {
      this.editingProduct = {
        ...this.editingProduct,
        [event.key]: event.value,
      };
    }
  }

  toggleEditProduct(product?: ProductDisplay): void {
    if (this.isResponsive && !this.editingProduct) {
      // Convertir ProductDisplay en Product pour le modal
      const productForModal: Product = {
        _id: product?._id || '',
        name: product?.name || '',
        description: product?.description,
        price: parseFloat(
          product?.priceText?.replace(' €', '').replace(',', '.') || '0'
        ),
        images: product?.images,
        categories: product?.categories,
        owner: product?.owner || '',
        stores: product?.stores || [],
        customFields: product?.customFields,
        totalInventory: product?.totalInventory,
        inStock: product?.inStock,
        createdAt: new Date(product?.createdAt || ''),
        updatedAt: product?.updatedAt || new Date(),
      };
      this.editProductModal.toggleEditProduct(productForModal);
    } else {
      if (product) {
        this.editingProduct = { ...product };
      } else {
        this.editingProduct = null;
        this.editProductModal.showEditModal = false;
        this.editProductModal.editingModalProduct = null;
      }
    }
  }

  toggleAddProduct(): void {
    this.addProductModal.toggleAddProduct();
  }

  toggleConfirmDelete(productId: string): void {
    this.confirmDeleteModal.toggleConfirmDelete(productId);
  }

  onConfirmDelete(productId: string): void {
    // Supprimer le produit via l'API
    this.productService.deleteProduct(productId).subscribe({
      next: () => {
        // Mettre à jour la liste locale après suppression
        this.products = this.products.filter((p) => p._id !== productId);
      },
      error: (err) =>
        console.error('Erreur lors de la suppression du produit:', err),
    });
  }
}
