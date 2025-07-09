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

interface ProductDisplay
  extends Pick<
    Product,
    '_id' | 'name' | 'description' | 'price' | 'stores' | 'categories'
  > {
  priceText: string;
  storesText: string;
  categoriesText: string;
  descriptionText: string;
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

  tableColumns: TableColumn[] = [
    { key: 'name', header: 'Nom du produit', type: 'text', editable: false },
    {
      key: 'descriptionText',
      header: 'Description',
      type: 'text',
      editable: false,
    },
    { key: 'priceText', header: 'Prix', type: 'text', editable: false },
    {
      key: 'categoriesText',
      header: 'Catégories',
      type: 'text',
      editable: false,
    },
    { key: 'storesText', header: 'Stores', type: 'text', editable: false },
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
  ) {}

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

  private truncate(text: string, maxLength: number): string {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  }

  convertProductToDisplay(product: Product): ProductDisplay {
    // On s'assure que categories est toujours un tableau d'objets ou de chaînes
    const categories = Array.isArray(product.categories)
      ? product.categories.map((cat: any) =>
          typeof cat === 'string' ? cat : cat && cat.name ? cat.name : ''
        )
      : [];
    // Nouveau format stores: [{id, name}]
    const stores = Array.isArray(product.stores)
      ? product.stores.map((store: any) =>
          store && store.name ? store.name : ''
        )
      : [];

    return {
      _id: product._id,
      name: product.name,
      description: product.description,
      price: product.price,
      stores: product.stores,
      categories: product.categories,
      priceText: `${product.price.toFixed(2)} €`,
      storesText:
        stores.filter((s) => !!s).length > 0
          ? this.truncate(stores.filter((s) => !!s).join(', '), 30)
          : '',
      categoriesText:
        categories.length > 0 ? this.truncate(categories.join(', '), 30) : '',
      descriptionText: product.description
        ? this.truncate(product.description, 30)
        : '',
    };
  }

  updateProduct(): void {
    const productToUpdate = this.editProductModal.editingModalProduct;

    if (productToUpdate && productToUpdate._id) {
      const updateData: Partial<Product> = {
        name: productToUpdate.name,
        description: productToUpdate.description,
        price: productToUpdate.price,
        categories: productToUpdate.categories,
        images: productToUpdate.images,
        totalInventory: productToUpdate.totalInventory,
      };

      this.productService
        .updateProduct(productToUpdate._id, updateData)
        .subscribe({
          next: () => {
            this.getMyProducts();
            this.editProductModal.editingModalProduct = null;
            this.editProductModal.showEditModal = false;
          },
          error: (err) =>
            console.error('Erreur lors de la mise à jour du produit:', err),
        });
    }
  }

  toggleEditProduct(product: ProductDisplay): void {
    // Récupérer le produit complet depuis le backend pour avoir toutes les données
    this.productService.getProductById(product._id).subscribe({
      next: (fullProduct) => {
        this.editProductModal.toggleEditProduct(fullProduct);
      },
      error: (err) => {
        console.error('Erreur lors de la récupération du produit:', err);
        // Fallback : utiliser les données disponibles
        const productForModal: Product = {
          _id: product._id,
          name: product.name,
          description: product.description,
          price: product.price,
          images: [],
          categories: product.categories || [],
          owner: '',
          stores: product.stores,
          customFields: {},
          totalInventory: 0,
          inStock: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        this.editProductModal.toggleEditProduct(productForModal);
      },
    });
  }

  toggleAddProduct(): void {
    this.addProductModal.toggleAddProduct();
  }

  toggleConfirmDelete(productId: string): void {
    this.confirmDeleteModal.toggleConfirmDelete(productId);
  }

  onConfirmDelete(productId: string): void {
    this.productService.deleteProduct(productId).subscribe({
      next: () => {
        this.products = this.products.filter((p) => p._id !== productId);
      },
      error: (err) =>
        console.error('Erreur lors de la suppression du produit:', err),
    });
  }
}
