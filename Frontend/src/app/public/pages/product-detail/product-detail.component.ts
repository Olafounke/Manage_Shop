import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.interface';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss',
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  loading: boolean = false;
  error: string = '';
  selectedImageIndex: number = 0;
  quantity: number = 1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.loadProduct();
  }

  loadProduct(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (!productId) {
      this.router.navigate(['/']);
      return;
    }

    this.loading = true;
    this.error = '';

    this.productService.getProductById(productId).subscribe({
      next: (product) => {
        this.product = product;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du produit:', error);
        this.error = 'Produit non trouvé';
        this.loading = false;
      },
    });
  }

  selectImage(index: number): void {
    this.selectedImageIndex = index;
  }

  increaseQuantity(): void {
    this.quantity++;
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  onQuantityChange(event: Event): void {
    const value = parseInt((event.target as HTMLInputElement).value);
    if (value > 0) {
      this.quantity = value;
    }
  }

  addToCart(): void {
    if (this.product) {
      // TODO: Implémenter l'ajout au panier
      console.log(
        'Ajouter au panier:',
        this.product,
        'Quantité:',
        this.quantity
      );
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  }

  getSelectedImage(): string {
    if (
      !this.product ||
      !this.product.images ||
      this.product.images.length === 0
    ) {
      return 'assets/images/default-product.jpg';
    }
    return (
      this.product.images[this.selectedImageIndex] || this.product.images[0]
    );
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
