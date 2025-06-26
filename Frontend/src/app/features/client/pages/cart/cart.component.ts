import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  CartService,
  Cart,
  CartItem,
} from '../../../../core/services/cart.service';
import { OrderService } from '../../../../core/services/order.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { ButtonConfig } from '../../../../core/models/button.interface';
import { CheckoutComponent } from '../../components/checkout/checkout.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent, CheckoutComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent implements OnInit {
  cart: Cart | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private cartService: CartService,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.loading = true;
    this.error = null;

    this.cartService.getUserCart().subscribe({
      next: (cart) => {
        this.cart = cart;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement du panier';
        this.loading = false;
        console.error('Erreur chargement panier:', error);
      },
    });
  }

  updateQuantity(productId: string, newQuantity: number): void {
    if (newQuantity <= 0) {
      this.removeItem(productId);
      return;
    }

    this.cartService
      .updateCartItem(productId, { quantity: newQuantity })
      .subscribe({
        next: (updatedCart) => {
          this.cart = updatedCart;
        },
        error: (error) => {
          this.error = 'Erreur lors de la mise à jour de la quantité';
          console.error('Erreur mise à jour quantité:', error);
        },
      });
  }

  removeItem(productId: string): void {
    this.cartService.removeFromCart(productId).subscribe({
      next: (updatedCart) => {
        this.cart = updatedCart;
      },
      error: (error) => {
        this.error = 'Erreur lors de la suppression du produit';
        console.error('Erreur suppression produit:', error);
      },
    });
  }

  clearCart(): void {
    this.cartService.clearCart().subscribe({
      next: (updatedCart) => {
        this.cart = updatedCart;
      },
      error: (error) => {
        this.error = 'Erreur lors du vidage du panier';
        console.error('Erreur vidage panier:', error);
      },
    });
  }

  proceedToCheckout(): void {
    this.loading = true;
    this.error = null;

    this.orderService.createCheckoutSession().subscribe({
      next: (checkoutSession) => {
        // Rediriger vers l'URL de checkout
        window.location.href = checkoutSession.url;
      },
      error: (error) => {
        this.error = 'Erreur lors de la création de la session de paiement';
        this.loading = false;
        console.error('Erreur checkout:', error);
      },
    });
  }

  getTotalItems(): number {
    if (!this.cart?.items) return 0;
    return this.cart.items.reduce((total, item) => total + item.quantity, 0);
  }

  // Configuration des boutons
  getRetryButtonConfig(): ButtonConfig {
    return {
      style: 'default',
      type: 'button',
      size: 'medium',
      display: 'text',
      text: 'Réessayer',
    };
  }

  getContinueShoppingButtonConfig(): ButtonConfig {
    return {
      style: 'default',
      type: 'button',
      size: 'medium',
      display: 'text',
      text: 'Continuer les achats',
    };
  }

  getClearCartButtonConfig(): ButtonConfig {
    return {
      style: 'delete',
      type: 'button',
      size: 'medium',
      display: 'text',
      text: 'Vider le panier',
      disabled: this.loading,
    };
  }

  getCheckoutButtonConfig(): ButtonConfig {
    return {
      style: 'save',
      type: 'button',
      size: 'medium',
      display: 'text',
      text: 'Procéder au paiement',
      disabled: this.loading,
    };
  }
}
