import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../core/services/user.service';
import { ProductService } from '../../../core/services/product.service';
import {
  Product,
  ProductFilters,
} from '../../../core/models/product.interface';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';
import { CategoryFilterComponent } from '../../components/category-filter/category-filter.component';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { PaginationComponent } from '../../components/pagination/pagination.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    SearchBarComponent,
    CategoryFilterComponent,
    ProductCardComponent,
    PaginationComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  products: Product[] = [];
  loading: boolean = false;
  error: string = '';

  // Filtres et pagination
  currentPage: number = 1;
  totalPages: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 12;

  // Filtres
  searchTerm: string = '';
  selectedCategory: string = '';

  constructor(
    public userService: UserService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = '';

    const filters: ProductFilters = {
      search: this.searchTerm,
      category: this.selectedCategory,
      page: this.currentPage,
      limit: this.itemsPerPage,
    };

    this.productService.getProducts(filters).subscribe({
      next: (response) => {
        this.products = response.products;
        this.totalItems = response.total;
        this.totalPages = response.totalPages;
        this.currentPage = response.page;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des produits:', error);
        this.error = 'Erreur lors du chargement des produits';
        this.loading = false;
      },
    });
  }

  onSearchChange(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.currentPage = 1;
    this.loadProducts();
  }

  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    this.currentPage = 1;
    this.loadProducts();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadProducts();
  }

  onAddToCart(product: Product): void {
    // TODO: Implémenter l'ajout au panier
    console.log('Ajouter au panier:', product);
  }
}
