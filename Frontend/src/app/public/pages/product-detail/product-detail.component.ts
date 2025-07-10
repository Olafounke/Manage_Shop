import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { Product } from '../../../core/models/product.interface';
import { AddToCartRequest } from '../../../core/models/cart.interface';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ButtonConfig } from '../../../core/models/button.interface';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule, ButtonComponent],
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
  successMessage: string = '';
  stockError: string = '';

  // Configuration du bouton d'ajout au panier
  addToCartButtonConfig: ButtonConfig = {
    style: 'save',
    type: 'button',
    size: 'medium',
    display: 'icon+text',
    text: 'Ajouter au panier',
    icon: 'shopping_cart',
    disabled: false,
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService
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
        this.updateButtonConfig();
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
    if (this.product && this.product.totalInventory) {
      if (this.quantity < this.product.totalInventory) {
        this.quantity++;
        this.clearMessages();
        this.updateButtonConfig();
      } else {
        this.stockError = `Stock limité : ${this.product.totalInventory} articles disponibles`;
      }
    } else {
      this.quantity++;
      this.updateButtonConfig();
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
      this.clearMessages();
      this.updateButtonConfig();
    }
  }

  onQuantityChange(event: Event): void {
    const value = parseInt((event.target as HTMLInputElement).value);
    if (value > 0) {
      if (
        this.product &&
        this.product.totalInventory &&
        value > this.product.totalInventory
      ) {
        this.quantity = this.product.totalInventory;
        this.stockError = `Stock limité : ${this.product.totalInventory} articles disponibles`;
      } else {
        this.quantity = value;
        this.clearMessages();
      }
      this.updateButtonConfig();
    }
  }

  addToCart(): void {
    if (!this.product) {
      return;
    }

    // Vérification du stock
    if (
      this.product.totalInventory &&
      this.quantity > this.product.totalInventory
    ) {
      this.stockError = `Stock insuffisant. Maximum ${this.product.totalInventory} articles disponibles.`;
      return;
    }

    const addToCartRequest: AddToCartRequest = {
      productId: this.product._id,
      productName: this.product.name,
      quantity: this.quantity,
      price: this.product.price,
    };

    this.cartService.addToCart(addToCartRequest).subscribe({
      next: (cart) => {
        console.log('Produit ajouté au panier avec succès:', cart);
        this.successMessage = `${this.quantity} article(s) ajouté(s) au panier avec succès !`;
        setTimeout(() => {
          this.clearMessages();
        }, 3000);
      },
      error: (error) => {
        console.error("Erreur lors de l'ajout au panier:", error);
        this.error = "Erreur lors de l'ajout au panier. Veuillez réessayer.";
      },
    });
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
      return 'assets/images/default-product.png';
    }
    return (
      this.product.images[this.selectedImageIndex] || this.product.images[0]
    );
  }

  getCategoryName(category: any): string {
    return typeof category === 'string'
      ? category
      : category && category.name
      ? category.name
      : '';
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  private clearMessages(): void {
    this.successMessage = '';
    this.stockError = '';
  }

  private updateButtonConfig(): void {
    if (this.product) {
      this.addToCartButtonConfig = {
        ...this.addToCartButtonConfig,
        text: `Ajouter au panier (${this.quantity})`,
        disabled: false,
      };
    }
  }

  onAddToCartClick(): void {
    this.addToCart();
  }
}
