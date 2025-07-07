import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CartService } from '../../../../core/services/cart.service';
import { OrderService } from '../../../../core/services/order.service';
import { Cart, UserAddress } from '../../../../core/models';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonComponent,
    ModalComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent implements OnInit {
  cart: Cart | null = null;
  loading = false;
  error: string | null = null;
  addressForm: FormGroup;
  showAddressModal = false;
  checkoutLoading = false;

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private fb: FormBuilder
  ) {
    this.addressForm = this.fb.group({
      street: ['', [Validators.required, Validators.minLength(5)]],
      city: ['', [Validators.required, Validators.minLength(2)]],
      postalCode: ['', [Validators.required, Validators.pattern(/^[0-9]{5}$/)]],
      country: ['France', [Validators.required, Validators.minLength(2)]],
    });
  }

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
    if (!this.showAddressModal) {
      this.showAddressModal = true;
      return;
    }

    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      this.error = "Veuillez remplir tous les champs d'adresse correctement";
      return;
    }

    this.checkoutLoading = true;
    this.error = null;

    const userAddress: UserAddress = this.addressForm.value;

    this.orderService.createCheckoutSession(userAddress).subscribe({
      next: (checkoutSession) => {
        window.location.href = checkoutSession.url;
      },
      error: (error) => {
        this.error = 'Erreur lors de la création de la session de paiement';
        this.checkoutLoading = false;
        console.error('Erreur checkout:', error);
      },
    });
  }

  cancelAddressModal(): void {
    this.showAddressModal = false;
    this.addressForm.reset({
      street: '',
      city: '',
      postalCode: '',
      country: 'France',
    });
    this.error = null;
  }

  getTotalItems(): number {
    if (!this.cart?.items) return 0;
    return this.cart.items.reduce((total, item) => total + item.quantity, 0);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  }

  isCartEmpty(): boolean {
    return !this.cart?.items || this.cart.items.length === 0;
  }
}
